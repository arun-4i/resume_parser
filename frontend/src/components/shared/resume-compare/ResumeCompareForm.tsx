"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  resumeCompareServerAction,
  type ResumeCompareResult,
} from "@/app/actions/resume-compare/resume-compare-server-action";

// Form validation schema with email field
const ResumeCompareFormSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  resume: z
    .instanceof(FileList)
    .refine(
      (files: FileList) => files.length > 0,
      "Please select a resume file"
    )
    .refine(
      (files: FileList) =>
        [
          "application/pdf",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ].includes(files[0].type),
      "Only PDF and DOCX files are allowed"
    )
    .refine(
      (files: FileList) => files[0].size <= 10 * 1024 * 1024, // 10MB limit
      "File size must be less than 10MB"
    ),
  jobDescription: z
    .string()
    .min(1, "Job description is required")
    .min(10, "Job description must be at least 10 characters")
    .max(5000, "Job description must be less than 5000 characters"),
});

type ResumeCompareFormData = {
  email: string;
  resume: FileList;
  jobDescription: string;
};

interface ResumeCompareFormProps {
  onSubmitStart: () => void;
  onSubmit: (result: ResumeCompareResult) => void;
  onError: (error: string) => void;
  onReset?: () => void;
}

export default function ResumeCompareForm({
  onSubmitStart,
  onSubmit,
  onError,
  onReset,
}: Readonly<ResumeCompareFormProps>) {
  const [isPending, startTransition] = useTransition();
  const [dragActive, setDragActive] = useState(false);

  const form = useForm<ResumeCompareFormData>({
    resolver: zodResolver(ResumeCompareFormSchema),
    defaultValues: {
      email: "",
      jobDescription: "",
    },
  });

  const handleSubmit = async (data: ResumeCompareFormData) => {
    onSubmitStart(); // Call this immediately when form starts submitting

    startTransition(async () => {
      const formData = new FormData();
      formData.append("email", data.email);
      formData.append("resume", data.resume[0]); // Extract the first file
      formData.append("jobDescription", data.jobDescription);

      const result = await resumeCompareServerAction(formData);

      if (result.success && result.data?.content) {
        onSubmit(result);
      } else {
        onError(result.error ?? "An unexpected error occurred");
      }
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files?.[0]) {
      const file = e.dataTransfer.files[0];
      const fileList = new DataTransfer();
      fileList.items.add(file);
      form.setValue("resume", fileList.files);
    }
  };

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="text-center flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex-1" />
          <CardTitle className="text-2xl font-bold">
            Resume Comparison
          </CardTitle>
          <div className="flex-1 flex justify-end">
            {onReset && (
              <button
                type="button"
                onClick={() => {
                  form.reset({
                    email: "",
                    jobDescription: "",
                  });
                  onReset();
                }}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
                title="Reset form"
              >
                <svg
                  className="w-4 h-4 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
        <CardDescription>
          Upload your resume and provide a job description to get personalized
          feedback
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 flex-1 flex flex-col"
          >
            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="your.email@example.com"
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* File Upload Field - Made smaller */}
            <FormField
              control={form.control}
              name="resume"
              render={({ field: { onChange, value, ...field } }) => (
                <FormItem>
                  <FormLabel>Resume Upload</FormLabel>
                  <FormControl>
                    <button
                      type="button"
                      tabIndex={0}
                      className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                        dragActive
                          ? "border-primary bg-primary/10"
                          : "border-muted-foreground/25 hover:border-primary/50"
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      aria-label="Upload resume"
                    >
                      <Input
                        {...field}
                        type="file"
                        accept=".pdf,.docx"
                        onChange={(e) => onChange(e.target.files)}
                        className="hidden"
                        id="resume-upload"
                        disabled={isPending}
                      />
                      <Label
                        htmlFor="resume-upload"
                        className="cursor-pointer flex flex-col items-center space-y-2"
                      >
                        <div className="flex flex-col items-center space-y-1">
                          <svg
                            className="w-6 h-6 text-muted-foreground"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                          </svg>
                          <span className="text-sm font-medium">
                            {value && value.length > 0
                              ? value[0].name
                              : "Click to upload or drag and drop"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            PDF or DOCX (max 10MB)
                          </span>
                        </div>
                      </Label>
                    </button>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Job Description Field - Takes remaining height */}
            <FormField
              control={form.control}
              name="jobDescription"
              render={({ field }) => (
                <FormItem className="flex-1 flex flex-col p-2 rounded-md border-2">
                  <FormLabel>Job Description</FormLabel>
                  <FormControl className="">
                    <Textarea
                      {...field}
                      placeholder="Paste the job description here..."
                      className="h-[150px] overflow-auto rounded-none scroll-auto border-none"
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isPending}
              className="w-full flex-shrink-0"
              size="lg"
            >
              {isPending ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Analysing...
                </>
              ) : (
                "Compare Resume"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
