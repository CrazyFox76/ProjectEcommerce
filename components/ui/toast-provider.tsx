"use client";

import { Toaster } from "sonner";

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          borderRadius: "0.75rem",
          fontSize: "0.875rem",
          padding: "0.75rem 1rem",
        },
      }}
      richColors
      closeButton
    />
  );
}
