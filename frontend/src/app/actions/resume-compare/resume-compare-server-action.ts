"use server";

import { axiosInstance } from "@/api/axios";
import {
  ResumeCompareServerSchema,
  type ResumeCompareResult,
} from "@/lib/schemas";

export async function resumeCompareServerAction(
  formData: FormData
): Promise<ResumeCompareResult> {
  try {
    const firstName = formData.get("firstName") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const resume = formData.get("resume") as File;
    const jobDescription = formData.get("jobDescription") as string;

    // Validate input using centralized Zod schema
    const validationResult = ResumeCompareServerSchema.safeParse({
      email,
      resume,
      jobDescription,
      phone,
      firstName
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
    apiFormData.append("firstName", firstName);
    apiFormData.append("email", email);
    apiFormData.append("phone", phone);
    apiFormData.append("file", resume);
    apiFormData.append("jobDescription", jobDescription);

    // Call the API endpoint
    const response = await axiosInstance.post("/resume/summary", apiFormData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("response", response.data);
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
