import { z } from 'zod';

const createBidValidationSchema = z.object({
  body: z.object({
    rentId: z.string().min(1, 'Rent ID is required'),
    bidAmount: z.number().positive('Bid amount must be a positive number'),
    driverLocation: z.string().min(1, 'Driver location is required'),
  }),
});

const updateBidValidationSchema = z.object({
  body: z.object({
    bidStatus: z.enum(['accepted', 'pending', 'rejected']).optional(),
    bidAmount: z
      .number()
      .positive('Bid amount must be a positive number')
      .optional(),
    driverLocation: z
      .string()
      .min(1, 'Driver location must not be empty')
      .optional(),
  }),
});

export const BidValidation = {
  createBidValidationSchema,
  updateBidValidationSchema,
};
