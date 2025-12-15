import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useChat } from "@/hooks/context/session-context";
import { useUser } from "@/hooks/context/user-context";
import { saveItineraryToDatabase } from "@/lib/supabase/itinerary-db";
import { createChatSession } from "@/lib/supabase/chat-session-db";
import { group } from "console";
import { useGroup } from "./context/group-context";

export function useSaveItinerary() {
  const supabase = createClient();
  const { active } = useChat();
  const { user } = useUser();
  const [error, setError] = useState<string | null>(null);
  const { activeGroup } = useGroup();

  const save = async (itinerary: any, query: string, createChat: boolean = true) => {
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        throw new Error("User not authenticated");
      }

      // if (!active) {
      //   throw new Error("No active session");
      // }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log("No user");
        return;
      }

      var sessionId = null
      var groupId = null;

      if (createChat) {
        console.log("Creating new chat session for itinerary");
        const newSession = await createChatSession(authData.user.id, itinerary.title);
        if (newSession) {
          console.log("Created Session:", newSession.id);
          sessionId = newSession.id;
        }
      } else {
        groupId = activeGroup?.id || null;
      }

      console.log("Saving itinerary:", itinerary, query, authData.user.id, active);

      const result = await saveItineraryToDatabase(
        itinerary,
        query,
        authData.user.id,
        sessionId,
        groupId
      );
      setError(null);

      return { result, sessionId };
    } catch (err: any) {
      const errorMsg = err.message || "Failed to save itinerary";
      setError(errorMsg);
      throw err;
    }
  };

  return { save, error };
}