import { createClient } from "../../../../supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Create admin account
    const { data: adminData, error: adminError } = await supabase.auth.signUp({
      email: "verified-admin@squashacademy.com",
      password: "Admin123!",
      options: {
        data: {
          full_name: "Verified Admin",
          role: "admin",
        },
      },
    });

    if (adminError) {
      console.error("Admin creation error:", adminError);
      // If user already exists, try to update instead
      if (adminError.message.includes("already exists")) {
        const { data: existingUser } = await supabase
          .from("users")
          .select("id")
          .eq("email", "verified-admin@squashacademy.com")
          .single();

        if (existingUser) {
          await supabase
            .from("users")
            .update({
              role: "admin",
              full_name: "Verified Admin",
              name: "Verified Admin",
            })
            .eq("id", existingUser.id);
        }
      } else {
        throw adminError;
      }
    } else if (adminData.user) {
      // Update admin role in users table
      await supabase.from("users").upsert({
        id: adminData.user.id,
        email: "verified-admin@squashacademy.com",
        full_name: "Verified Admin",
        name: "Verified Admin",
        role: "admin",
        user_id: adminData.user.id,
        token_identifier: adminData.user.id,
        created_at: new Date().toISOString(),
      });
    }

    // Verify the email
    try {
      // Get the user ID
      const { data: userData } = await supabase
        .from("users")
        .select("id")
        .eq("email", "verified-admin@squashacademy.com")
        .single();

      if (userData) {
        // Verify the email using admin API
        await supabase.auth.admin.updateUserById(userData.id, {
          email_confirm: true,
        });
      }
    } catch (err) {
      console.error("Error verifying email:", err);
    }

    return NextResponse.json({
      success: true,
      message: "Verified admin account created or updated successfully",
      account: {
        email: "verified-admin@squashacademy.com",
        password: "Admin123!",
      },
    });
  } catch (error) {
    console.error("Error creating verified admin:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
