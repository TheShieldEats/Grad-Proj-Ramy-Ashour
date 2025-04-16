"use client";

import { useSearchParams } from "next/navigation";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export type Message =
  | { success: string }
  | { error: string }
  | { message: string }
  | { type?: "error" | "success"; message?: string };

export function FormMessage({ message }: { message?: Message }) {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const success = searchParams.get("success");

  if (!message && !error && !success) return null;

  return (
    <div className="flex flex-col gap-2 w-full max-w-md text-sm">
      {message && "success" in message && (
        <div className="bg-green-50 text-green-700 p-3 rounded-md flex items-start gap-2">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          <div>{message.success}</div>
        </div>
      )}
      {message && "error" in message && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md flex items-start gap-2">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <div>{message.error}</div>
        </div>
      )}
      {message && "message" in message && message.message && (
        <div
          className={`p-3 rounded-md flex items-start gap-2 ${message.type === "error" ? "bg-red-50 text-red-700" : message.type === "success" ? "bg-green-50 text-green-700" : "text-foreground border-l-2 px-4"}`}
        >
          {message.type === "error" ? (
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
          ) : message.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          ) : null}
          <div>{message.message}</div>
        </div>
      )}
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md flex items-start gap-2">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <div>{error}</div>
        </div>
      )}
      {success && (
        <div className="bg-green-50 text-green-700 p-3 rounded-md flex items-start gap-2">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          <div>{success}</div>
        </div>
      )}
    </div>
  );
}
