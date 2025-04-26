// src/app/(auth)/sign-in/page.tsx
"use client";

import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import React from "react";
import Navbar from '@/components/navbar';
import { Button } from '@/components/ui/button';


import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { createClient } from '@/utils/supabase/client';
// --- Import the component AND the simplified type ---
import * as formMessage from "@/components/form-message";
// --- End Import ---
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';


// --- Named Export for Type (Keep as is) ---
export type Message = {
  type: "error" | "success" | "info";
  text: string;
};

interface FormMessageProps {
  message?: formMessage.Message ;
  className?: string;
}

// --- Use NAMED export for the component ---
export function FormMessage({ message, className = "" }: FormMessageProps) {
  // ... rest of your component logic (as provided before) ...
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");
  const urlSuccess = searchParams.get("success");

  let displayMessage: formMessage.Message | null = null;

  if (message) {
    displayMessage = message;
  } else if (urlError) {
    displayMessage = { type: "error", text: urlError };
  } else if (urlSuccess) {
    displayMessage = { type: "success", text: urlSuccess };
  }

  if (!displayMessage) {
    return null;
  }

  let bgColor = "";
  let textColor = "";
  let IconComponent: React.ElementType | null = null;

  switch (displayMessage.type) {
    case "error":
      bgColor = "bg-red-50";
      textColor = "text-red-700";
      IconComponent = AlertCircle;
      break;
    case "success":
      bgColor = "bg-green-50";
      textColor = "text-green-700";
      IconComponent = CheckCircle2;
      break;
    case "info":
      bgColor = "bg-blue-50";
      textColor = "text-blue-700";
      break;
    default:
      textColor = "text-foreground";
      break;
  }

  return (
    <div
      className={`flex items-start gap-2 w-full p-3 rounded-md text-sm ${bgColor} ${textColor} ${className}`}
      role="alert"
    >
      {IconComponent && <IconComponent className="h-5 w-5 flex-shrink-0" />}
      <div>{displayMessage.text}</div>
    </div>
  );
} // --- End NAMED export ---
export default function SignInPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // --- Use the imported Message type for state ---
  const [message, setMessage] = useState(() => {
    const error = searchParams.get('error');
    const success = searchParams.get('success');
    if (error) return { type: 'error', text: error };
  if (success) return { type: 'success', text: success };
  return undefined;
  });
  // --- End state type update ---


  async function signInAction(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const supabase = createClient();

    setMessage(undefined); // Clear previous messages

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // --- Set state using the Message object structure ---
      setMessage({ type: 'error', text: `Error: ${error.message}` });
    } else {
      // --- Set state using the Message object structure ---
      // setMessage({ type: 'success', text: 'Sign in successful! Redirecting...' });
      // Usually, you don't show a message if redirecting immediately
      router.replace('/dashboard');
    }
  }

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-8">
        <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-sm">
          <form
            className="flex flex-col space-y-6"
            action={(formData) => {
              startTransition(async () => {
                await signInAction(formData);
              });
            }}
          >
            {/* Form Header */}
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-semibold tracking-tight">Sign in</h1>
              <p className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link
                  className="text-primary font-medium hover:underline transition-all"
                  href="/sign-up"
                >
                  Sign up
                </Link>
              </p>
            </div>

            {/* Input Fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  className="w-full"
                  disabled={isPending}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <Link
                    className="text-red-500 text-xs font-medium hover:text-red-400 hover:underline transition-all"
                    href="/forgot-password"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Your password"
                  required
                  className="w-full"
                  disabled={isPending}
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-transparent border border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-all duration-300 font-bold"
              disabled={isPending}
            >
              {isPending ? 'Signing in...' : 'Sign in'}
            </Button>

            {/* --- Pass the message state object directly --- */}
            {/* FormMessage will handle styling based on message.type */}
             <formMessage.FormMessage message={message} />
            {/* --- End message passing update --- */}
          </form>
        </div>
      </div>
    </>
  );
}