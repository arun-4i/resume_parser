"use client";

import React, { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RotateCcw, Plus, Loader2, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { resumeCompareServerAction } from "@/app/actions/resume-compare/resume-compare-server-action";
import {
  ResumeCompareFormSchema,
  type ResumeCompareFormData,
  type ResumeCompareResult,
  ALLOWED_FILE_TYPES,
} from "@/lib/schemas";
import { useUserInfoStore } from "@/store/userInfoStore";

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
  const userInfo = useUserInfoStore((s) => s.userInfo);
  const clearUserInfo = useUserInfoStore((s) => s.clearUserInfo);

  const form = useForm<ResumeCompareFormData>({
    resolver: zodResolver(ResumeCompareFormSchema),
    defaultValues: {
      resume: null,
      jobDescription: "",
    },
    mode: "onSubmit",
  });

  const handleSubmit = async (data: ResumeCompareFormData) => {
    onSubmitStart();

    startTransition(async () => {
      const resumeFiles = data.resume;
      if (!resumeFiles || resumeFiles.length === 0) {
        onError("Please select a resume file");
        return;
      }
      if (!userInfo) {
        onError(
          "User info is missing. Please refresh and fill the details again."
        );
        return;
      }
      try {
        const formData = new FormData();
        formData.append("firstName", userInfo.firstName);
        formData.append("email", userInfo.email);
        formData.append("phone", userInfo.phone);
        formData.append("resume", resumeFiles[0]);
        formData.append("jobDescription", data.jobDescription);

        const result = await resumeCompareServerAction(formData);

        if (result.success && result.data) {
          form.reset(data);
          clearUserInfo();
          onSubmit(result);
        } else {
          onError(result.error ?? "An unexpected error occurred");
        }
      } catch (error) {
        onError(
          error instanceof Error
            ? error.message
            : "An unexpected error occurred"
        );
      }
    });
  };

  // Get selected file info for display
  const selectedFile = form.watch("resume");
  const fileName =
    selectedFile && selectedFile.length > 0 ? selectedFile[0].name : null;
  const fileSize =
    selectedFile && selectedFile.length > 0
      ? (selectedFile[0].size / (1024 * 1024)).toFixed(1) + "MB"
      : null;

  const jobDescription = form.watch("jobDescription");

  // Check validation requirements directly
  const isJobDescriptionValid = jobDescription.trim().length >= 10;
  const isFileValid = selectedFile && selectedFile.length > 0;
  const { errors } = form.formState;

  const isFormValid =
    isJobDescriptionValid && isFileValid && Object.keys(errors).length === 0;

  // Clear file validation errors when file is selected
  React.useEffect(() => {
    if (selectedFile && selectedFile.length > 0) {
      form.clearErrors("resume");
    }
  }, [selectedFile, form]);

  // Generate accept attribute from allowed file types
  const acceptedFileTypes = ALLOWED_FILE_TYPES.map((type) => {
    if (type === "application/pdf") return ".pdf";
    if (
      type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )
      return ".docx";
    return "";
  })
    .filter(Boolean)
    .join(",");

  return (
    <div className="w-full">
      {/* File upload badge - using shadcn Badge component */}
      {fileName && (
        <div className="mb-2 flex items-center justify-start">
          <Badge
            variant="secondary"
            className="flex items-center space-x-1.5 pr-1"
          >
            <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
            <div className="flex items-center space-x-1 min-w-0">
              <span className="font-medium truncate max-w-[150px]">
                {fileName}
              </span>
              <span className="text-muted-foreground">({fileSize})</span>
            </div>
            <button
              type="button"
              onClick={() => form.setValue("resume", null)}
              className="hover:bg-muted rounded-full p-0.5 transition-colors flex-shrink-0 ml-1"
              title="Remove file"
              aria-label="Remove uploaded file"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </Badge>
        </div>
      )}

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="bg-muted border border-border rounded-md"
        >
          {/* Hidden file input */}
          <FormField
            control={form.control}
            name="resume"
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            render={({ field: { onChange, value: _value, ...field } }) => (
              <FormItem className="hidden">
                <FormControl>
                  <Input
                    {...field}
                    type="file"
                    accept={acceptedFileTypes}
                    onChange={(e) => {
                      onChange(e.target.files);
                      // Clear any previous errors when file is selected
                      if (e.target.files && e.target.files.length > 0) {
                        form.clearErrors("resume");
                      }
                    }}
                    id="resume-upload-hidden"
                    disabled={isPending}
                    aria-label="Upload resume file"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* First section: Scrollable textarea */}
          <div className="">
            <FormField
              control={form.control}
              name="jobDescription"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Describe the job requirements..."
                      className="shadow-none dark:bg-transparent bg-transparent min-h-[50px] max-h-[120px] border-none border-transparent focus-visible:ring-0 resize-none px-3 py-4 text-base leading-relaxed custom-scrollbar duration-200 overflow-y-auto"
                      style={{
                        wordWrap: "break-word",
                        overflowWrap: "break-word",
                        whiteSpace: "pre-wrap",
                      }}
                      disabled={isPending}
                      aria-label="Job description input"
                    />
                  </FormControl>
                  <FormMessage className="text-xs mt-1 px-3" />
                </FormItem>
              )}
            />
          </div>

          {/* Second section: Bottom strip with upload,reset and submit buttons */}
          <div className=" px-3 py-2  flex items-center justify-between">
            {/* Left side: Plus button and Reset button */}
            <div className="flex items-center space-x-2">
              <Label htmlFor="resume-upload-hidden" className="cursor-pointer">
                <Button
                  type="button"
                  variant={fileName ? "secondary" : "ghost"}
                  size="sm"
                  className="h-8 w-8 p-0 rounded-md"
                  asChild
                >
                  <div className="flex items-center justify-center">
                    <Plus className="h-4 w-4" />
                    <span className="sr-only">Upload resume file</span>
                  </div>
                </Button>
              </Label>

              {onReset && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    form.reset({
                      resume: null,
                      jobDescription: "",
                    });
                    onReset();
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center space-x-1 py-1 px-2 rounded-md border border-border"
                  title="Reset form"
                  aria-label="Reset form to start over"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </Button>
              )}
            </div>

            {/* Right side: Send button */}
            <Button
              type="submit"
              disabled={isPending || !isFormValid}
              size="sm"
              className="h-8 w-8 p-0 rounded-md"
              aria-label="Submit resume comparison"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
