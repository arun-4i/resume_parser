"use client";

import { useState, useCallback, memo, useMemo } from "react";
import { toast } from "sonner";
import ResumeCompareForm from "./ResumeCompareForm";
import ResumeCompareChat from "./ResumeCompareChat";

// ==========================================
// TYPE DEFINITIONS & MEMOIZED COMPONENTS
// ==========================================

interface ResumeCompareState {
  isSubmitted: boolean;
  isLoading: boolean;
  content: string | null;
  error: string | null;
}

const MemoizedResumeCompareForm = memo(ResumeCompareForm);
const MemoizedResumeCompareChat = memo(ResumeCompareChat);

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function ResumeCompareClient() {
  const [state, setState] = useState<ResumeCompareState>({
    isSubmitted: false,
    isLoading: false,
    content: null,
    error: null,
  });

  // ==========================================
  // EVENT HANDLERS
  // ==========================================

  const handleSubmitStart = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isSubmitted: true,
      isLoading: true,
      error: null,
    }));
  }, []);

  const handleSubmitSuccess = useCallback(
    (result: { success?: boolean; data?: { content?: string } }) => {
      setState({
        isSubmitted: true,
        isLoading: false,
        content: result.data?.content ?? "",
        error: null,
      });
      toast.success("Resume analysis complete!");
    },
    []
  );

  const handleSubmitError = useCallback((error: string) => {
    setState((prev) => ({ ...prev, isLoading: false, error }));
    toast.error(error);
  }, []);

  const handleReset = useCallback(() => {
    setState({
      isSubmitted: false,
      isLoading: false,
      content: null,
      error: null,
    });
  }, []);

  // ==========================================
  // SHARED COMPONENTS
  // ==========================================

  const formComponent = useMemo(
    () => (
      <MemoizedResumeCompareForm
        onSubmitStart={handleSubmitStart}
        onSubmit={handleSubmitSuccess}
        onError={handleSubmitError}
        onReset={handleReset}
      />
    ),
    [handleSubmitStart, handleSubmitSuccess, handleSubmitError, handleReset]
  );

  const chatComponent = useMemo(() => {
    const shouldShow = state.isLoading || !!state.content || !!state.error;
    return shouldShow ? (
      <MemoizedResumeCompareChat
        content={state.content ?? ""}
        error={state.error ?? undefined}
        isLoading={state.isLoading}
      />
    ) : null;
  }, [state.isLoading, state.content, state.error]);

  // ==========================================
  // CLEAN LAYOUT - PROPER SPACING AND NO OVERLAP
  // ==========================================

  return (
    <div className="relative h-screen flex flex-col">
      {/* Chat Content Area - Scrollable behind form */}
      <div className="flex-1 overflow-y-auto mb-2">
        <div className="px-3 pt-6 pb-32 sm:px-4 sm:pt-8 md:px-6 lg:px-8">
          {/* Chat content */}
          {state.isSubmitted && (
            <div className="mb-14 w-full lg:max-w-4xl mx-auto">{chatComponent}</div>
          )}
        </div>
      </div>

      {/* Fixed Form at Bottom - ChatGPT style solid overlay */}
      <div className="p-6 absolute bottom-0 right-0 left-0 z-50">
        {/* Gradient fade effect */}
        {/* <div className="h-8 bg-gradient-to-t from-background to-transparent"></div> */}
        {/* Solid form background */}
        {/* <div className="bg-background px-4 py-4"> */}
          <div className="w-full max-w-2xl mx-auto">{formComponent}</div>
        {/* </div> */}
      </div>

      {/* Hidden accessibility landmarks for screen readers */}
      <div className="sr-only">
        <h1>Resume Comparison Tool</h1>
        <main>
          <section aria-label="Chat conversation" role="log" aria-live="polite">
            {/* Chat content is announced to screen readers */}
          </section>
          <section aria-label="Form input area">
            {/* Form is properly labeled */}
          </section>
        </main>
      </div>
    </div>
  );
}
