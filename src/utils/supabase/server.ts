// supabase/server.ts
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/types/supabase"; // optional if you have types

export const createClient = () => {
  const supabase = createServerComponentClient<Database>({ cookies });
  return supabase;
};
