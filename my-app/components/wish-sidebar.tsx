"use client";

import { useState, useEffect, useRef } from "react";
import { useGroupWishes } from "@/hooks/use-group-wishes"; 
import { useUser } from "@/hooks/context/user-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Copy, Check, Users } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner"; 
import { useSupabase } from "@/hooks/context/supabase-context"; 
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Group {
  id: number;
  name: string;
  createdAt: string;
  secretCode: string;
}

export function WishSidebar({ group }: { group: Group }) {
  const supabase = useSupabase();
  const { user } = useUser();
  const { wishes, loading, sendWish } = useGroupWishes(group.id);
  
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // ✅ New State for Group Info
  const [isCopied, setIsCopied] = useState(false);


  // ✅ Handle Copy Logic
  const handleCopyCode = async () => {
    if (!group.secretCode) return; // ✅ Use prop directly
    
    try {
      await navigator.clipboard.writeText(group.secretCode);
      setIsCopied(true);
      toast.success("Secret code copied!");
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy code");
    }
  };

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
    await sendWish(input.trim(), user.id); 
    setInput("");
  };

  return (
    <div className="flex h-full flex-col w-full bg-background rounded-full">
      {/* HEADER SECTION */}
      {/* <div className="pl-5 pr-4 -mt-1.25 pb-3 pt-2 border-b bg-muted/20">
        <div className="flex items-center justify-between">
                    <h3 className="font-semibold flex items-center gap-2 text-md truncate max-w-[200px]">
            <Users className="w-4 h-4 text-primary shrink-0" />
            <span className="truncate">
              {group ? group.name : "Loading..."}
            </span>
          </h3>
        </div>
        <p className="text-[12px] text-muted-foreground mt-0.5 truncate">
            {group?.secretCode ? "Share code to invite friends" : "Chat with your group"}
        </p>
      </div> */}

      {/* CHAT AREA */}
      <ScrollArea className="h-[calc(100dvh-300px)] flex-1 pl-5 pb-2 pt-0" ref={scrollRef}>
        {loading ? (
          <div className="flex justify-center py-10"><Spinner /></div>
        ) : wishes.length === 0 ? (
          <div className="text-center text-md text-muted-foreground py-10 opacity-60">
            No messages yet. Start the conversation!
          </div>
        ) : (
          <div className="space-y-4 pr-4">
            {wishes.map((wish) => (
              <div key={wish.id} className="flex flex-col items-start">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-xs font-medium">{wish.sender_name}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(wish.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
                <div className="bg-muted/40 border rounded-2xl rounded-tl-none px-3 py-2 text-sm max-w-[95%] break-words">
                  {wish.message}
                </div>
              </div>
            ))}
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
        <Button size="icon" type="submit" disabled={!input.trim()} className="rounded-full shrink-0">
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}