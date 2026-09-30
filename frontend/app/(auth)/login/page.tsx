"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { authService } from "@/services/authService";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import axios from "axios";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { login } = useAuth();
  const { success } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!email || !password) {
      setFormError("Please provide both email and password.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.login({ email, password });
      if (response.success && response.data?.token && response.data?.user) {
        login(response.data.token, response.data.user);
        success("Authenticated successfully", `Welcome back, ${response.data.user.name}`);
        router.push("/dashboard");
      } else {
        setFormError(response.message || "Failed to authenticate.");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 403) {
          // Unverified email
          setFormError("Email is not verified yet. Please check your verification code.");
          setTimeout(() => {
            router.push(`/verify-email?email=${encodeURIComponent(email)}`);
          }, 1500);
        } else {
          setFormError(err.response?.data?.message || "Invalid email or password.");
        }
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
          Sign In to Workspace
        </h2>
        <p className="mt-1 text-xs text-[var(--text-secondary)]">
          Enter your operator credentials to access your transformations.
        </p>
      </div>

      {formError && (
        <div className="p-3 text-xs rounded-[6px] bg-[var(--error-soft)] border border-red-200 text-[var(--error)] font-medium">
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          required
          autoComplete="email"
          placeholder="operator@organization.gov"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-[var(--primary)] hover:underline font-medium"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <Button type="submit" isLoading={isLoading} className="w-full mt-2">
          Sign In
        </Button>
      </form>

      <div className="pt-4 border-t border-[var(--border)] text-center text-xs text-[var(--text-secondary)]">
        Do not have an account?{" "}
        <Link
          href="/signup"
          className="font-semibold text-[var(--primary)] hover:underline"
        >
          Create operator account
        </Link>
      </div>
    </div>
  );
}
