import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../Auth/auth.constant';
import { PaymentController } from './payment.controller';

const router = express.Router();

/**
 * Stripe webhook must receive the raw request body for signature verification.
 * It MUST be registered BEFORE express.json() parses the body, so we use
 * express.raw() here on this specific route.
 */
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  PaymentController.handleWebhook
);

/**
 * Create a Stripe Checkout Session for an ongoing rent.
 * Only authenticated users can initiate payment.
 */
router.post(
  '/checkout/:rentId',
  auth(USER_ROLE.user, USER_ROLE.admin),
  PaymentController.createCheckoutSession
);

/**
 * Get payment details for a specific rent.
 */
router.get(
  '/rent/:rentId',
  auth(USER_ROLE.user, USER_ROLE.admin, USER_ROLE.driver),
  PaymentController.getPaymentByRentId
);

/**
 * Get all payments (admin only).
 */
router.get(
  '/',
  auth(USER_ROLE.admin),
  PaymentController.getAllPayments
);

export const PaymentRoutes = router;
