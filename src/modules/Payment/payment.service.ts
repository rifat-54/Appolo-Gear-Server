import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { prisma } from '../../lib/prisma';
import { Prisma } from '../../../generated/prisma/client';
import { stripe } from '../../lib/stripe';
import config from '../../config';
import Stripe from 'stripe';

/**
 * Create a Stripe Checkout Session for a rent that is currently `ongoing`.
 * The accepted bid's amount is used as the payment amount.
 */
const createCheckoutSession = async (rentId: string, userId: string) => {
  // Fetch rent with accepted bid and user
  const rent = await prisma.rent.findUnique({
    where: { id: rentId },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
      car: true,
      bids: {
        where: { bidStatus: 'accepted' },
      },
      payment: true,
    },
  });

  if (!rent) {
    throw new AppError(httpStatus.NOT_FOUND, 'Rent request not found!');
  }

  // Only the rent owner can pay
  if (rent.userId !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You are not allowed to pay for this rent!'
    );
  }

  // Rent must be ongoing to be payable
  if (rent.rentStatus !== 'ongoing') {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Payment can only be made for ongoing rent requests!'
    );
  }

  // Prevent double payment
  if (rent.payment && rent.payment.status === 'Paid') {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'This rent has already been paid!'
    );
  }

  const acceptedBid = rent.bids[0];
  if (!acceptedBid) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'No accepted bid found for this rent. A bid must be accepted before payment.'
    );
  }

  const amountInCents = Math.round(acceptedBid.bidAmount * 100);

  // Create Stripe Checkout Session
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Car Rental – ${rent.car.name} (${rent.car.brand} ${rent.car.model})`,
            description: `From: ${rent.startingPoint} → To: ${rent.destination}`,
          },
          unit_amount: amountInCents,
        },
        quantity: 1,
      },
    ],
    customer_email: rent.user.email,
    metadata: {
      rentId: rent.id,
      userId: rent.userId,
    },
    success_url: `${config.stripe.success_url}?session_id={CHECKOUT_SESSION_ID}&rentId=${rent.id}`,
    cancel_url: `${config.stripe.cancel_url}?rentId=${rent.id}`,
  });

  // Serialise the session object for JSON storage
  const sessionData: Prisma.InputJsonValue = JSON.parse(
    JSON.stringify(session)
  ) as Prisma.InputJsonValue;

  // Upsert a pending payment record so we can track it
  await prisma.payment.upsert({
    where: { rentId: rent.id },
    create: {
      rentId: rent.id,
      transactionId: session.id,
      amount: acceptedBid.bidAmount,
      status: 'Pending',
      paymentGatewayData: sessionData,
    },
    update: {
      transactionId: session.id,
      amount: acceptedBid.bidAmount,
      status: 'Pending',
      paymentGatewayData: sessionData,
    },
  });

  return { url: session.url, sessionId: session.id };
};

/**
 * Handle Stripe webhook events.
 * Called with the raw request body (Buffer) and the Stripe-Signature header.
 */
const handleWebhook = async (rawBody: Buffer, signature: string) => {
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      config.stripe.webhook_secret
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    throw new AppError(httpStatus.BAD_REQUEST, `Webhook Error: ${message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const rentId = session.metadata?.rentId;

    if (!rentId) return;

    const sessionData: Prisma.InputJsonValue = JSON.parse(
      JSON.stringify(session)
    ) as Prisma.InputJsonValue;

    await prisma.payment.update({
      where: { rentId },
      data: {
        status: 'Paid',
        paymentGatewayData: sessionData,
      },
    });

    // Mark rent as completed
    await prisma.rent.update({
      where: { id: rentId },
      data: { rentStatus: 'completed' },
    });
  }

  if (
    event.type === 'checkout.session.expired' ||
    event.type === 'payment_intent.payment_failed'
  ) {
    const session = event.data.object as Stripe.Checkout.Session;
    const rentId = session.metadata?.rentId;

    if (!rentId) return;

    await prisma.payment.updateMany({
      where: { rentId },
      data: { status: 'Failed' },
    });
  }
};

/**
 * Get the payment record for a specific rent.
 */
const getPaymentByRentId = async (
  rentId: string,
  authUser: { id: string; role: string }
) => {
  const rent = await prisma.rent.findUnique({
    where: { id: rentId },
    include: { payment: true },
  });

  if (!rent) {
    throw new AppError(httpStatus.NOT_FOUND, 'Rent request not found!');
  }

  // Users can only see their own rent's payment
  if (authUser.role === 'user' && rent.userId !== authUser.id) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You are not allowed to view this payment!'
    );
  }

  if (!rent.payment) {
    throw new AppError(httpStatus.NOT_FOUND, 'No payment found for this rent!');
  }

  return rent.payment;
};

/**
 * Get all payments (admin only).
 */
const getAllPayments = async () => {
  const result = await prisma.payment.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      rent: {
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
          car: true,
        },
      },
    },
  });
  return result;
};

export const PaymentService = {
  createCheckoutSession,
  handleWebhook,
  getPaymentByRentId,
  getAllPayments,
};
