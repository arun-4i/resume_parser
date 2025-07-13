import * as React from "react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const FloatingInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <Input
        placeholder=" "
        className={cn("peer rounded-sm", className)}
        ref={ref}
        {...props}
      />
    );
  }
);
FloatingInput.displayName = "FloatingInput";

const FloatingLabel = React.forwardRef<
  React.ElementRef<typeof Label>,
  React.ComponentPropsWithoutRef<typeof Label>
>(({ className, ...props }, ref) => {
  return (
    <Label
      className={cn(
        "rounded-sm bg-background dark:bg-secondary dark:text-white peer-focus:secondary peer-focus:dark:secondary absolute left-2 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform px-2 text-sm text-gray-500 duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-7 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:px-2 rtl:peer-focus:left-auto rtl:peer-focus:translate-x-1/4 cursor-text",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
FloatingLabel.displayName = "FloatingLabel";

type FloatingLabelInputProps = InputProps & { label?: string };

const FloatingLabelInput = React.forwardRef<
  React.ElementRef<typeof FloatingInput>,
  React.PropsWithoutRef<FloatingLabelInputProps>
>(({ id, label, ...props }, ref) => {
  return (
    <div className="relative">
      <FloatingInput ref={ref} id={id} {...props} />
      <FloatingLabel htmlFor={id}>{label}</FloatingLabel>
    </div>
  );
});
FloatingLabelInput.displayName = "FloatingLabelInput";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const FloatingTextarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <Textarea
        placeholder=" "
        className={cn("peer rounded-sm", className)}
        ref={ref}
        {...props}
      />
    );
  }
);
FloatingTextarea.displayName = "FloatingTextarea";

type FloatingLabelTextareaProps = TextareaProps & { label?: string };

const FloatingLabelTextarea = React.forwardRef<
  React.ElementRef<typeof FloatingTextarea>,
  React.PropsWithoutRef<FloatingLabelTextareaProps>
>(({ id, label, ...props }, ref) => {
  return (
    <div className="relative">
      <FloatingTextarea ref={ref} id={id} {...props} />
      <FloatingLabel htmlFor={id}>{label}</FloatingLabel>
    </div>
  );
});
FloatingLabelTextarea.displayName = "FloatingLabelTextarea";

export { FloatingInput, FloatingLabel, FloatingLabelInput, FloatingTextarea, FloatingLabelTextarea };
