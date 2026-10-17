import { z } from 'zod';

const createCarValidationSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Car name is required'),
    brand: z.string().min(1, 'Brand is required'),
    model: z.string().min(1, 'Model is required'),
    image: z.string().min(1, 'Image is required'),
    rating: z.number().min(0).max(5).optional(),
    fuelType: z.enum(['Octane', 'Hybrid', 'Electric', 'Diesel', 'Petrol']),
    passengerCapacity: z
      .number()
      .int()
      .positive('Passenger capacity must be a positive integer'),
    color: z.string().min(1, 'Color is required'),
    condition: z.enum(['New', 'Used']),
  }),
});

const updateCarValidationSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Car name must not be empty').optional(),
    brand: z.string().min(1, 'Brand must not be empty').optional(),
    model: z.string().min(1, 'Model must not be empty').optional(),
    image: z.string().min(1, 'Image must not be empty').optional(),
    rating: z.number().min(0).max(5).optional(),
    fuelType: z
      .enum(['Octane', 'Hybrid', 'Electric', 'Diesel', 'Petrol'])
      .optional(),
    passengerCapacity: z
      .number()
      .int()
      .positive('Passenger capacity must be a positive integer')
      .optional(),
    color: z.string().min(1, 'Color must not be empty').optional(),
    condition: z.enum(['New', 'Used']).optional(),
  }),
});

export const CarValidation = {
  createCarValidationSchema,
  updateCarValidationSchema,
};
