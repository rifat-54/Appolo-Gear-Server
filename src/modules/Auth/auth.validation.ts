import { z } from 'zod';

const registerValidationSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['admin', 'user', 'driver']).optional(),
    img: z.string().url('Invalid image URL').optional().or(z.literal('')),
  }),
});

const loginValidationSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

const refreshTokenValidationSchema = z
  .object({
    cookies: z
      .object({
        refreshToken: z.string().optional(),
      })
      .optional(),
    body: z
      .object({
        refreshToken: z.string().optional(),
      })
      .optional(),
  })
  .refine(
    (data) => Boolean(data.cookies?.refreshToken || data.body?.refreshToken),
    {
      message: 'Refresh token is required in cookies or body!',
    }
  );

export const AuthValidation = {
  registerValidationSchema,
  loginValidationSchema,
  refreshTokenValidationSchema,
};