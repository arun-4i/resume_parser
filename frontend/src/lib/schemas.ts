import { z } from "zod";

// Base schemas following validation standards
const BaseEmailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Please enter a valid email address");

const BaseTextSchema = z
  .string()
  .min(1, "This field is required")
  .transform((str) => str.trim()) // Input sanitization
  .refine((str) => str.length > 0, "This field cannot be empty");

// File validation constants
const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Base file schema for server-side validation (File object)
const BaseFileSchema = z
  .instanceof(File)
  .refine((file) => file.size > 0, "Please select a file")
  .refine(
    (file) => ALLOWED_FILE_TYPES.includes(file.type as any),
    "Only PDF and DOCX files are allowed"
  )
  .refine(
    (file) => file.size <= MAX_FILE_SIZE,
    "File size must be less than 10MB"
  );

// Base FileList schema for client-side validation (FileList object)
const BaseFileListSchema = z
  .custom<FileList | null>((data) => {
    if (typeof window === "undefined") return true;
    return data === null || data instanceof FileList;
  }, "Invalid file input")
  .refine((files) => {
    if (typeof window === "undefined") return true;
    return files && files.length > 0;
  }, "Please select a file")
  .refine((files) => {
    if (typeof window === "undefined" || !files || files.length === 0)
      return true;
    return ALLOWED_FILE_TYPES.includes(files[0].type as any);
  }, "Only PDF and DOCX files are allowed")
  .refine((files) => {
    if (typeof window === "undefined" || !files || files.length === 0)
      return true;
    return files[0].size <= MAX_FILE_SIZE;
  }, "File size must be less than 10MB");

// Job description schema with specific validation rules
const JobDescriptionSchema = z
  .string()
  .min(1, "Job description is required")
  .min(10, "Job description must be at least 10 characters")
  .max(5000, "Job description must be less than 5000 characters")
  .transform((str) => str.trim()) // Input sanitization
  .refine((str) => str.length > 0, "Job description cannot be empty");

// Resume Compare Schema - Client-side (with FileList)
export const ResumeCompareClientSchema = z.object({
  email: BaseEmailSchema,
  resume: BaseFileListSchema,
  jobDescription: JobDescriptionSchema,
});

// Resume Compare Schema - Form-specific (without email field)
export const ResumeCompareFormSchema = z.object({
  resume: BaseFileListSchema,
  jobDescription: JobDescriptionSchema,
});

// Resume Compare Schema - Server-side (with File)
export const ResumeCompareServerSchema = z.object({
  firstName: BaseTextSchema,
  phone: BaseTextSchema,
  email: BaseEmailSchema,
  resume: BaseFileSchema,
  jobDescription: JobDescriptionSchema,
});

// Type inference from schemas
export type ResumeCompareClientData = z.infer<typeof ResumeCompareClientSchema>;
export type ResumeCompareFormData = z.infer<typeof ResumeCompareFormSchema>;
export type ResumeCompareServerData = z.infer<typeof ResumeCompareServerSchema>;

// Result interface for consistent response shape
export interface ResumeCompareResult {
  success: boolean;
  data?: {
    email?: string;
    rating?: string;
    content?: string;
  };
  error?: string;
}

// Export constants for reuse
export { ALLOWED_FILE_TYPES, MAX_FILE_SIZE };
