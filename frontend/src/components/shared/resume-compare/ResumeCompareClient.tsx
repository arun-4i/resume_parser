"use client";

import { useState, useCallback, memo } from "react";
import { toast } from "sonner";
import ResumeCompareLayout from "./ResumeCompareLayout";
import ResumeCompareForm from "./ResumeCompareForm";
import ResumeCompareChat from "./ResumeCompareChat";

// Memoized components for performance
const MemoizedResumeCompareForm = memo(ResumeCompareForm);
const MemoizedResumeCompareChat = memo(ResumeCompareChat);

interface ResumeCompareState {
  isSubmitted: boolean;
  isLoading: boolean;
  content: string | null;
  error: string | null;
}

export default function ResumeCompareClient() {
  const [state, setState] = useState<ResumeCompareState>({
    isSubmitted: false,
    isLoading: false,
    content: null,
    error: null,
  });

  // Handle form submission start
  const handleSubmitStart = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isSubmitted: true,
      isLoading: true,
      error: null,
    }));
  }, []);

  // Handle successful form submission
  const handleSubmitSuccess = useCallback(
    (result: { success?: boolean; data?: { content?: string } }) => {
      setState({
        isSubmitted: true,
        isLoading: false,
        content: result.data?.content ?? "",
        error: null,
      });

      // Show success toast
      toast.success("Resume analysis complete!");
    },
    []
  );

  // Handle form submission error
  const handleSubmitError = useCallback((error: string) => {
    setState((prev) => ({
      ...prev,
      isLoading: false,
      error,
    }));

    // Show error toast
    toast.error(error);
  }, []);

  // Reset the form to initial state
  const handleReset = useCallback(() => {
    setState({
      isSubmitted: false,
      isLoading: false,
      content: null,
      error: null,
    });
  }, []);

  // Form component with props
  const formComponent = (
    <MemoizedResumeCompareForm
      onSubmitStart={handleSubmitStart}
      onSubmit={handleSubmitSuccess}
      onError={handleSubmitError}
      onReset={handleReset}
    />
  );

  // Chat component with props (rendered when loading, has content, or error)
  const chatComponent =
    state.isLoading || state.content || state.error ? (
      <div className="h-full">
        <MemoizedResumeCompareChat
          content={state.content ?? ""}
          error={state.error ?? undefined}
          isLoading={state.isLoading}
        />
      </div>
    ) : null;

  return (
    <ResumeCompareLayout
      isSubmitted={state.isSubmitted}
      formComponent={formComponent}
      chatComponent={chatComponent}
    >
      <></>
    </ResumeCompareLayout>
  );
}
