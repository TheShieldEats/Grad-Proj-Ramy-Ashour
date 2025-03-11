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

    // Verify all emails
    const updates = [];
    for (const user of users.users) {
      if (!user.email_confirmed_at) {
        try {
          const { error } = await supabase.auth.admin.updateUserById(user.id, {
            email_confirm: true,
          });
          updates.push({
            email: user.email,
            success: !error,
            error: error?.message,
          });
        } catch (err) {
          updates.push({
            email: user.email,
            success: false,
            error: err.message,
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "All user emails have been verified",
      updates,
    });
  } catch (error) {
    console.error("Error verifying emails:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
