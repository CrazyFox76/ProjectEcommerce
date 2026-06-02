"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="bg-red-50 p-4 rounded-full inline-block mb-6">
          <AlertTriangle className="h-10 w-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Terjadi Kesalahan
        </h2>
        <p className="text-gray-500 mb-6">
          {error.message || "Maaf, terjadi kesalahan yang tidak terduga. Silakan coba lagi."}
        </p>
        <Button onClick={reset}>Coba Lagi</Button>
      </div>
    </div>
  );
}
