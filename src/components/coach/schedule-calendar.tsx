"use client";

import { useState } from "react";
import { Calendar, Clock, User } from "lucide-react";
import SessionDetailsDialog from "./session-details-dialog";
import RescheduleDialog from "./reschedule-dialog";

type Session = {
  id: string;
  date: string;
  time: string;
  duration: string;
  playerName: string;
  playerEmail: string;
  playerPhone?: string;
  type: string;
  status: string;
};

export default function ScheduleCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Mock data for coach sessions
  const sessions: Session[] = [
    {
      id: "1",
      date: "2025-07-05",
      time: "09:00",
      duration: "60",
      playerName: "John Smith",
      playerEmail: "john@example.com",
      playerPhone: "+20 123 456 7890",
      type: "Technical Training",
      status: "Confirmed",
    },
    {
      id: "2",
      date: "2025-07-05",
      time: "11:00",
      duration: "60",
      playerName: "Sarah Johnson",
      playerEmail: "sarah@example.com",
      playerPhone: "+20 123 456 7891",
      type: "Match Strategy",
      status: "Confirmed",
    },
    {
      id: "3",
      date: "2025-07-06",
      time: "14:00",
      duration: "60",
      playerName: "Michael Chen",
      playerEmail: "michael@example.com",
      playerPhone: "+20 123 456 7892",
      type: "Fitness Training",
      status: "Confirmed",
    },
    {
      id: "4",
      date: "2025-07-07",
      time: "10:00",
      duration: "60",
      playerName: "Emma Rodriguez",
      playerEmail: "emma@example.com",
      playerPhone: "+20 123 456 7893",
      type: "Technical Training",
      status: "Confirmed",
    },
    {
      id: "5",
      date: "2025-07-08",
      time: "15:00",
      duration: "60",
      playerName: "David Kim",
      playerEmail: "david@example.com",
      playerPhone: "+20 123 456 7894",
      type: "Match Strategy",
      status: "Confirmed",
    },
  ];

  // Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get day of week for first day of month
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  // Format date as YYYY-MM-DD
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Get sessions for a specific date
  const getSessionsForDate = (date: Date) => {
    const formattedDate = formatDate(date);
    return sessions.filter((session) => session.date === formattedDate);
  };

  // Handle date selection
  const handleDateClick = (day: number) => {
    const newDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day,
    );
    setSelectedDate(newDate);
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-12"></div>);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const formattedDate = formatDate(date);
      const sessionsForDay = sessions.filter(
        (session) => session.date === formattedDate,
      );
      const hasSession = sessionsForDay.length > 0;
      const isSelected =
        selectedDate &&
        day === selectedDate.getDate() &&
        month === selectedDate.getMonth() &&
        year === selectedDate.getFullYear();

      days.push(
        <div
          key={`day-${day}`}
          className={`h-12 border border-gray-200 p-1 cursor-pointer transition-colors hover:bg-blue-50 ${isSelected ? "bg-blue-100" : ""}`}
          onClick={() => handleDateClick(day)}
        >
          <div className="flex flex-col h-full">
            <span className="text-sm">{day}</span>
            {hasSession && (
              <div className="mt-auto">
                <span className="text-xs bg-blue-600 text-white px-1 rounded-sm">
                  {sessionsForDay.length} session
                  {sessionsForDay.length !== 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>
        </div>,
      );
    }

    return days;
  };

  // Navigate to previous month
  const prevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    );
    setSelectedDate(null);
  };

  // Navigate to next month
  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );
    setSelectedDate(null);
  };

  // Format time for display
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-semibold mb-4">Your Schedule</h2>

      {/* Calendar Navigation */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={prevMonth}
          className="p-2 rounded-md hover:bg-gray-100 transition-colors"
        >
          &lt; Prev
        </button>
        <h3 className="text-lg font-medium">
          {currentDate.toLocaleString("default", {
            month: "long",
            year: "numeric",
          })}
        </h3>
        <button
          onClick={nextMonth}
          className="p-2 rounded-md hover:bg-gray-100 transition-colors"
        >
          Next &gt;
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-6">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="h-8 flex items-center justify-center font-medium text-sm"
          >
            {day}
          </div>
        ))}
        {generateCalendarDays()}
      </div>

      {/* Selected Date Sessions */}
      {selectedDate && (
        <div>
          <h3 className="text-lg font-medium mb-3">
            Sessions for{" "}
            {selectedDate.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </h3>

          <div className="space-y-3">
            {getSessionsForDate(selectedDate).length > 0 ? (
              getSessionsForDate(selectedDate).map((session) => (
                <div
                  key={session.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  data-session-id={session.id}
                  data-date={session.date}
                  data-time={session.time}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{session.type}</h4>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>
                          {formatTime(session.time)} ({session.duration} min)
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <User className="w-4 h-4 mr-1" />
                        <span>{session.playerName}</span>
                      </div>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        session.status === "Confirmed"
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {session.status}
                    </span>
                  </div>
                  <div className="mt-3 flex justify-end space-x-2">
                    <SessionDetailsDialog session={session} />
                    <RescheduleDialog session={session} />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                <p>No sessions scheduled for this day</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
