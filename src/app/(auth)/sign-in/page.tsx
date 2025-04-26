"use client"; // <-- MUST BE AT THE VERY TOP
import { signInAction as _signInAction } from '@/app/actions';
import { FormMessage } from '@/components/form-message'; 
import { useEffect, useState, useTransition } from 'react'; // <--- Import hooks
import { useSearchParams } from 'next/navigation'; // <--- Import for search params
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client'; // Assuming client Supabase helper
// Assuming these components are correctly imported from your UI library or custom files
import  Navbar  from '@/components/navbar'; // Example path
import { Label } from '@/components/ui/label'; // Example path (e.g., shadcn/ui)
import { Input } from '@/components/ui/input'; // Example path (e.g., shadcn/ui)
import { Button } from '@/components/ui/button'; // Example path (e.g., shadcn/ui) - Renamed SubmitButton to Button if it's just a standard button

export type Message = 
  | { success: string }
  | { error: string }
  | { message: string }
  | { type?: "error" | "success"; message?: string };

export default function SignInPage() {
  const searchParams = useSearchParams();
  // --- Declare state and transition hooks ---
  const [message, setMessage] = useState('');
  const [isPending, startTransition] = useTransition();
  useEffect(() => {
    const messageParam = searchParams.get('message') || '';
    setMessage(messageParam);
  }, [searchParams]);
  // --- End declarations ---

  // Define your async sign-in logic
  async function signInAction(formData: FormData) {
    const supabase = createClient();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // Clear previous messages on new attempt
    setMessage('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(`Error: ${error.message}`); // Set error message
    } else {
      setMessage('Sign in successful! Redirecting...'); // Optional success message
      // Handle successful sign-in (e.g., redirect using useRouter or let middleware handle it)
      // Option 1: useRouter (import from 'next/navigation')
      // const router = useRouter(); router.push('/dashboard');
      // Option 2: Reload page (if middleware handles redirect)
      window.location.href = '/'; // Or your target protected route
    }
  }

  // Component JSX
  return (
    <>
      <Navbar />
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-8">
        <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-sm">
          <form
            className="flex flex-col space-y-6"
            // Wrap the call to the async function in startTransition
            action={(formData) => {
              startTransition(async () => {
                await signInAction(formData);
              });
            }}
          >
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
                  disabled={isPending} // Optionally disable inputs during transition
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <Link
                    className="text-red-500 text-xs font-medium hover:text-red-400 hover:underline transition-all"
                    href="/(auth)/forgot-password" // Make sure this route exists
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
                  disabled={isPending} // Optionally disable inputs during transition
                />
              </div>
            </div>

            {/* --- Updated Button Usage --- */}
            <Button // Use the actual Button component you import
              type="submit" // Ensure type is submit for form action
              className="w-full bg-transparent border border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-all duration-300 font-bold"
              disabled={isPending} // <-- Use the 'disabled' prop
            >
              {/* Conditionally render text based on isPending */}
              {isPending ? 'Signing in...' : 'Sign in'}
            </Button>
            {/* --- End Updated Button Usage --- */}


            {/* Display message if it exists */}
            {message && <FormMessage message ={message}/>
          }
          </form>
        </div>
      </div>
    </>
  );
}