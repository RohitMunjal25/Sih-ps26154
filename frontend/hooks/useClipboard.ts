"use client";

import { useState, useCallback } from "react";
import { useToast } from "@/context/ToastContext";

export function useClipboard() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const { success, error } = useToast();

  const copy = useCallback(
    async (text: string, key = "default", successMessage = "Copied to clipboard") => {
      try {
        await navigator.clipboard.writeText(text);
        setCopiedKey(key);
        success(successMessage);
        setTimeout(() => {
          setCopiedKey((current) => (current === key ? null : current));
        }, 2000);
        return true;
      } catch (err) {
        console.error("Clipboard copy failed:", err);
        error("Failed to copy to clipboard");
        return false;
      }
    },
    [success, error]
  );

  return {
    copy,
    isCopied: (key = "default") => copiedKey === key,
  };
}
