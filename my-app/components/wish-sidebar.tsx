"use client";

import { useState, useEffect, useRef } from "react";
import { useGroupWishes } from "@/hooks/use-group-wishes"; // Make sure hook path is correct
import { useUser } from "@/hooks/context/user-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Sparkles } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner"; 

export function WishSidebar({ groupId }: { groupId: number }) {
  const { user } = useUser();
  const { wishes, loading, sendWish } = useGroupWishes(groupId);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
         scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [wishes]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || !user) return;
    
    // Optimistic UI update could go here, but Realtime is fast enough
    await sendWish(input.trim(), user.id); // Context user might have different ID structure, check this
    setInput("");
  };

  return (
    <div className="flex h-full flex-col w-full bg-background">
      <div className="pl-5 -mt-1 pb-2 border-b bg-muted/20">
        <h3 className="font-semibold flex items-center gap-2 text-md">
          <Sparkles className="w-4 h-4 text-primary" />
          Collaborative Wishlist
        </h3>
        <p className="text-[13px] text-muted-foreground mt-1">
          Chat with your group to decide where to go!
        </p>
      </div>

      <ScrollArea className="h-[calc(100dvh-300px)] flex-1 pl-5 pb-2 pt-3" ref={scrollRef}>
        {loading ? (
          <div className="flex justify-center py-10"><Spinner /></div>
        ) : wishes.length === 0 ? (
          <div className="text-center text-md text-muted-foreground py-10 opacity-60">
            No messages yet. Start the conversation!
          </div>
        ) : (
          <div className="space-y-4">
            {wishes.map((wish) => {
              const isMe = user?.email === (wish as any).user_email;
              // const isMe = user?.id === wish.user_id;

              return (
                <div
                  key={wish.id}
                  className={`flex flex-col ${
                    // simple toggle for alignment visual
                    "items-start"
                  }`}
                >
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-xs font-sm">{wish.sender_name}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(wish.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                  <div className="bg-muted/40 border rounded-lg px-3 py-2 text-sm max-w-[90%] wrap-break-word">
                    {wish.message}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      <form onSubmit={handleSend} className="p-4 border-t mt-auto gap-2 flex">
        <Input
          placeholder="I want to see..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 rounded-full"
        />
        <Button size="icon" type="submit" disabled={!input.trim()} className="rounded-full">
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}