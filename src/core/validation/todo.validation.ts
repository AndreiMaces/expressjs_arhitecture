import { z } from 'zod';

/**
 * Validation schema for todo item
 */
export const todoValidationSchema = z.object({
  title: z
    .string()
    .min(2, 'Title must be at least 2 characters long')
    .max(128, 'Title must not exceed 128 characters')
    .trim(),
  
  description: z
    .string()
    .max(1024, 'Description must not exceed 1024 characters')
    .optional()
    .transform(val => val?.trim())
});

/**
 * Type inferred from the validation schema
 */
export type TodoValidationInput = z.infer<typeof todoValidationSchema>;
