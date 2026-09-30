"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { userService } from "@/services/userService";
import { User } from "@/types/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatDate } from "@/lib/utils";
import { User as UserIcon, Shield, Mail, Calendar, CheckCircle2, AlertTriangle, LogOut } from "lucide-react";

export default function ProfilePage() {
  const { user: authUser, logout } = useAuth();
  const [profile, setProfile] = useState<User | null>(authUser);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchProfile() {
      try {
        const data = await userService.getProfile();
        if (isMounted) {
          setProfile(data);
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    fetchProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="pb-4 border-b border-[var(--border)]">
        <span className="text-xs uppercase tracking-wider text-[var(--primary)] font-semibold">
          Operator Account
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] mt-1">
          Profile & Security
        </h1>
        <p className="text-xs text-[var(--text-secondary)] mt-0.5">
          View your platform permissions and security verification status.
        </p>
      </div>

      {isLoading ? (
        <Card>
          <div className="p-6 space-y-4">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </Card>
      ) : (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center font-bold text-lg border border-[var(--primary)]">
                {profile?.name?.charAt(0).toUpperCase() || "O"}
              </div>
              <div>
                <CardTitle className="text-base">{profile?.name}</CardTitle>
                <p className="text-xs text-[var(--text-secondary)]">{profile?.email}</p>
              </div>
            </div>

            <Badge variant="primary" size="md">
              <Shield className="h-3 w-3" />
              {profile?.role ? profile.role.toUpperCase() : "OPERATOR"}
            </Badge>
          </CardHeader>

          <CardContent className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-[6px] bg-[var(--surface-subtle)] border border-[var(--border)]">
                <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
                  <Mail className="h-3.5 w-3.5 text-[var(--primary)]" />
                  Email Verification
                </div>
                <div className="mt-2 flex items-center gap-2">
                  {profile?.isEmailVerified ? (
                    <Badge variant="success" size="sm">
                      <CheckCircle2 className="h-3 w-3" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant="warning" size="sm">
                      <AlertTriangle className="h-3 w-3" />
                      Unverified
                    </Badge>
                  )}
                </div>
              </div>

              <div className="p-3.5 rounded-[6px] bg-[var(--surface-subtle)] border border-[var(--border)]">
                <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
                  <Calendar className="h-3.5 w-3.5 text-[var(--primary)]" />
                  Registered On
                </div>
                <p className="mt-2 text-sm font-medium text-[var(--text-primary)]">
                  {profile?.createdAt ? formatDate(profile.createdAt) : "Active"}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--border)] flex justify-between items-center">
              <div className="text-xs text-[var(--text-muted)]">
                Authorized for SIH-26154 Content Transformation Operations
              </div>
              <Button variant="danger" size="sm" onClick={logout} className="gap-1.5">
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
