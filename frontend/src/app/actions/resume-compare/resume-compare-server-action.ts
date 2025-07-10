"use server";

import { axiosInstance } from "@/api/axios";
import { z } from "zod";

// Zod schema for form validation
const ResumeCompareSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  resume: z
    .instanceof(File)
    .refine((file) => file.size > 0, "Please select a resume file")
    .refine(
      (file) =>
        [
          "application/pdf",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ].includes(file.type),
      "Only PDF and DOCX files are allowed"
    )
    .refine(
      (file) => file.size <= 10 * 1024 * 1024, // 10MB limit
      "File size must be less than 10MB"
    ),
  jobDescription: z
    .string()
    .min(1, "Job description is required")
    .min(10, "Job description must be at least 10 characters")
    .max(5000, "Job description must be less than 5000 characters"),
});

export type ResumeCompareFormData = z.infer<typeof ResumeCompareSchema>;

export interface ResumeCompareResult {
  success: boolean;
  data: {
    email?: string;
    rating?: string;
    content?: string;
  };

  error?: string;
}

export async function resumeCompareServerAction(
  formData: FormData
): Promise<ResumeCompareResult> {
  try {
    const email = formData.get("email") as string;
    const resume = formData.get("resume") as File;
    const jobDescription = formData.get("jobDescription") as string;

    // Validate input using Zod
    const validationResult = ResumeCompareSchema.safeParse({
      email,
      resume,
      jobDescription,
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      return {
        success: false,
        error: firstError.message,
      };
    }

    // Prepare FormData for API call
    const apiFormData = new FormData();
    apiFormData.append("email", email);
    apiFormData.append("file", resume);
    apiFormData.append("jobDescription", jobDescription);

    // console.log("FORMDATA: ", apiFormData);
    // Call the API endpoint
    const response = await axiosInstance.post("/resume/summary", apiFormData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    // console.log("RESPONSE: ", response.data);
    return response.data;
  } catch (error) {
    console.error("Resume compare server action error:", error);

    // Handle different error types
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: "An unexpected error occurred while processing your request",
    };
  }
}
