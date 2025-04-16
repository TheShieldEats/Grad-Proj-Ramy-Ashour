import { createClient } from "../../../supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/navbar";
import ProfileSelector from "@/components/profile-selector";

export default async function ProfilesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-foreground text-center">
            Select Player Profile
          </h1>
          <ProfileSelector />
        </div>
      </main>
    </div>
  );
}
