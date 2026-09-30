"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import { authService } from "@/services/authService";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import axios from "axios";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { success } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (password.length < 6) {
      setFormError("Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.signup({ name, email, password });
      if (response.success) {
        success("Account created", "A 6-digit verification code has been dispatched to your email.");
        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
      } else {
        setFormError(response.message || "Failed to create account.");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setFormError(err.response?.data?.message || "Failed to create account.");
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
          Create Operator Account
        </h2>
        <p className="mt-1 text-xs text-[var(--text-secondary)]">
          Join the NTRO Gen AI Content Transformation Workspace.
        </p>
      </div>

      {formError && (
        <div className="p-3 text-xs rounded-[6px] bg-[var(--error-soft)] border border-red-200 text-[var(--error)] font-medium">
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Name"
          type="text"
          required
          autoComplete="name"
          placeholder="Operator Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <Input
          label="Email Address"
          type="email"
          required
          autoComplete="email"
          placeholder="operator@organization.gov"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          label="Password"
          type="password"
          required
          autoComplete="new-password"
          placeholder="Minimum 6 characters"
          hint="Must be at least 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button type="submit" isLoading={isLoading} className="w-full mt-2">
          Create Account & Verify
        </Button>
      </form>

      <div className="pt-4 border-t border-[var(--border)] text-center text-xs text-[var(--text-secondary)]">
        Already registered?{" "}
        <Link
          href="/login"
          className="font-semibold text-[var(--primary)] hover:underline"
        >
          Sign in here
        </Link>
      </div>
    </div>
  );
}
