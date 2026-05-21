import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    identifier: z.string().min(1, { message: 'Username or NIP is required' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
  }),
});

export type LoginInput = z.infer<typeof loginSchema>['body'];
