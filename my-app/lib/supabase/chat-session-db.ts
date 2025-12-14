import { createClient } from "@/lib/supabase/client";

/**
 * Creates a new chat session in the database.
 * Returns the full session object (including id).
 */
export async function createChatSession(userId: string, title: string = "New Chat") {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from("sessions")
      .insert({
        user_id: userId,
        title: title,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating chat session:", error);
      throw error;
    }

    return data;
  } catch (err) {
    console.error("Unexpected error in createChatSession:", err);
    throw err;
  }
}