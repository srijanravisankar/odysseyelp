import { createClient } from "@/lib/supabase/client";
import { createChatSession } from "./chat-session-db";

export async function saveItineraryToDatabase(
  itinerary: any,
  query: string,
  userId: string,
  sessionId: number | null
) {
  const supabase = createClient();

  try {
    // 1. Get User ID (pseudo-code)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log("No user");
      return;
    }

    // 2. Create the session using your new DB function
    const newSession = await createChatSession(user.id, itinerary.title);

    if (newSession) {
      console.log("Created Session:", newSession.id);
    }

    const { data, error } = await supabase
      .from("itineraries")
      .insert([
        {
          user_id: userId,
          session_id: newSession.id,
          title: itinerary.title || "Untitled Itinerary",
          prompt: query.trim(),
          stops: itinerary,
        },
      ])
      .select();

    if (error) {
      console.error("Error saving itinerary:", error);
      throw error;
    }

    console.log("Itinerary saved successfully:", data);
    return data;
  } catch (err: any) {
    console.error("Error saving to database:", err);
    throw err;
  }
}