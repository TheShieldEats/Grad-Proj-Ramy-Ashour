import DashboardNavbar from "@/components/dashboard-navbar";
import { redirect } from "next/navigation";
import { createClient } from "../../../../supabase/server";
import { Database, Tables } from "@/types/supabase";
import { Calendar, Clock, Video, MessageSquare, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import ScheduleCalendar from "@/components/coach/schedule-calendar";
import VideoReviewDialog from "@/components/coach/video-review-dialog";

export default async function CoachDashboard() {
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

  // If no user data or wrong role, create default coach record
  if (!userData || userData.role !== "coach") {
    try {
      // Create or update user record with coach role
      const { error: userUpdateError } = await supabase.from("users").upsert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || "Coach User",
        name: user.user_metadata?.full_name || "Coach User",
        role: "coach",
        user_id: user.id,
        token_identifier: user.id,
        created_at: new Date().toISOString(),
      });

      if (userUpdateError) {
        console.error("Error updating user record:", userUpdateError);
      }

      // Create coach record if it doesn't exist
      const { error: coachCreateError } = await supabase
        .from("coaches")
        .upsert({
          id: user.id,
          bio: "Professional squash coach",
          specialization: "Technical training",
          years_experience: 5,
          hourly_rate: 50,
        });

      if (coachCreateError) {
        console.error("Error creating coach record:", coachCreateError);
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
      console.error("Error setting up coach account:", err);
    }
  }

  // Get coach details
  let coachData = null;
  try {
    // First check if coach record exists
    const { count, error: countError } = await supabase
      .from("coaches")
      .select("*", { count: "exact", head: true })
      .eq("id", user.id);

    // Only try to fetch if record exists
    if (!countError && count && count > 0) {
      const { data, error } = await supabase
        .from("coaches")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!error) {
        coachData = data;
      } else {
        console.error("Error fetching coach data:", error);
      }
    } else {
      // Create default coach record if it doesn't exist
      const { data, error } = await supabase
        .from("coaches")
        .upsert({
          id: user.id,
          bio: "Professional squash coach",
          specialization: "Technical training",
          years_experience: 5,
          hourly_rate: 50,
          availability: JSON.stringify({
            monday: ["9:00-12:00", "14:00-18:00"],
            tuesday: ["9:00-12:00", "14:00-18:00"],
            wednesday: ["9:00-12:00", "14:00-18:00"],
            thursday: ["9:00-12:00", "14:00-18:00"],
            friday: ["9:00-12:00", "14:00-18:00"],
          }),
        })
        .select()
        .single();

      if (!error) {
        coachData = data;
      }
    }
  } catch (err) {
    console.error("Exception fetching coach data:", err);
  }

  return (
    <>
      <DashboardNavbar />
      <main className="w-full bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Header Section */}
          <header className="mb-8">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 animate-gradient-text">
              Welcome,{" "}
              {userData?.full_name || user.email?.split("@")[0] || "Coach"}
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your sessions, review player videos, and track progress
            </p>
          </header>

          {/* Coach Profile */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="relative w-24 h-24 rounded-full overflow-hidden bg-blue-100">
                {userData.avatar_url ? (
                  <Image
                    src={userData.avatar_url}
                    alt={userData.full_name || "User"}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-blue-600 font-bold text-2xl">
                    {userData.full_name
                      ?.split(" ")
                      .map((name) => name[0])
                      .join("")}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold">{userData.full_name}</h2>
                <p className="text-gray-600">{userData.email}</p>
                <div className="mt-2">
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    Professional Coach
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Specialization</p>
                    <p className="font-medium">
                      {coachData?.specialization || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Experience</p>
                    <p className="font-medium">
                      {coachData?.years_experience || 0} years
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Hourly Rate</p>
                    <p className="font-medium">
                      ${coachData?.hourly_rate || 0}/hour
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Bio</p>
                    <p className="font-medium">
                      {coachData?.bio || "No bio available"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-4 md:mt-0">
                <Link href="/dashboard/edit-profile">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Edit Profile
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    Upcoming Sessions
                  </p>
                  <p className="text-2xl font-bold">5</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Hours This Week</p>
                  <p className="text-2xl font-bold">12</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <Clock className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Videos to Review</p>
                  <p className="text-2xl font-bold">8</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <Video className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">New Messages</p>
                  <p className="text-2xl font-bold">3</p>
                </div>
                <div className="bg-orange-100 p-3 rounded-full">
                  <MessageSquare className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Balance Section */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-xl shadow-lg mb-8 text-white">
            <h2 className="text-xl font-semibold mb-4">Payment Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
                <p className="text-sm opacity-80 mb-1">Scheduled Sessions</p>
                <p className="text-2xl font-bold">5</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
                <p className="text-sm opacity-80 mb-1">Confirmed Sessions</p>
                <p className="text-2xl font-bold">5</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
                <p className="text-sm opacity-80 mb-1">We Owe You</p>
                <p className="text-2xl font-bold">
                  ${coachData?.hourly_rate ? coachData.hourly_rate * 5 : 250}
                </p>
              </div>
            </div>
          </div>

          {/* Schedule Calendar */}
          <div className="mb-8">
            {/* Import the ScheduleCalendar component */}
            {/* @ts-expect-error Server Component */}
            <ScheduleCalendar />
          </div>

          {/* Videos to Review */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold mb-4">
              Videos Pending Review
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  <div className="relative aspect-video bg-gray-100">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Video className="w-12 h-12 text-gray-400" />
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center mb-2">
                      <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-200 mr-2">
                        <div className="absolute inset-0 flex items-center justify-center text-gray-600 font-bold text-xs">
                          JS
                        </div>
                      </div>
                      <span className="font-medium">John Smith</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Backhand technique practice
                    </p>
                    <p className="text-xs text-gray-500 mb-3">
                      Uploaded:{" "}
                      {new Date().toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                    <VideoReviewDialog
                      video={{
                        id: `video-${item}`,
                        playerName:
                          item === 1
                            ? "John Smith"
                            : item === 2
                              ? "Sarah Johnson"
                              : "Michael Chen",
                        title:
                          item === 1
                            ? "Backhand technique practice"
                            : item === 2
                              ? "Match preparation"
                              : "Footwork drills",
                        uploadDate: new Date().toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        }),
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
