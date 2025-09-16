import { z } from 'zod';

/**
 * Validation schema for user registration
 */
export const registerValidationSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters long')
    .max(32, 'Username must not exceed 32 characters')
    .regex(/^\S+$/, 'Username cannot contain whitespace characters')
    .trim(),
  
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'Password must contain at least one special character')
});

/**
 * Validation schema for user login
 */
export const loginValidationSchema = z.object({
  username: z
    .string()
    .min(1, 'Username is required')
    .trim(),
  
  password: z
    .string()
    .min(1, 'Password is required')
});

/**
 * Type inferred from the registration validation schema
 */
export type RegisterValidationInput = z.infer<typeof registerValidationSchema>;

/**
 * Type inferred from the login validation schema
 */
export type LoginValidationInput = z.infer<typeof loginValidationSchema>;
