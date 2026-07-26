import { z } from 'zod';

export const registerSchema = z.object({
  ownerName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().min(10),
  restaurantName: z.string().min(2),
  address: z.string().min(5),
  cuisine: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
