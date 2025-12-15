import { createClient } from "@/lib/supabase/client";
import { createChatSession } from "./chat-session-db";

export async function saveItineraryToDatabase(
  itinerary: any,
  query: string,
  userId: string,
  sessionId: number | null,
  groupId: number | null
) {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from("itineraries")
      .insert([
        {
          user_id: userId,
          session_id: sessionId || null,
          group_id: groupId || null,
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
    return { data };
  } catch (err: any) {
    console.error("Error saving to database:", err);
    throw err;
  }
}