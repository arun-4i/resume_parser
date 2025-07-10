"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface ResumeCompareLayoutProps {
  children: ReactNode;
  isSubmitted: boolean;
  formComponent: ReactNode;
  chatComponent?: ReactNode;
}

export default function ResumeCompareLayout({
  children,
  isSubmitted,
  formComponent,
  chatComponent,
}: Readonly<ResumeCompareLayoutProps>) {
  return (
    <div className="h-screen overflow-hidden bg-background">
      {/* Mobile: Grid layout */}
      <div className="grid grid-rows-2 lg:hidden h-full">
        {/* Form at top on mobile */}
        <motion.div
          animate={{
            height: isSubmitted ? "50%" : "100%",
          }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="border-b border-border bg-muted/20 p-4 overflow-hidden"
        >
          <div className="h-full flex items-center justify-center">
            <div className="w-full max-w-2xl h-full max-h-[90vh] flex flex-col">
              {formComponent}
            </div>
          </div>
        </motion.div>

        {/* Chat below form on mobile */}
        <motion.div
          initial={{ y: "100%" }}
          animate={{
            y: isSubmitted ? 0 : "100%",
            opacity: isSubmitted ? 1 : 0,
          }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="p-4 overflow-hidden"
        >
          <div className="h-full overflow-y-auto">{chatComponent}</div>
        </motion.div>
      </div>

      {/* Desktop: Side by side */}
      <div className="hidden lg:flex h-full">
        {/* Form - slides from center to left */}
        <motion.div
          animate={{
            x: isSubmitted ? 0 : "calc(50vw - 256px)",
            width: isSubmitted ? "384px" : "512px",
          }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="flex-shrink-0 border-r border-border bg-muted/20 p-6 overflow-hidden"
        >
          <div className="h-full flex items-center justify-center">
            <div className="w-full max-w-2xl h-full max-h-[90vh] flex flex-col">
              {formComponent}
            </div>
          </div>
        </motion.div>

        {/* Chat takes remaining space on desktop */}
        <motion.div
          initial={{ y: "100vh" }}
          animate={{
            y: isSubmitted ? 0 : "100vh",
            opacity: isSubmitted ? 1 : 0,
          }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="flex-1 p-6 overflow-hidden"
        >
          <div className="h-full overflow-y-auto">{chatComponent}</div>
        </motion.div>
      </div>

      {/* Background children */}
      {children}
    </div>
  );
}
