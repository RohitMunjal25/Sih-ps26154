"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  description?: string;
}

interface ToastContextType {
  toast: (message: string, options?: { type?: ToastType; description?: string; durationMs?: number }) => void;
  success: (message: string, description?: string) => void;
  error: (message: string, description?: string) => void;
  info: (message: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (
      message: string,
      options?: { type?: ToastType; description?: string; durationMs?: number }
    ) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastItem = {
        id,
        type: options?.type || "info",
        message,
        description: options?.description,
      };

      setToasts((prev) => [...prev, newToast]);

      const duration = options?.durationMs || 3500;
      setTimeout(() => {
        removeToast(id);
      }, duration);
    },
    [removeToast]
  );

  const success = useCallback(
    (message: string, description?: string) => {
      toast(message, { type: "success", description });
    },
    [toast]
  );

  const error = useCallback(
    (message: string, description?: string) => {
      toast(message, { type: "error", description });
    },
    [toast]
  );

  const info = useCallback(
    (message: string, description?: string) => {
      toast(message, { type: "info", description });
    },
    [toast]
  );

  return (
    <ToastContext.Provider value={{ toast, success, error, info }}>
      {children}
      <div
        aria-live="polite"
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none"
      >
        {toasts.map((item) => (
          <div
            key={item.id}
            role="status"
            className={cn(
              "pointer-events-auto flex items-start gap-3 p-3.5 rounded-[6px] border bg-[var(--surface)] shadow-[var(--shadow-md)] transition-all duration-180 text-sm",
              item.type === "success" && "border-emerald-300",
              item.type === "error" && "border-red-300",
              item.type === "info" && "border-[var(--border)]"
            )}
          >
            {item.type === "success" && (
              <CheckCircle2 className="h-5 w-5 text-[var(--success)] shrink-0 mt-0.5" />
            )}
            {item.type === "error" && (
              <AlertCircle className="h-5 w-5 text-[var(--error)] shrink-0 mt-0.5" />
            )}
            {item.type === "info" && (
              <Info className="h-5 w-5 text-[var(--primary)] shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-[var(--text-primary)]">{item.message}</p>
              {item.description && (
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  {item.description}
                </p>
              )}
            </div>
            <button
              onClick={() => removeToast(item.id)}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-0.5"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
