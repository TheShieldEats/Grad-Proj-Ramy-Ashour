import DashboardNavbar from "@/components/dashboard-navbar";
import { redirect } from "next/navigation";
import { createClient } from "../../../supabase/server";
import { TestAccountButtons } from "./client-actions";
import UserDashboard from "./user-dashboard";

export default async function Dashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Get user data including role
  let userData = null;
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (!error && data) {
      userData = data;
    }
  } catch (error) {
    console.error("Exception fetching user data:", error);
  }

  // If no user data in database, check user metadata
  if (!userData && user.user_metadata?.role) {
    userData = {
      role: user.user_metadata.role,
    };
  }

  // Redirect to role-specific dashboard if role exists
  if (userData?.role) {
    if (userData.role === "admin") {
      return redirect("/dashboard/admin");
    } else if (userData.role === "coach") {
      return redirect("/dashboard/coach");
    } else if (userData.role === "player") {
      return redirect("/dashboard/player");
    }
  }

  return (
    <>
      <DashboardNavbar />
      <div className="w-full bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 mb-8 text-white">
            <h1 className="text-3xl font-bold mb-2">
              Welcome, {userData?.full_name || user.email}
            </h1>
            <p className="text-lg opacity-90 mb-6">
              Your Ramy Ashour Squash Academy Dashboard
            </p>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 rounded-lg p-4 flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                </div>
                <span className="font-medium">Upload Video</span>
              </button>
              <button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 rounded-lg p-4 flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <span className="font-medium">Book Session</span>
              </button>
              <button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 rounded-lg p-4 flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <span className="font-medium">Training Library</span>
              </button>
            </div>
          </div>

          <UserDashboard />
        </div>
      </div>

      {/* Show development tools for everyone */}
      <div className="container mx-auto px-4 py-8 mt-8 bg-white rounded-xl shadow-sm border border-gray-100">
        <h2 className="font-semibold text-xl mb-4">Development Tools</h2>
        <p className="mb-4">
          Create test accounts and manage email verification:
        </p>
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <a
              href="/api/create-test-accounts"
              target="_blank"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Test Accounts
            </a>
            <a
              href="/api/auto-confirm-emails"
              target="_blank"
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Auto-Confirm Emails
            </a>
            <a
              href="/api/verify-all-emails"
              target="_blank"
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Verify All Emails
            </a>
          </div>
          <p className="text-xs text-amber-600 mb-2">
            After creating accounts, click "Verify All Emails" to bypass email
            verification.
          </p>

          <TestAccountButtons />
        </div>

        <p className="text-sm text-muted-foreground">Account credentials:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-muted-foreground">
          <li>Admin: admin@squashacademy.com / Admin123!</li>
          <li>Coach: coach@squashacademy.com / Coach123!</li>
          <li>Player: player@squashacademy.com / Player123!</li>
        </ul>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-lg mb-2">Create Verified Admin</h3>
          <p className="mb-2">
            Click the button below to create a pre-verified admin account:
          </p>
          <a
            href="/api/create-admin"
            target="_blank"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Verified Admin
          </a>
          <div className="mt-3 bg-white p-3 rounded border border-gray-200">
            <p>
              <strong>Email:</strong> verified-admin@squashacademy.com
            </p>
            <p>
              <strong>Password:</strong> Admin123!
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
