"use server";

import { encodedRedirect } from "@/utils/utils";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "../utils/supabase/server";

// Helper function to create a user profile in the database
async function createUserProfile(supabase, user, userData) {
  const { fullName, email, role, approved } = userData;

  console.log(
    `Attempting to create user profile for ${email} with ID ${user.id}`,
  );

  // Implement retry mechanism with exponential backoff
  const maxRetries = 7; // Increased from 5 to 7 for more resilience
  let retryCount = 0;
  let success = false;
  let updateError = null;

  while (retryCount < maxRetries && !success) {
    try {
      // Add a small delay before retrying (exponential backoff)
      if (retryCount > 0) {
        const delay = Math.pow(2, retryCount) * 500; // 500ms, 1s, 2s, 4s, 8s, 16s, 32s
        await new Promise((resolve) => setTimeout(resolve, delay));
        console.log(
          `Retry attempt ${retryCount} after ${delay}ms delay for user ${user.id}`,
        );
      }

      // Check if user already exists in the users table
      const { data: existingUser, error: checkError } = await supabase
        .from("users")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (checkError) {
        console.error(`Error checking if user ${user.id} exists:`, checkError);
      } else if (existingUser) {
        console.log(
          `User ${user.id} already exists in users table, skipping creation`,
        );
        success = true;
        break;
      }

      // Log the exact data being inserted
      console.log("Inserting user data:", {
        id: user.id,
        name: fullName,
        full_name: fullName,
        email: email,
        role: role,
        approved: approved,
        email_verified: false,
      });

      // Use upsert instead of insert to handle potential race conditions
      const { error: insertError } = await supabase.from("users").upsert(
        {
          id: user.id,
          name: fullName,
          full_name: fullName,
          email: email,
          role: role,
          approved: approved,
          email_verified: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      );

      if (insertError) {
        console.error(
          `Insert attempt ${retryCount + 1} failed for user ${user.id}:`,
          {
            code: insertError.code,
            message: insertError.message,
            details: insertError.details,
            hint: insertError.hint,
            query: insertError.query,
          },
        );
        updateError = insertError;
      } else {
        console.log(
          `User profile created successfully on attempt ${retryCount + 1} for user ${user.id}`,
        );
        success = true;
        updateError = null;
      }
    } catch (attemptErr) {
      console.error(
        `Exception during user creation attempt ${retryCount + 1} for user ${user.id}:`,
        attemptErr,
      );
      updateError = {
        message: `Exception during user creation: ${attemptErr.message || "Unknown error"}`,
      };
    }

    retryCount++;
  }

  return { success, error: updateError };
}

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const fullName = formData.get("full_name")?.toString() || "";
  const role = formData.get("role")?.toString() || "player";
  const supabase = await createClient();
  const origin = headers().get("origin");

  console.log("Starting signUpAction with email:", email, "and role:", role);

  if (!email || !password) {
    console.log("Missing required fields: email or password");
    return encodedRedirect(
      "error",
      "/sign-up",
      "Email and password are required",
    );
  }

  // Validate email format before sending to Supabase
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.log("Invalid email format:", email);
    return encodedRedirect(
      "error",
      "/sign-up",
      "Please enter a valid email address",
    );
  }

  // Check if email already exists in the users table instead of auth.users
  try {
    console.log("Checking if email already exists in users table:", email);
    const { data: existingUser, error: userCheckError } = await supabase
      .from("users")
      .select("email")
      .eq("email", email)
      .maybeSingle();

    if (userCheckError) {
      console.error("Error checking existing users:", userCheckError);
    } else if (existingUser) {
      console.log("Email already exists in users table:", email);
      return encodedRedirect(
        "error",
        "/sign-up",
        "This email is already registered. Please use a different email or sign in.",
      );
    }
  } catch (checkError) {
    console.error("Exception checking existing users:", checkError);
    // Continue with signup even if check fails
  }

  // First create the auth user
  console.log("Creating auth user with email:", email);
  const {
    data: { user },
    error,
  } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        full_name: fullName,
        role: role, // Store role in user metadata
      },
    },
  });

  console.log(
    "Auth user creation result:",
    error
      ? `Error: ${error.code}: ${error.message}`
      : `Success: User ID ${user?.id}`,
  );

  if (error) {
    console.error("Auth signup error:", error.code, error.message);
    return encodedRedirect("error", "/sign-up", error.message);
  }

  if (!user || !user.id) {
    console.error("Auth user created but no user ID returned");
    return encodedRedirect(
      "error",
      "/sign-up",
      "Error creating user account. Please try again.",
    );
  }

  // Determine if the account should be auto-approved based on role
  const approved = role === "player" ? true : false;
  console.log(
    `User ${user.id} will be created with approved status:`,
    approved,
  );

  // Use the createUserProfile helper function for more robust user creation
  const { success, error: profileError } = await createUserProfile(
    supabase,
    user,
    {
      fullName,
      email,
      role,
      approved,
    },
  );

  if (success) {
    console.log("User profile created successfully for user ID:", user.id);
    return redirect("/profiles");
  } else {
    console.error("Failed to create user profile:", profileError);

    // Clean up the auth user to prevent orphaned accounts
    try {
      console.log("Cleaning up orphaned auth user:", user.id);
      await supabase.auth.admin.deleteUser(user.id);
    } catch (deleteError) {
      console.error(
        "Failed to delete auth user after profile creation error:",
        deleteError,
      );
    }

    return encodedRedirect(
      "error",
      "/sign-up",
      "Error creating user profile. Please try again later.",
    );
  }
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  // Remove grant_type from password authentication
  const { data: signInData, error: signInError } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (signInError) {
    return encodedRedirect("error", "/sign-in", signInError.message);
  }

  if (!signInData.user) {
    return encodedRedirect("error", "/sign-in", "No user found in session");
  }

  try {
    // Improved query with error handling
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role, approved")
      .eq("id", signInData.user.id)
      .single(); // Use single() instead of maybeSingle() since we expect a record

    if (userError) throw userError;

    // Handle approval status
    if (["coach", "admin"].includes(userData.role) && !userData.approved) {
      return encodedRedirect(
        "warning",
        "/sign-in",
        "Your account is pending approval from an administrator. You'll be notified when your account is approved."
      );
    }

  } catch (error) {
    console.error("Error fetching user profile:", error);
    // Handle case where user profile doesn't exist
    if ((error as any).code === "PGRST116") { // Code for no rows found
      return redirect("/create-profile");
    }
    return encodedRedirect(
      "error",
      "/sign-in",
      "Failed to retrieve user profile information"
    );
  }

  return redirect("/profiles");
};


export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const origin = headers().get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  // Check if the email exists in our system
  const { data: existingUser } = await supabase
    .from("users")
    .select("email")
    .eq("email", email)
    .limit(1);

  if (!existingUser || existingUser.length === 0) {
    // Don't reveal if email exists or not for security reasons
    return encodedRedirect(
      "success",
      "/forgot-password",
      "If your email is registered, you will receive a password reset link.",
    );
  }

  // Generate a unique token for this reset request
  const resetToken = crypto.randomUUID();
  const resetExpiry = new Date();
  resetExpiry.setHours(resetExpiry.getHours() + 24); // Token valid for 24 hours

  // Store the reset token in the database
  const { error: tokenError } = await supabase
    .from("password_reset_tokens")
    .upsert({
      email: email,
      token: resetToken,
      expires_at: resetExpiry.toISOString(),
      created_at: new Date().toISOString(),
    });

  if (tokenError) {
    console.error("Error storing reset token:", tokenError);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not process your request. Please try again.",
    );
  }

  // Create a unique reset URL with the token
  const resetUrl = `${origin}/auth/callback?redirect_to=/dashboard/reset-password&token=${resetToken}`;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: resetUrl,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password",
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return redirect("/forgot-password/reset-confirmation");
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const resetToken = formData.get("token") as string;

  if (!password || !confirmPassword) {
    return encodedRedirect(
      "error",
      "/dashboard/reset-password",
      "Password and confirm password are required",
    );
  }

  if (password !== confirmPassword) {
    return encodedRedirect(
      "error",
      "/dashboard/reset-password",
      "Passwords do not match",
    );
  }

  // Verify the reset token is valid and not expired if provided
  if (resetToken) {
    try {
      const { data: tokenData, error: tokenError } = await supabase
        .from("password_reset_tokens")
        .select("*")
        .eq("token", resetToken)
        .maybeSingle();

      if (tokenError || !tokenData) {
        return encodedRedirect(
          "error",
          "/forgot-password",
          "Invalid or expired password reset link. Please request a new one.",
        );
      }

      // Check if token is expired
      const expiryDate = new Date(tokenData.expires_at);
      if (expiryDate < new Date()) {
        return encodedRedirect(
          "error",
          "/forgot-password",
          "Your password reset link has expired. Please request a new one.",
        );
      }

      // Delete the used token to prevent reuse
      await supabase
        .from("password_reset_tokens")
        .delete()
        .eq("token", resetToken);
    } catch (error) {
      console.error("Error verifying reset token:", error);
      // Continue with password reset even if token verification fails
      // This allows users to reset their password from the dashboard
    }
  }

  // First check if the user is authenticated
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user && !resetToken) {
    return encodedRedirect(
      "error",
      "/dashboard/reset-password",
      "You must be logged in or have a valid reset token to change your password",
    );
  }

  // Update the password
  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    return encodedRedirect(
      "error",
      "/dashboard/reset-password",
      "Password update failed: " + error.message,
    );
  }

  return encodedRedirect(
    "success",
    "/sign-in",
    "Password updated successfully. You can now sign in with your new password.",
  );
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};
