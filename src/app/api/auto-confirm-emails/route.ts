import { createClient } from "../../../../supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Get all users
    const { data: users, error: usersError } =
      await supabase.auth.admin.listUsers();

    if (usersError) {
      return NextResponse.json(
        { success: false, error: usersError.message },
        { status: 500 },
      );
    }

    // Auto-confirm all emails
    const updates = [];
    for (const user of users.users) {
      if (!user.email_confirmed_at) {
        const { error } = await supabase.auth.admin.updateUserById(user.id, {
          email_confirm: true,
        });
        updates.push({
          email: user.email,
          success: !error,
          error: error?.message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Attempted to confirm all user emails",
      updates,
    });
  } catch (error) {
    console.error("Error confirming emails:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
