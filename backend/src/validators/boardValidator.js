import { z } from 'zod';

export const createBoardSchema = z.object({
  title: z.string().min(1, 'Board title is required').max(100, 'Title cannot exceed 100 characters').trim(),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional().default(''),
});

export const inviteMemberSchema = z.object({
  email: z.string().email('Invalid email address').trim().toLowerCase(),
});
