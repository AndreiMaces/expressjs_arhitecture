import { ZodError } from 'zod';

/**
 * Formats Zod validation errors into a readable string array
 * @param error - The ZodError from a failed validation
 * @returns Array of formatted error messages
 */
export function formatValidationErrors(error: ZodError): string[] {
  return error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
}
