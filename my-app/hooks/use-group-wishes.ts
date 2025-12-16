"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export interface Wish {
  id: number;
  message: string;
  user_id: string;
  created_at: string;
  sender_name?: string;
  isOptimistic?: boolean; // Flag to identify temporary messages
}

export function useGroupWishes(groupId: number) {
  const supabase = createClient();
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);

  // Keep track of processed IDs to prevent duplicates
  const processedIds = useRef(new Set<number>());

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
        const formatted = data.map((item: any) => {
          processedIds.current.add(item.id); // Mark existing IDs as seen
          return {
            ...item,
            sender_name: item.users?.name || "Unknown",
          };
        });
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
          const newWish = payload.new as Wish;

          // Deduplication: If we already have this ID (from fetch), ignore it
          if (processedIds.current.has(newWish.id)) return;
          processedIds.current.add(newWish.id);

          // Fetch sender name
          const { data: userData } = await supabase
            .from("users")
            .select("name")
            .eq("id", newWish.user_id)
            .single();

          const wishWithUser = {
            ...newWish,
            sender_name: userData?.name || "Someone",
          };

          setWishes((prev) => {
            // Remove any optimistic message that matches this one (by user and text)
            // This prevents "double messages" appearing for a split second
            const filtered = prev.filter(
              (w) => !(w.isOptimistic && w.message === wishWithUser.message && w.user_id === wishWithUser.user_id)
            );
            return [...filtered, wishWithUser];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId, supabase]);

  // 3. Helper to send a message (Optimistic Update)
  const sendWish = async (message: string, userId: string, userName: string) => {    
    // Create temporary optimistic wish
    const optimisticWish: Wish = {
      id: Date.now(), // Temp ID
      message,
      user_id: userId,
      created_at: new Date().toISOString(),
      sender_name: userName, // Or pass the real name if you update the function signature
      isOptimistic: true,
    };

    // 2. Update UI Immediately
    setWishes((prev) => [...prev, optimisticWish]);

    // 3. Send to DB
    const { error } = await supabase.from("group_wishes").insert({
      group_id: groupId,
      user_id: userId,
      message: message,
    });

    if (error) {
      console.error("Error sending wish:", error);
      toast.error("Failed to send wish");
      // Rollback on error
      setWishes((prev) => prev.filter((w) => w.id !== optimisticWish.id));
      throw error;
    }
    // Success! The subscription will eventually replace this optimistic wish with the real one.
  };

  return { wishes, loading, sendWish };
}