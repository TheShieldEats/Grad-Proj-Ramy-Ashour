import Link from "next/link";
import { createClient } from "../../supabase/server";
import { Button } from "./ui/button";
import { UserCircle, Menu } from "lucide-react";
import UserProfile from "./user-profile";

export default async function Navbar() {
  const supabase = createClient();

  const {
    data: { user },
  } = await (await supabase).auth.getUser();

  return (
    <nav className="w-full border-b border-gray-200/10 py-4 sticky top-0 z-50 bg-black/40 backdrop-blur-md">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" prefetch className="flex items-center gap-3 group">
          <span className="text-2xl font-bold text-white">RAMY ASHOUR</span>
        </Link>

        <div className="hidden md:flex gap-8 items-center">
          {[
            { href: "/#features", label: "Features" },
            { href: "/#how-it-works", label: "How It Works" },
            { href: "/#testimonials", label: "Testimonials" },
            { href: "/pricing", label: "Pricing" },
          ].map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className="text-sm font-medium text-white hover:text-blue-300 relative group transition-colors duration-300"
            >
              {item.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-300 group-hover:w-full transition-all duration-300"></span>
            </Link>
          ))}
        </div>

        <div className="flex gap-4 items-center">
          {user ? (
            <>
              <Link href="/dashboard" className="hidden sm:block">
                <Button className="bg-blue-600 hover:bg-blue-700 hover:shadow-lg transition-all duration-300 rounded-xl">
                  Dashboard
                </Button>
              </Link>
              <UserProfile />
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="px-4 py-2 text-sm font-medium text-white hover:text-blue-300 hidden sm:block transition-colors duration-300 relative group"
              >
                Sign In
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-300 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link
                href="/sign-up"
                className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl hover:shadow-lg transition-all duration-300"
              >
                Sign Up
              </Link>
            </>
          )}
          <button className="md:hidden text-white hover:text-blue-300 transition-colors duration-300 p-2 rounded-full hover:bg-white/10">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </nav>
  );
}
