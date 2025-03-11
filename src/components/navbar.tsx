import Link from "next/link";
import { createClient } from "../../supabase/server";
import { Button } from "./ui/button";
import { UserCircle, Menu } from "lucide-react";
import UserProfile from "./user-profile";
import Image from "next/image";

export default async function Navbar() {
  const supabase = createClient();

  const {
    data: { user },
  } = await (await supabase).auth.getUser();

  return (
    <nav className="w-full border-b border-gray-200/50 glass py-4 sticky top-0 z-50">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" prefetch className="flex items-center gap-3 group">
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 animate-gradient-text">
            RAMY ASHOUR
          </span>
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
              className="text-sm font-medium text-gray-700 hover:text-blue-600 relative group transition-colors duration-300"
            >
              {item.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
          ))}
        </div>

        <div className="flex gap-4 items-center">
          {user ? (
            <>
              <Link href="/dashboard" className="hidden sm:block">
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg hover:translate-y-[-1px] transition-all duration-300 rounded-xl">
                  Dashboard
                </Button>
              </Link>
              <UserProfile />
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hidden sm:block transition-colors duration-300 relative group"
              >
                Sign In
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link
                href="/sign-up"
                className="px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:shadow-lg hover:translate-y-[-1px] transition-all duration-300"
              >
                Sign Up
              </Link>
            </>
          )}
          <button className="md:hidden text-gray-700 hover:text-blue-600 transition-colors duration-300 p-2 rounded-full hover:bg-gray-100">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </nav>
  );
}
