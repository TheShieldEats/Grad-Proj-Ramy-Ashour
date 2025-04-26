import DashboardNavbar from "@/components/dashboard-navbar";
import { redirect } from "next/navigation";
import { createClient } from "../../../utils/supabase/server";
import { Database, Tables } from "@/types/supabase";
import { Shield, Users, BookOpen, BarChart3 } from "lucide-react";
import Image from "next/image";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Get user data including role
  let { data: userData, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (userError) {
    console.error("Error fetching user data:", userError);
  }

  // If no user data or wrong role, create default admin record
  if (!userData || userData.role !== "admin") {
    try {
      // Create or update user record with admin role
      const { error: userUpdateError } = await supabase.from("users").upsert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || "Admin User",
        name: user.user_metadata?.full_name || "Admin User",
        role: "admin",
        user_id: user.id,
        token_identifier: user.id,
        created_at: new Date().toISOString(),
      });

      if (userUpdateError) {
        console.error("Error updating user record:", userUpdateError);
      }

      // Refresh user data
      const { data: refreshedData } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (refreshedData) {
        userData = refreshedData;
      }
    } catch (err) {
      console.error("Error setting up admin account:", err);
    }
  }

  // Get counts for dashboard stats
  const { data: playerCount } = await supabase
    .from("users")
    .select("id", { count: "exact", head: true })
    .eq("role", "player");

  const { data: coachCount } = await supabase
    .from("users")
    .select("id", { count: "exact", head: true })
    .eq("role", "coach");

  return (
    <>
      <DashboardNavbar />
      <main className="w-full bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Header Section */}
          <header className="mb-8 flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-full overflow-hidden bg-blue-100 flex-shrink-0">
              {userData?.avatar_url ? (
                <Image
                  src={userData.avatar_url}
                  alt={userData.full_name || "User"}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-blue-600 font-bold text-xl">
                  {userData?.full_name
                    ?.split(" ")
                    .map((name) => name[0])
                    .join("") ||
                    user.email?.charAt(0).toUpperCase() ||
                    "A"}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 animate-gradient-text">
                Welcome,{" "}
                {userData?.full_name || user.email?.split("@")[0] || "Admin"}
              </h1>
              <p className="text-gray-600 mt-2">
                Manage users, content, and system settings
              </p>
            </div>
          </header>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Players</p>
                  <p className="text-2xl font-bold">
                    {playerCount?.count || 0}
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Coaches</p>
                  <p className="text-2xl font-bold">{coachCount?.count || 0}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Training Content</p>
                  <p className="text-2xl font-bold">24</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <BookOpen className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">AI Analyses</p>
                  <p className="text-2xl font-bold">156</p>
                </div>
                <div className="bg-orange-100 p-3 rounded-full">
                  <BarChart3 className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Admin Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold mb-4">User Management</h2>
              <ul className="space-y-2">
                <li className="p-2 hover:bg-gray-50 rounded-md cursor-pointer transition-colors">
                  <a
                    href="/dashboard/admin/users"
                    className="text-blue-600 font-medium"
                  >
                    View All Users
                  </a>
                </li>
                <li className="p-2 hover:bg-gray-50 rounded-md cursor-pointer transition-colors">
                  <a
                    href="/dashboard/admin/coaches/new"
                    className="text-blue-600 font-medium"
                  >
                    Add New Coach
                  </a>
                </li>
                <li className="p-2 hover:bg-gray-50 rounded-md cursor-pointer transition-colors">
                  <a
                    href="/dashboard/admin/permissions"
                    className="text-blue-600 font-medium"
                  >
                    Manage Permissions
                  </a>
                </li>
                <li className="p-2 hover:bg-gray-50 rounded-md cursor-pointer transition-colors">
                  <a
                    href="/api/verify-all-emails"
                    target="_blank"
                    className="text-blue-600 font-medium"
                  >
                    Verify All User Emails
                  </a>
                </li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold mb-4">Content Management</h2>
              <ul className="space-y-2">
                <li className="p-2 hover:bg-gray-50 rounded-md cursor-pointer transition-colors">
                  <a
                    href="/dashboard/admin/content/upload"
                    className="text-blue-600 font-medium"
                  >
                    Upload Training Videos
                  </a>
                </li>
                <li className="p-2 hover:bg-gray-50 rounded-md cursor-pointer transition-colors">
                  <a
                    href="/dashboard/admin/content/categories"
                    className="text-blue-600 font-medium"
                  >
                    Manage Categories
                  </a>
                </li>
                <li className="p-2 hover:bg-gray-50 rounded-md cursor-pointer transition-colors">
                  <a
                    href="/dashboard/admin/content/featured"
                    className="text-blue-600 font-medium"
                  >
                    Featured Content
                  </a>
                </li>
                <li className="p-2 hover:bg-gray-50 rounded-md cursor-pointer transition-colors">
                  <a
                    href="/dashboard/admin/content/programs/new"
                    className="text-blue-600 font-medium"
                  >
                    Create Training Program
                  </a>
                </li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold mb-4">System Management</h2>
              <ul className="space-y-2">
                <li className="p-2 hover:bg-gray-50 rounded-md cursor-pointer transition-colors">
                  <a
                    href="/dashboard/admin/reports/usage"
                    className="text-blue-600 font-medium"
                  >
                    Usage Reports
                  </a>
                </li>
                <li className="p-2 hover:bg-gray-50 rounded-md cursor-pointer transition-colors">
                  <a
                    href="/dashboard/admin/reports/ai-metrics"
                    className="text-blue-600 font-medium"
                  >
                    AI Performance Metrics
                  </a>
                </li>
                <li className="p-2 hover:bg-gray-50 rounded-md cursor-pointer transition-colors">
                  <a
                    href="/dashboard/admin/reports/bookings"
                    className="text-blue-600 font-medium"
                  >
                    Booking Statistics
                  </a>
                </li>
                <li className="p-2 hover:bg-gray-50 rounded-md cursor-pointer transition-colors">
                  <a
                    href="/api/create-test-accounts"
                    target="_blank"
                    className="text-blue-600 font-medium"
                  >
                    Create Test Accounts
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                      User
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                      Action
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4">John Smith</td>
                    <td className="py-3 px-4">Uploaded new video</td>
                    <td className="py-3 px-4">
                      {new Date().toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                      , 10:30 AM
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        Completed
                      </span>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4">Sarah Johnson</td>
                    <td className="py-3 px-4">
                      Booked session with Coach Mike
                    </td>
                    <td className="py-3 px-4">
                      {new Date().toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                      , 9:15 AM
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        Confirmed
                      </span>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4">Coach Mike</td>
                    <td className="py-3 px-4">Updated availability</td>
                    <td className="py-3 px-4">
                      {new Date(Date.now() - 86400000).toLocaleDateString(
                        "en-US",
                        { month: "long", day: "numeric", year: "numeric" },
                      )}
                      , 4:45 PM
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        Completed
                      </span>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4">Admin User</td>
                    <td className="py-3 px-4">Added new training content</td>
                    <td className="py-3 px-4">
                      {new Date(Date.now() - 86400000).toLocaleDateString(
                        "en-US",
                        { month: "long", day: "numeric", year: "numeric" },
                      )}
                      , 2:30 PM
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        Completed
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
