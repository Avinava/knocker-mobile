import { z } from 'zod';

/**
 * Email validation schema
 */
export const emailSchema = z.string().email('Invalid email address');

/**
 * Phone validation schema
 */
export const phoneSchema = z.string().regex(
  /^[\d\s\-\(\)\+]+$/,
  'Invalid phone number format'
);

/**
 * Required string schema
 */
export const requiredString = z.string().min(1, 'This field is required');

/**
 * Login form validation
 */
export const loginSchema = z.object({
  username: requiredString,
  password: requiredString,
});

/**
 * Knock door form validation
 */
export const knockDoorSchema = z.object({
  disposition: requiredString,
  comments: z.string().optional(),
  existingRoofType: requiredString,
  existingSiding: requiredString,
  solarOnProperty: requiredString,
});

/**
 * Lead form validation
 */
export const leadSchema = z.object({
  firstName: requiredString,
  lastName: requiredString,
  email: emailSchema.optional().or(z.literal('')),
  phone: phoneSchema.optional().or(z.literal('')),
  company: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  status: requiredString,
  leadType: requiredString,
  description: z.string().optional(),
});

/**
 * Validate email
 */
export function isValidEmail(email: string): boolean {
  try {
    emailSchema.parse(email);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate phone number
 */
export function isValidPhone(phone: string): boolean {
  try {
    phoneSchema.parse(phone);
    return true;
  } catch {
    return false;
  }
}
