"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import { authService } from "@/services/authService";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import axios from "axios";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { success } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!email) {
      setFormError("Please enter your registered email address.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.forgotPassword(email.trim());
      if (response.success) {
        success("Reset code sent", "If this email is registered, a reset OTP has been sent.");
        router.push(`/reset-password?email=${encodeURIComponent(email)}`);
      } else {
        setFormError(response.message || "Failed to process password reset request.");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setFormError(err.response?.data?.message || "Failed to process reset request.");
      } else {
        setFormError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
          Reset Password
        </h2>
        <p className="mt-1 text-xs text-[var(--text-secondary)]">
          Enter your registered email and we will send you a one-time code to reset your credentials.
        </p>
      </div>

      {formError && (
        <div className="p-3 text-xs rounded-[6px] bg-[var(--error-soft)] border border-red-200 text-[var(--error)] font-medium">
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Registered Email Address"
          type="email"
          required
          autoComplete="email"
          placeholder="operator@organization.gov"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Button type="submit" isLoading={isLoading} className="w-full mt-2">
          Send Reset OTP
        </Button>
      </form>

      <div className="pt-4 border-t border-[var(--border)] text-center text-xs text-[var(--text-secondary)]">
        Remembered password?{" "}
        <Link
          href="/login"
          className="font-semibold text-[var(--primary)] hover:underline"
        >
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}
