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
    // 1. Insert the MAIN itinerary (for the Creator)
    const { data: creatorData, error: creatorError } = await supabase
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

    if (creatorError) {
      console.error("Error saving creator itinerary:", creatorError);
      throw creatorError;
    }

    // 2. If this is a Group Trip, create copies for all other members
    if (groupId) {
      // A. Fetch all members of the group
      const { data: members, error: membersError } = await supabase
        .from("group_members")
        .select("user_id")
        .eq("group_id", groupId);

      if (membersError) {
        console.error("Error fetching group members for copying:", membersError);
      } else if (members && members.length > 0) {
        
        // B. Filter out the creator (they already got their copy in step 1)
        const otherMembers = members.filter((m: any) => m.user_id !== userId);

        if (otherMembers.length > 0) {
          console.log(`Creating copies for ${otherMembers.length} group members...`);

          // C. Prepare payload for bulk insert
          // Note: Copies usually do NOT share the same 'session_id' as the chat belongs to the creator
          const copies = otherMembers.map((m: any) => ({
            user_id: m.user_id, // Assign to the member
            group_id: groupId,
            session_id: null,   // Member copies are standalone (no chat session link)
            title: itinerary.title || "Untitled Itinerary",
            prompt: query.trim(),
            stops: itinerary,
            favorites: false,
            published: false,
          }));

          // D. Bulk Insert
          const { error: copyError } = await supabase
            .from("itineraries")
            .insert(copies);

          if (copyError) {
            console.error("Failed to create member copies:", copyError);
          } else {
            console.log("Successfully distributed itinerary to group members.");
          }
        }
      }
    }

    console.log("Itinerary saved successfully:", creatorData);
    return { data: creatorData };

  } catch (err: any) {
    console.error("Error saving to database:", err);
    throw err;
  }
}