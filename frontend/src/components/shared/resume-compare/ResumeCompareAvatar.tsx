"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ResumeCompareAvatarProps {
  className?: string;
}

export default function ResumeCompareAvatar({
  className,
}: Readonly<ResumeCompareAvatarProps>) {
  return (
    <Avatar className={className}>
      <AvatarFallback className="bg-primary text-primary-foreground">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5"
        >
          {/* Assistant face SVG */}
          <circle
            cx="12"
            cy="12"
            r="10"
            fill="currentColor"
            fillOpacity="0.1"
          />
          <circle
            cx="12"
            cy="12"
            r="8"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />

          {/* Eyes */}
          <circle cx="9" cy="10" r="1.5" fill="currentColor" />
          <circle cx="15" cy="10" r="1.5" fill="currentColor" />

          {/* Smile */}
          <path
            d="M8 14s1.5 2 4 2 4-2 4-2"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />

          {/* Optional: Small highlight dots in eyes */}
          <circle
            cx="9.5"
            cy="9.5"
            r="0.5"
            fill="currentColor"
            fillOpacity="0.3"
          />
          <circle
            cx="15.5"
            cy="9.5"
            r="0.5"
            fill="currentColor"
            fillOpacity="0.3"
          />
        </svg>
      </AvatarFallback>
    </Avatar>
  );
}
