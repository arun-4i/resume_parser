import { z } from "zod";

export const createUserProfileSchema = z.object({
  userId: z.number(),
  avatar: z.string().url().optional().nullable(),
  bio: z.string().optional().nullable(),
  phone: z
    .string()
    .regex(/^\+[1-9]\d{1,14}$/)
    .optional()
    .nullable(), // E.164 phone number format
  dateOfBirth: z.coerce.date().optional().nullable(),
  address: z.string().optional().nullable(),
  preferences: z.record(z.any()).optional().nullable(),
  socialLinks: z.record(z.any()).optional().nullable(),
  isPublic: z.boolean().optional(),
});

export const updateUserProfileSchema = createUserProfileSchema
  .partial()
  .omit({ userId: true });
