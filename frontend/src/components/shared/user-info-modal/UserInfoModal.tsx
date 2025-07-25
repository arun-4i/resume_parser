import React, { useEffect, useState } from "react";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from "@/components/ui/responsive-modal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FloatingLabelInput } from "@/components/ui/floatingLabel";
import { Button } from "@/components/ui/button";
import { useUserInfoStore } from "@/store/userInfoStore";
import { z } from "zod";
import { toast } from "sonner";

// Centralized Zod schema for user info
const UserInfoSchema = z.object({
  firstName: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().regex(/^\d{10}$/, "Enter a valid 10-digit phone number"),
});

type UserInfoFormData = z.infer<typeof UserInfoSchema>;

export function UserInfoModal() {
  const [open, setOpen] = useState(true);
  const setUserInfo = useUserInfoStore((s) => s.setUserInfo);
  const clearUserInfo = useUserInfoStore((s) => s.clearUserInfo);

  const form = useForm<UserInfoFormData>({
    resolver: zodResolver(UserInfoSchema),
    defaultValues: { firstName: "", email: "", phone: "" },
    mode: "onSubmit",
  });

  // Reset user info on every page load
  useEffect(() => {
    clearUserInfo();
  }, [clearUserInfo]);

  // Prevent modal close until form is valid and submitted
  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && !form.formState.isSubmitSuccessful) {
      toast.warning("Please fill out the form before continuing.");
      setOpen(true);
    } else {
      setOpen(nextOpen);
    }
  };

  const onSubmit = (data: UserInfoFormData) => {
    setUserInfo(data);
    setOpen(false);
  };

  return (
    <ResponsiveModal open={open} onOpenChange={handleOpenChange}>
      <ResponsiveModalContent>
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>Enter your details</ResponsiveModalTitle>
        </ResponsiveModalHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-2">
          <FloatingLabelInput
            label="Name"
            id="firstName"
            {...form.register("firstName")}
            disabled={form.formState.isSubmitting}
            autoFocus
          />
          <FloatingLabelInput
            label="Email"
            id="email"
            type="email"
            {...form.register("email")}
            disabled={form.formState.isSubmitting}
          />
          <FloatingLabelInput
            label="Phone"
            id="phone"
            type="tel"
            inputMode="numeric"
            maxLength={10}
            {...form.register("phone")}
            disabled={form.formState.isSubmitting}
          />
          <Button
            type="submit"
            className="w-full"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Submitting..." : "Continue"}
          </Button>
        </form>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
