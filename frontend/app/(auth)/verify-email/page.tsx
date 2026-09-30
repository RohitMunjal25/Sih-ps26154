"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { authService } from "@/services/authService";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import axios from "axios";

function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") || "";

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { login } = useAuth();
  const { success } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanOtp = otp.trim();
    if (cleanOtp.length !== 6) {
      setFormError("Please enter a valid 6-digit verification code.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.verifyEmail({
        email: email.trim(),
        otp: cleanOtp,
      });

      if (response.success && response.data?.token && response.data?.user) {
        login(response.data.token, response.data.user);
        success("Email verified", "Your operator workspace is now unlocked.");
        router.push("/dashboard");
      } else {
        setFormError(response.message || "Verification failed. Check your code.");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setFormError(err.response?.data?.message || "Invalid or expired verification code.");
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
          Verify Email Address
        </h2>
        <p className="mt-1 text-xs text-[var(--text-secondary)]">
          Enter the 6-digit one-time passcode dispatched to your email.
        </p>
      </div>

      {formError && (
        <div className="p-3 text-xs rounded-[6px] bg-[var(--error-soft)] border border-red-200 text-[var(--error)] font-medium">
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Registered Email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="operator@organization.gov"
        />

        <Input
          label="6-Digit Verification Code"
          type="text"
          required
          maxLength={6}
          placeholder="123456"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
          className="text-center tracking-widest text-lg font-mono"
        />

        <Button type="submit" isLoading={isLoading} className="w-full mt-2">
          Verify & Enter Workspace
        </Button>
      </form>

      <div className="pt-4 border-t border-[var(--border)] text-center text-xs text-[var(--text-secondary)]">
        Wrong email?{" "}
        <Link
          href="/signup"
          className="font-semibold text-[var(--primary)] hover:underline"
        >
          Back to Signup
        </Link>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[var(--text-muted)]">Loading verification...</div>}>
      <VerifyEmailForm />
    </Suspense>
  );
}
