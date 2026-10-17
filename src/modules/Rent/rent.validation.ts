import { z } from 'zod';

const createRentValidationSchema = z.object({
  body: z.object({
    carId: z.string().min(1, 'Car ID is required'),
    startingPoint: z.string().min(1, 'Starting point is required'),
    destination: z.string().min(1, 'Destination is required'),
    rentStatus: z.enum(['pending', 'ongoing', 'completed']).optional(),
  }),
});

const updateRentValidationSchema = z.object({
  body: z.object({
    startingPoint: z
      .string()
      .min(1, 'Starting point must not be empty')
      .optional(),
    destination: z
      .string()
      .min(1, 'Destination must not be empty')
      .optional(),
    rentStatus: z.enum(['pending', 'ongoing', 'completed']).optional(),
  }),
});

export const RentValidation = {
  createRentValidationSchema,
  updateRentValidationSchema,
};
