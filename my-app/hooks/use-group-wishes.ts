"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export interface Wish {
  id: number;
  message: string;
  user_id: string;
  created_at: string;
  sender_name?: string; // Optional: loaded from profile
}

export function useGroupWishes(groupId: number) {
  const supabase = createClient();
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch initial history
  useEffect(() => {
    if (!groupId) return;

    const fetchHistory = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("group_wishes")
        .select(`
          *,
          users:user_id ( name ) 
        `)
        .eq("group_id", groupId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching wishes:", error);
        toast.error("Failed to load wishes");
      } else {
        // Map the joined user data to a flat structure if needed
        const formatted = data.map((item: any) => ({
          ...item,
          sender_name: item.users?.name || "Unknown",
        }));
        setWishes(formatted);
      }
      setLoading(false);
    };

    fetchHistory();
  }, [groupId, supabase]);

  // 2. Set up Realtime Subscription
  useEffect(() => {
    if (!groupId) return;

    const channel = supabase
      .channel(`group-wishes-${groupId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "group_wishes",
          filter: `group_id=eq.${groupId}`,
        },
        async (payload) => {
          // When a new wish arrives, we only get the raw row (no user name).
          // We need to fetch the user name quickly to display it.
          const newWish = payload.new as Wish;
          
          const { data: userData } = await supabase
            .from("users")
            .select("name")
            .eq("id", newWish.user_id)
            .single();

          const wishWithUser = {
            ...newWish,
            sender_name: userData?.name || "Someone",
          };

          // Update state instantly
          setWishes((prev) => [...prev, wishWithUser]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId, supabase]);

  // 3. Helper to send a message
  const sendWish = async (message: string, userId: string) => {
    const { error } = await supabase.from("group_wishes").insert({
      group_id: groupId,
      user_id: userId,
      message: message,
    });

    if (error) {
      console.error("Error sending wish:", error);
      toast.error("Failed to send wish");
      throw error;
    }
    // No need to update state manually; the subscription above will catch the INSERT event
  };

  return { wishes, loading, sendWish };
}