import Stripe from 'stripe';
import config from '../config';

export const stripe = new Stripe(config.stripe.secret_key, {
  apiVersion: '2026-09-30.endive',
});
