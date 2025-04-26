import DashboardNavbar from "@/components/dashboard-navbar";
import { redirect } from "next/navigation";
import { createClient } from "../../../utils/supabase/server";
import { Database, Tables } from "@/types/supabase";
import {
  Calendar,
  Video,
  LineChart,
  BookOpen,
  Upload,
  Plus,
} from "lucide-react";
import { TestAccountButtons } from "../client-actions";
import Image from "next/image";
import Link from "next/link";

export default async function PlayerDashboard() {
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

  // If no user data or wrong role, create default player record
  if (!userData || userData.role !== "player") {
    try {
      // Create or update user record with player role
      const { error: userUpdateError } = await supabase.from("users").upsert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || "Player User",
        name: user.user_metadata?.full_name || "Player User",
        role: "player",
        user_id: user.id,
        token_identifier: user.id,
        created_at: new Date().toISOString(),
      });

      if (userUpdateError) {
        console.error("Error updating user record:", userUpdateError);
      }

      // Create player record if it doesn't exist
      const { error: playerCreateError } = await supabase
        .from("players")
        .upsert({
          id: user.id,
          skill_level: "Beginner",
          years_playing: 0,
          goals: "Improve squash skills",
        });

      if (playerCreateError) {
        console.error("Error creating player record:", playerCreateError);
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
      console.error("Error setting up player account:", err);
    }
  }

  // Get player details
  let playerData = null;
  try {
    // First check if player record exists
    const { count, error: countError } = await supabase
      .from("players")
      .select("*", { count: "exact", head: true })
      .eq("id", user.id);

    // Only try to fetch if record exists
    if (!countError && count && count > 0) {
      const { data, error } = await supabase
        .from("players")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!error) {
        playerData = data;
      } else {
        console.error("Error fetching player data:", error);
      }
    } else {
      // Create default player record if it doesn't exist
      const { data, error } = await supabase
        .from("players")
        .upsert({
          id: user.id,
          skill_level: "Beginner",
          years_playing: 0,
          goals: "Improve squash skills",
        })
        .select()
        .single();

      if (!error) {
        playerData = data;
      }
    }
  } catch (err) {
    console.error("Exception fetching player data:", err);
  }

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
                    "P"}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 animate-gradient-text">
                Welcome,{" "}
                {userData?.full_name || user.email?.split("@")[0] || "Player"}
              </h1>
              <p className="text-gray-600 mt-2">
                Track your progress, book sessions, and access training content
              </p>
            </div>
          </header>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-600 p-6 rounded-xl shadow-sm text-white">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Upload Video</h2>
                <Upload className="w-6 h-6" />
              </div>
              <p className="mb-4 text-blue-100">
                Upload your practice videos for AI analysis and coach feedback
              </p>
              <button className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium">
                Upload Now
              </button>
            </div>

            <div className="bg-green-600 p-6 rounded-xl shadow-sm text-white">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Book Session</h2>
                <Calendar className="w-6 h-6" />
              </div>
              <p className="mb-4 text-green-100">
                Schedule a training session with one of our professional coaches
              </p>
              <button className="px-4 py-2 bg-white text-green-600 rounded-lg hover:bg-green-50 transition-colors font-medium">
                Book Now
              </button>
            </div>

            <div className="bg-purple-600 p-6 rounded-xl shadow-sm text-white">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Training Library</h2>
                <BookOpen className="w-6 h-6" />
              </div>
              <p className="mb-4 text-purple-100">
                Access exclusive training content from Ramy Ashour and other
                coaches
              </p>
              <button className="px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition-colors font-medium">
                View Library
              </button>
            </div>
          </div>

          {/* Progress Overview */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Your Progress</h2>
              <button className="text-sm text-blue-600 hover:underline">
                View Details
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="p-4 border border-gray-100 rounded-lg">
                <h3 className="text-sm text-gray-500 mb-1">Technique Score</h3>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-bold">78</span>
                  <span className="text-xs text-green-600 mb-1">+5</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: "78%" }}
                  ></div>
                </div>
              </div>
              <div className="p-4 border border-gray-100 rounded-lg">
                <h3 className="text-sm text-gray-500 mb-1">Fitness Level</h3>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-bold">65</span>
                  <span className="text-xs text-green-600 mb-1">+3</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: "65%" }}
                  ></div>
                </div>
              </div>
              <div className="p-4 border border-gray-100 rounded-lg">
                <h3 className="text-sm text-gray-500 mb-1">Strategy</h3>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-bold">82</span>
                  <span className="text-xs text-green-600 mb-1">+7</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{ width: "82%" }}
                  ></div>
                </div>
              </div>
              <div className="p-4 border border-gray-100 rounded-lg">
                <h3 className="text-sm text-gray-500 mb-1">Overall Rating</h3>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-bold">75</span>
                  <span className="text-xs text-green-600 mb-1">+4</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-orange-600 h-2 rounded-full"
                    style={{ width: "75%" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Sessions */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Upcoming Sessions</h2>
              <button className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                <Plus className="w-4 h-4" /> Book New Session
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                      Date & Time
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                      Coach
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                      Type
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4">July 5, 2025 • 10:00 AM</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="relative w-8 h-8 rounded-full overflow-hidden bg-blue-100 mr-2">
                          <div className="absolute inset-0 flex items-center justify-center text-blue-600 font-bold text-xs">
                            CM
                          </div>
                        </div>
                        <span>Coach Mike</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">Technical Training</td>
                    <td className="py-3 px-4">
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        Confirmed
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button className="text-blue-600 hover:text-blue-800 mr-2">
                        Details
                      </button>
                      <button className="text-red-600 hover:text-red-800">
                        Cancel
                      </button>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4">July 8, 2025 • 2:00 PM</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="relative w-8 h-8 rounded-full overflow-hidden bg-blue-100 mr-2">
                          <div className="absolute inset-0 flex items-center justify-center text-blue-600 font-bold text-xs">
                            SL
                          </div>
                        </div>
                        <span>Coach Sarah</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">Match Strategy</td>
                    <td className="py-3 px-4">
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        Confirmed
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button className="text-blue-600 hover:text-blue-800 mr-2">
                        Details
                      </button>
                      <button className="text-red-600 hover:text-red-800">
                        Cancel
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Videos */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Recent Videos</h2>
              <button className="text-sm text-blue-600 hover:underline">
                View All
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  <div className="relative aspect-video bg-gray-100">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Video className="w-12 h-12 text-gray-400" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                      <div className="text-white text-sm">
                        Backhand Practice
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-500">
                        Uploaded:{" "}
                        {new Date().toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        Analyzed
                      </span>
                    </div>
                    <button className="w-full px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                      View Analysis
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Test Account Buttons */}
      <div className="container mx-auto px-4 py-8 mt-8 bg-white rounded-xl shadow-sm border border-gray-100">
        <h2 className="font-semibold text-xl mb-4">Development Tools</h2>
        <p className="mb-4">Test different user roles:</p>
        <TestAccountButtons />
        <p className="text-xs text-amber-600 mt-4">
          Note: You may need to create test accounts first using the dashboard
          page.
        </p>
      </div>
    </>
  );
}
