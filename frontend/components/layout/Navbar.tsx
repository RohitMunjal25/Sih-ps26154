"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Sparkles, Plus, LogOut, User, FolderKanban, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Projects", href: "/projects", icon: FolderKanban },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 group"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-[var(--primary)] text-white shadow-sm transition-transform group-hover:scale-105">
              <Sparkles className="h-4 w-4" />
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-[var(--text-primary)]">
                NTRO Gen AI
              </span>
              <span className="text-[10px] text-[var(--text-muted)] font-medium leading-none uppercase tracking-wider">
                Transformation Studio
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-[6px] text-xs font-semibold tracking-wide transition-colors",
                    isActive
                      ? "bg-[var(--surface-subtle)] text-[var(--primary)] border border-[var(--border)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)]"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <Link href="/projects/new">
            <Button size="sm" className="gap-1.5 shadow-sm">
              <Plus className="h-3.5 w-3.5" />
              <span>New Transformation</span>
            </Button>
          </Link>

          <div className="h-5 w-px bg-[var(--border)] hidden sm:block" />

          {/* User & Logout */}
          <div className="flex items-center gap-2">
            <Link
              href="/profile"
              className={cn(
                "flex items-center gap-2 px-2.5 py-1.5 rounded-[6px] text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)] transition-colors border border-transparent",
                pathname === "/profile" && "bg-[var(--surface-subtle)] border-[var(--border)] text-[var(--text-primary)]"
              )}
            >
              <div className="h-6 w-6 rounded-full bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center font-bold text-[11px]">
                {user?.name ? user.name.charAt(0).toUpperCase() : <User className="h-3 w-3" />}
              </div>
              <span className="hidden sm:inline font-medium max-w-[120px] truncate">
                {user?.name || "Operator"}
              </span>
            </Link>

            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 text-[var(--text-muted)] hover:text-[var(--error)] rounded-[6px] hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
