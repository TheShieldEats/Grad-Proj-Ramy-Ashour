"use client";

import { useState, useEffect } from "react";
import { createClient } from "../../../supabase/client";
import { Calendar, Clock, User, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";

type Coach = {
  id: string;
  name: string;
  specialization: string;
  hourly_rate: number;
  years_experience: number;
  avatar_url?: string | null;
};

type TimeSlot = {
  id: string;
  coach_id: string;
  branch_id: string;
  session_date: string;
  start_time: string;
  end_time: string;
  status: string;
  branch_name: string;
};

type Branch = {
  id: string;
  name: string;
  location: string;
};

export default function BookSession() {
  const supabase = createClient();
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [filteredTimeSlots, setFilteredTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCoach, setSelectedCoach] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Fetch coaches, branches, and available time slots
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch coaches
        const { data: coachesData, error: coachesError } = await supabase.from(
          "coaches",
        ).select(`
            id,
            specialization,
            years_experience,
            hourly_rate,
            users:users!coaches_id_fkey(id, full_name, avatar_url)
          `);

        if (coachesError) throw coachesError;

        if (coachesData) {
          const formattedCoaches = coachesData.map((coach) => ({
            id: coach.id,
            name: coach.users?.full_name || "Unknown Coach",
            specialization: coach.specialization,
            hourly_rate: coach.hourly_rate,
            years_experience: coach.years_experience,
            avatar_url: coach.users?.avatar_url,
          }));
          setCoaches(formattedCoaches);
        }

        // Fetch branches
        const { data: branchesData, error: branchesError } = await supabase
          .from("branches")
          .select("id, name, location");

        if (branchesError) throw branchesError;

        if (branchesData) {
          setBranches(branchesData);
        }

        // Fetch available time slots
        const { data: slotsData, error: slotsError } = await supabase
          .from("coach_sessions")
          .select(
            `
            id,
            coach_id,
            branch_id,
            session_date,
            start_time,
            end_time,
            status,
            branch:branches(name)
          `,
          )
          .eq("status", "available");

        if (slotsError) throw slotsError;

        if (slotsData) {
          const formattedSlots = slotsData.map((slot) => ({
            id: slot.id,
            coach_id: slot.coach_id,
            branch_id: slot.branch_id,
            session_date: slot.session_date,
            start_time: slot.start_time,
            end_time: slot.end_time,
            status: slot.status,
            branch_name: slot.branch?.name || "Unknown Branch",
          }));
          setTimeSlots(formattedSlots);
          setFilteredTimeSlots(formattedSlots);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [supabase]);

  // Filter time slots based on selected criteria
  useEffect(() => {
    let filtered = [...timeSlots];

    if (selectedCoach) {
      filtered = filtered.filter((slot) => slot.coach_id === selectedCoach);
    }

    if (selectedBranch) {
      filtered = filtered.filter((slot) => slot.branch_id === selectedBranch);
    }

    if (selectedDate) {
      filtered = filtered.filter((slot) => slot.session_date === selectedDate);
    }

    if (selectedTime) {
      // Filter by time range (e.g., morning, afternoon, evening)
      const [hour] = selectedTime.split(":").map(Number);
      if (selectedTime === "morning") {
        filtered = filtered.filter((slot) => {
          const [slotHour] = slot.start_time.split(":").map(Number);
          return slotHour >= 6 && slotHour < 12;
        });
      } else if (selectedTime === "afternoon") {
        filtered = filtered.filter((slot) => {
          const [slotHour] = slot.start_time.split(":").map(Number);
          return slotHour >= 12 && slotHour < 17;
        });
      } else if (selectedTime === "evening") {
        filtered = filtered.filter((slot) => {
          const [slotHour] = slot.start_time.split(":").map(Number);
          return slotHour >= 17 && slotHour < 22;
        });
      } else {
        // Specific time
        filtered = filtered.filter((slot) => slot.start_time === selectedTime);
      }
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((slot) => {
        const coach = coaches.find((c) => c.id === slot.coach_id);
        return (
          coach?.name.toLowerCase().includes(query) ||
          coach?.specialization.toLowerCase().includes(query) ||
          slot.branch_name.toLowerCase().includes(query)
        );
      });
    }

    setFilteredTimeSlots(filtered);
  }, [
    timeSlots,
    selectedCoach,
    selectedBranch,
    selectedDate,
    selectedTime,
    searchQuery,
    coaches,
  ]);

  // Format time for display
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  // Get unique dates from available time slots
  const getUniqueDates = () => {
    const dates = timeSlots.map((slot) => slot.session_date);
    return [...new Set(dates)].sort();
  };

  // Get unique times from available time slots
  const getUniqueTimes = () => {
    const times = timeSlots.map((slot) => slot.start_time);
    return [...new Set(times)].sort();
  };

  // Book a session
  const bookSession = async (slotId: string) => {
    try {
      setLoading(true);
      setBookingError(null);

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setBookingError("You must be logged in to book a session");
        return;
      }

      // First check if user exists in the database
      const { data: userExists, error: checkError } = await supabase
        .from("users")
        .select("count")
        .eq("id", user.id)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        console.error("Error checking user existence:", checkError);
        setBookingError(
          "Unable to verify user account. Please contact support.",
        );
        return;
      }

      // If user doesn't exist or count is 0, create the user
      if (!userExists || checkError?.code === "PGRST116") {
        // Create user record if it doesn't exist
        const { error: createUserError } = await supabase.from("users").insert([
          {
            id: user.id,
            full_name:
              user.user_metadata?.full_name ||
              user.email?.split("@")[0] ||
              "Player",
            email: user.email,
          },
        ]);

        if (createUserError) {
          console.error("Error creating user record:", createUserError);
          setBookingError(
            "Unable to create user profile. Please contact support.",
          );
          return;
        }
      }

      // Update session status to booked
      const { error: updateError } = await supabase
        .from("coach_sessions")
        .update({
          status: "booked",
          player_id: user.id,
        })
        .eq("id", slotId);

      if (updateError) throw updateError;

      setBookingSuccess(true);

      // Refresh time slots
      const { data: updatedSlots, error: fetchError } = await supabase
        .from("coach_sessions")
        .select(
          `
          id,
          coach_id,
          branch_id,
          session_date,
          start_time,
          end_time,
          status,
          branch:branches(name)
        `,
        )
        .eq("status", "available");

      if (fetchError) throw fetchError;

      if (updatedSlots) {
        const formattedSlots = updatedSlots.map((slot) => ({
          id: slot.id,
          coach_id: slot.coach_id,
          branch_id: slot.branch_id,
          session_date: slot.session_date,
          start_time: slot.start_time,
          end_time: slot.end_time,
          status: slot.status,
          branch_name: slot.branch?.name || "Unknown Branch",
        }));
        setTimeSlots(formattedSlots);
      }

      // Reset filters
      setSelectedCoach(null);
      setSelectedBranch(null);
      setSelectedDate(null);
      setSelectedTime(null);
      setSearchQuery("");

      setTimeout(() => {
        setBookingSuccess(false);
      }, 5000);
    } catch (error) {
      console.error("Error booking session:", error);
      setBookingError("Failed to book session. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-800 text-white">
      <h2 className="text-xl font-semibold mb-4 text-white">
        Book a Training Session
      </h2>

      {bookingSuccess && (
        <div className="bg-green-900/30 border border-green-800 text-white p-4 rounded-md mb-6">
          Session booked successfully! You can view your upcoming sessions in
          your dashboard.
        </div>
      )}

      {bookingError && (
        <div className="bg-red-900/30 border border-red-800 text-white p-4 rounded-md mb-6">
          {bookingError}
        </div>
      )}

      <Tabs defaultValue="time" className="mb-6">
        <TabsList className="bg-gray-800 border border-gray-700">
          <TabsTrigger
            value="time"
            className="data-[state=active]:bg-red-600 text-white"
          >
            By Time
          </TabsTrigger>
          <TabsTrigger
            value="coach"
            className="data-[state=active]:bg-red-600 text-white"
          >
            By Coach
          </TabsTrigger>
          <TabsTrigger
            value="date"
            className="data-[state=active]:bg-red-600 text-white"
          >
            By Date
          </TabsTrigger>
        </TabsList>

        {/* Time-first booking flow */}
        <TabsContent value="time" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <h3 className="font-medium mb-3">Select Time</h3>
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    className={`p-2 rounded-md border ${selectedTime === "morning" ? "bg-red-600 border-red-700" : "bg-gray-700 border-gray-600 hover:bg-gray-600"}`}
                    onClick={() =>
                      setSelectedTime(
                        selectedTime === "morning" ? null : "morning",
                      )
                    }
                  >
                    Morning
                  </button>
                  <button
                    className={`p-2 rounded-md border ${selectedTime === "afternoon" ? "bg-red-600 border-red-700" : "bg-gray-700 border-gray-600 hover:bg-gray-600"}`}
                    onClick={() =>
                      setSelectedTime(
                        selectedTime === "afternoon" ? null : "afternoon",
                      )
                    }
                  >
                    Afternoon
                  </button>
                  <button
                    className={`p-2 rounded-md border ${selectedTime === "evening" ? "bg-red-600 border-red-700" : "bg-gray-700 border-gray-600 hover:bg-gray-600"}`}
                    onClick={() =>
                      setSelectedTime(
                        selectedTime === "evening" ? null : "evening",
                      )
                    }
                  >
                    Evening
                  </button>
                </div>
                <div className="mt-4">
                  <Label
                    htmlFor="specific-time"
                    className="text-sm text-gray-300 mb-1 block"
                  >
                    Or select specific time:
                  </Label>
                  <Select
                    value={selectedTime || "any-time"}
                    onValueChange={(value) =>
                      setSelectedTime(value === "any-time" ? null : value)
                    }
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 text-white">
                      <SelectItem value="any-time">Any time</SelectItem>
                      {getUniqueTimes().map((time) => (
                        <SelectItem key={time} value={time}>
                          {formatTime(time)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <h3 className="font-medium mb-3">Select Coach (Optional)</h3>
              <Select
                value={selectedCoach || "any-coach"}
                onValueChange={(value) =>
                  setSelectedCoach(value === "any-coach" ? null : value)
                }
              >
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Any coach" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  <SelectItem value="any-coach">Any coach</SelectItem>
                  {coaches.map((coach) => (
                    <SelectItem key={coach.id} value={coach.id}>
                      {coach.name} - {coach.specialization}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <h3 className="font-medium mb-3">Select Branch (Optional)</h3>
              <Select
                value={selectedBranch || "any-location"}
                onValueChange={(value) =>
                  setSelectedBranch(value === "any-location" ? null : value)
                }
              >
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Any location" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  <SelectItem value="any-location">Any location</SelectItem>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name} - {branch.location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>

        {/* Coach-first booking flow */}
        <TabsContent value="coach" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <h3 className="font-medium mb-3">Select Coach</h3>
              <Select
                value={selectedCoach || "any-coach"}
                onValueChange={(value) =>
                  setSelectedCoach(value === "any-coach" ? null : value)
                }
              >
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Select coach" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  <SelectItem value="any-coach">Any coach</SelectItem>
                  {coaches.map((coach) => (
                    <SelectItem key={coach.id} value={coach.id}>
                      {coach.name} - {coach.specialization}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <h3 className="font-medium mb-3">Select Time (Optional)</h3>
              <Select
                value={selectedTime || "any-time"}
                onValueChange={(value) =>
                  setSelectedTime(value === "any-time" ? null : value)
                }
              >
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Any time" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  <SelectItem value="any-time">Any time</SelectItem>
                  <SelectItem value="morning">Morning</SelectItem>
                  <SelectItem value="afternoon">Afternoon</SelectItem>
                  <SelectItem value="evening">Evening</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <h3 className="font-medium mb-3">Select Branch (Optional)</h3>
              <Select
                value={selectedBranch || "any-location"}
                onValueChange={(value) =>
                  setSelectedBranch(value === "any-location" ? null : value)
                }
              >
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Any location" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  <SelectItem value="any-location">Any location</SelectItem>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name} - {branch.location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>

        {/* Date-first booking flow */}
        <TabsContent value="date" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <h3 className="font-medium mb-3">Select Date</h3>
              <Select
                value={selectedDate || "any-date"}
                onValueChange={(value) =>
                  setSelectedDate(value === "any-date" ? null : value)
                }
              >
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Select date" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  <SelectItem value="any-date">Any date</SelectItem>
                  {getUniqueDates().map((date) => (
                    <SelectItem key={date} value={date}>
                      {formatDate(date)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <h3 className="font-medium mb-3">Select Coach (Optional)</h3>
              <Select
                value={selectedCoach || "any-coach"}
                onValueChange={(value) =>
                  setSelectedCoach(value === "any-coach" ? null : value)
                }
              >
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Any coach" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  <SelectItem value="any-coach">Any coach</SelectItem>
                  {coaches.map((coach) => (
                    <SelectItem key={coach.id} value={coach.id}>
                      {coach.name} - {coach.specialization}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <h3 className="font-medium mb-3">Select Branch (Optional)</h3>
              <Select
                value={selectedBranch || "any-location"}
                onValueChange={(value) =>
                  setSelectedBranch(value === "any-location" ? null : value)
                }
              >
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Any location" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  <SelectItem value="any-location">Any location</SelectItem>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name} - {branch.location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Search */}
      <div className="relative mb-6">
        <Input
          type="text"
          placeholder="Search by coach name, specialization, or location"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-gray-800 border-gray-700 text-white pl-10"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
      </div>

      {/* Available Sessions */}
      <h3 className="text-lg font-medium mb-3 text-white">
        Available Sessions
      </h3>

      {loading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
        </div>
      ) : filteredTimeSlots.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTimeSlots.map((slot) => {
            const coach = coaches.find((c) => c.id === slot.coach_id);
            return (
              <div
                key={slot.id}
                className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden hover:border-red-600 transition-colors"
              >
                <div className="p-4">
                  <div className="flex items-center mb-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-700 mr-3">
                      {coach?.avatar_url ? (
                        <Image
                          src={coach.avatar_url}
                          alt={coach.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm">
                          {coach?.name.charAt(0) || "C"}
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-white">
                        {coach?.name || "Unknown Coach"}
                      </h4>
                      <p className="text-xs text-gray-400">
                        {coach?.specialization || "General Training"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-300">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{formatDate(slot.session_date)}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-300">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>
                        {formatTime(slot.start_time)} -{" "}
                        {formatTime(slot.end_time)}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-300">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{slot.branch_name}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-white">
                      ${coach?.hourly_rate || 50}
                    </span>
                    <Button
                      onClick={() => bookSession(slot.id)}
                      disabled={loading}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Book Now
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-10 bg-gray-800 rounded-lg border border-gray-700">
          <Calendar className="w-16 h-16 mx-auto text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">
            No Available Sessions
          </h3>
          <p className="text-gray-400 max-w-md mx-auto">
            No sessions match your current filters. Try adjusting your search
            criteria or check back later for new availability.
          </p>
        </div>
      )}
    </div>
  );
}
