import DashboardNavbar from "@/components/dashboard-navbar";
import { Button } from "@/components/ui/button";
import { createClient } from "../../../../../../supabase/server";
import { redirect } from "next/navigation";
import { ArrowLeft, Plus, ArrowUp, ArrowDown, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default async function FeaturedContentPage() {
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

  if (userError || userData?.role !== "admin") {
    return redirect("/dashboard");
  }

  // Mock featured content data
  const featuredContent = [
    {
      id: 1,
      title: "Mastering the Backhand",
      description: "Learn the perfect backhand technique with Ramy Ashour",
      thumbnail: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=500&q=80",
      category: "Technique",
      featured_position: 1,
      views: 1245,
      created_at: "2023-06-15",
    },
    {
      id: 2,
      title: "Advanced Court Movement",
      description: "Improve your footwork and court coverage",
      thumbnail: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=500&q=80",
      category: "Fitness",
      featured_position: 2,
      views: 987,
      created_at: "2023-06-20",
    },
    {
      id: 3,
      title: "Match Strategy Essentials",
      description: "Develop winning strategies for your squash matches",
      thumbnail: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=500&q=80",
