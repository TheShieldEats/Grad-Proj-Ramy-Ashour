import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { message, userId } = await request.json();

    if (!message) {
      return NextResponse.json(
        { success: false, error: "Message is required" },
        { status: 400 },
      );
    }

    // Get user role if userId is provided
    let userRole = "visitor";
    if (userId) {
      const supabase = await createClient();
      const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", userId)
        .single();

      if (userData) {
        userRole = userData.role;
      }
    }

    // Call external LLM API (example using Hugging Face Inference API)
    try {
      const response = await fetch(
        "https://api-inference.huggingface.co/models/google/flan-t5-xxl",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Add your API key if needed
            // "Authorization": "Bearer YOUR_HUGGINGFACE_API_KEY"
          },
          body: JSON.stringify({
            inputs: `You are a helpful assistant for the Ramy Ashour Squash Academy. The user is a ${userRole}. They are asking: ${message}. Provide a helpful response.`,
            parameters: {
              max_length: 500,
              temperature: 0.7,
            },
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      if (data && data[0] && data[0].generated_text) {
        return NextResponse.json({
          success: true,
          response: data[0].generated_text,
        });
      }

      throw new Error("Unexpected response format from LLM API");
    } catch (error) {
      console.error("Error calling external LLM API:", error);

      // Fallback to a more generic response
      return NextResponse.json({
        success: true,
        response:
          "I don't have specific information about that, but I'd be happy to help you with questions about squash training, booking sessions, or our academy services.",
      });
    }
  } catch (error) {
    console.error("Error in chat API route:", error);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 },
    );
  }
}
