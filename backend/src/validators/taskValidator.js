import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(150, 'Title cannot exceed 150 characters').trim(),
  description: z.string().max(1000, 'Description cannot exceed 1000 characters').optional().default(''),
  priority: z.enum(['low', 'medium', 'high']).optional().default('medium'),
  dueDate: z.string().nullable().optional(),
  assignedTo: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB User ID').nullable().optional(),
  status: z.enum(['todo', 'in-progress', 'review', 'done']).optional().default('todo'),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(150, 'Title cannot exceed 150 characters').trim().optional(),
  description: z.string().max(1000, 'Description cannot exceed 1000 characters').optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  dueDate: z.string().nullable().optional(),
  assignedTo: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB User ID').nullable().optional(),
  status: z.enum(['todo', 'in-progress', 'review', 'done']).optional(),
  position: z.number().optional(),
});

export const createCommentSchema = z.object({
  text: z.string().min(1, 'Comment text is required').max(500, 'Comment cannot exceed 500 characters').trim(),
});
