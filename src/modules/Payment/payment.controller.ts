import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { PaymentService } from './payment.service';

/**
 * POST /api/v1/payments/checkout/:rentId
 * Creates a Stripe Checkout session and returns the redirect URL.
 */
const createCheckoutSession = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id || req.user.userId;
  const { rentId } = req.params;

  const result = await PaymentService.createCheckoutSession(rentId as string, userId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Stripe checkout session created successfully!',
    data: result,
  });
});

/**
 * POST /api/v1/payments/webhook
 * Stripe webhook — must receive raw body (no JSON parsing).
 */
const handleWebhook = catchAsync(async (req: Request, res: Response) => {
  const signature = (req.headers['stripe-signature'] ?? '') as string;

  await PaymentService.handleWebhook(req.body as Buffer, signature);

  res.status(httpStatus.OK).json({ received: true });
});

/**
 * GET /api/v1/payments/rent/:rentId
 * Get the payment record for a rent.
 */
const getPaymentByRentId = catchAsync(async (req: Request, res: Response) => {
  const authUser = {
    id: req.user.id || req.user.userId,
    role: req.user.role,
  };
  const result = await PaymentService.getPaymentByRentId(req.params.rentId as string, authUser);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payment retrieved successfully!',
    data: result,
  });
});

/**
 * GET /api/v1/payments
 * Get all payments (admin only).
 */
const getAllPayments = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.getAllPayments();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payments retrieved successfully!',
    data: result,
  });
});

export const PaymentController = {
  createCheckoutSession,
  handleWebhook,
  getPaymentByRentId,
  getAllPayments,
};
