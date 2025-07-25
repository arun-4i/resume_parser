"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import ResumeCompareAvatar from "./ResumeCompareAvatar";

interface ResumeCompareChatProps {
  content: string;
  error?: string;
  isLoading?: boolean;
}

export default function ResumeCompareChat({
  content,
  error,
  isLoading = false,
}: Readonly<ResumeCompareChatProps>) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  // Refs for autoscroll functionality
  const chatEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [userHasScrolled, setUserHasScrolled] = useState(false);

  // Split content into lines for line-by-line rendering
  const lines = content.split("\n").filter((line) => line.trim() !== "");

  // Auto-scroll logic - scroll to bottom as content appears
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Check if user is near bottom of scroll area
  const isNearBottom = () => {
    if (!containerRef.current) return true;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    return scrollHeight - scrollTop - clientHeight < 100; // Within 100px of bottom
  };

  // Handle scroll events to detect user scrolling
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 10;
    setUserHasScrolled(!isAtBottom);
  };

  // Auto-scroll effect - scroll when text updates if user hasn't scrolled up
  useEffect(() => {
    if (!isTypingComplete && (!userHasScrolled || isNearBottom())) {
      scrollToBottom();
    }
  }, [displayedText, isTypingComplete, userHasScrolled]);

  // Reset scroll state when new content starts
  useEffect(() => {
    setUserHasScrolled(false);
  }, [content]);

  useEffect(() => {
    if (error) {
      setDisplayedText("");
      setIsTypingComplete(true);
      return;
    }

    if (lines.length === 0) return;

    const typeText = () => {
      if (currentLineIndex >= lines.length) {
        setIsTypingComplete(true);
        return;
      }

      const currentLine = lines[currentLineIndex];

      if (currentCharIndex < currentLine.length) {
        // Type character by character
        setDisplayedText(() => {
          const linesBeforeCurrent = lines
            .slice(0, currentLineIndex)
            .join("\n");
          const currentPartialLine = currentLine.slice(0, currentCharIndex + 1);
          return currentLineIndex > 0
            ? linesBeforeCurrent + "\n" + currentPartialLine
            : currentPartialLine;
        });
        setCurrentCharIndex((prev) => prev + 1);
      } else {
        // Move to next line
        setCurrentLineIndex((prev) => prev + 1);
        setCurrentCharIndex(0);

        // Add a pause between lines
        setTimeout(() => {
          if (currentLineIndex + 1 < lines.length) {
            setDisplayedText((text) => text + "\n");
          }
        }, 10); // 10ms pause between lines
      }
    };

    const timer = setTimeout(typeText, 0.5); // 2ms per character
    return () => clearTimeout(timer);
  }, [currentLineIndex, currentCharIndex, lines, error]);

  // Reset animation when content changes
  useEffect(() => {
    setDisplayedText("");
    setCurrentLineIndex(0);
    setCurrentCharIndex(0);
    setIsTypingComplete(false);
  }, [content]);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl mx-auto"
      >
        <Card className="">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <ResumeCompareAvatar className="mt-1 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-muted-foreground mb-3">
                  Resume Analysis
                </div>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl mx-auto"
      >
        <Card className="border-destructive">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <ResumeCompareAvatar className="mt-1 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-destructive font-medium mb-2">
                  Oops! Something went wrong
                </div>
                <div className="text-sm text-muted-foreground">{error}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="w-full max-w-4xl mx-auto"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <ResumeCompareAvatar className="mt-1 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-muted-foreground mb-3">
                  Resume Analysis
                </div>

                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <motion.div
                    key={displayedText}
                    className="text-sm leading-relaxed break-words overflow-wrap-break-word"
                    style={{
                      overflowWrap: "break-word",
                      wordBreak: "break-word",
                    }}
                  >
                    {displayedText.split("\n").map((line, index) => (
                      <div key={index}>
                        {line}
                        {index < displayedText.split("\n").length - 1 && <br />}
                      </div>
                    ))}

                    {/* Typing cursor */}
                    <AnimatePresence>
                      {!isTypingComplete && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: [0, 1, 0] }}
                          exit={{ opacity: 0 }}
                          transition={{
                            duration: 0.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                          className="inline-block w-0.5 h-4 bg-primary ml-0.5 align-middle"
                        />
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>

                {/* Completion indicator */}
                <AnimatePresence>
                  {isTypingComplete && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                      className="flex items-center space-x-2 mt-4 pt-4 border-t mb-4"
                    >
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-muted-foreground">
                        Analysis complete
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invisible element to scroll to */}
        <div ref={chatEndRef} className="h-1" />
      </motion.div>
    </div>
  );
}
