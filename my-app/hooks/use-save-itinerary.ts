import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useChat } from "@/hooks/context/session-context";
import { useUser } from "@/hooks/context/user-context";
import { saveItineraryToDatabase } from "@/lib/supabase/itinerary-db";

export function useSaveItinerary() {
  const supabase = createClient();
  const { active } = useChat();
  const { user } = useUser();
  const [error, setError] = useState<string | null>(null);

  const save = async (itinerary: any, query: string) => {
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        throw new Error("User not authenticated");
      }

      // if (!active) {
      //   throw new Error("No active session");
      // }

      console.log("Saving itinerary:", itinerary, query, authData.user.id, active);

      const result = await saveItineraryToDatabase(
        itinerary,
        query,
        authData.user.id,
        active
      );
      setError(null);

      return result;
    } catch (err: any) {
      const errorMsg = err.message || "Failed to save itinerary";
      setError(errorMsg);
      throw err;
    }
  };

  return { save, error };
}