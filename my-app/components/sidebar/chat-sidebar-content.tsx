"use client";

import { SidebarContent } from "../ui/sidebar";
import { Button } from "../ui/button";
import {
  Bot,
  MessageCircle,
  Plus,
  MoreVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useUser } from "@/hooks/context/user-context";
import { useChat } from "@/hooks/context/session-context";
import { Spinner } from "../ui/spinner";
import { DropdownMenuDialog } from "./chat-history-options";
import { useItinerary } from "@/hooks/context/itinerary-context";

interface Session {
  id: number;
  title: string;
  subtitle: string;
  createdAt: string;
  isActive: boolean;
}

export function ChatSidebarContent() {
  const supabase = createClient();
  const { user } = useUser();
  const [sessions, setSessions] = useState<Session[]>([]);
  const {active, setActive} = useChat();
  const [loading, setLoading] = useState(true);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const { itineraryData } = useItinerary();

  // Fetch sessions on mount
  // useEffect(() => {
  //   const fetchSessions = async () => {
  //     if (!user?.email) return;

  //     try {
  //       setLoading(true);
        
  //       // Get the authenticated user ID
  //       const { data: authData } = await supabase.auth.getUser();
  //       if (!authData.user) return;

  //       // Fetch sessions for this user
  //       const { data, error } = await supabase
  //         .from("sessions")
  //         .select("*")
  //         .eq("user_id", authData.user.id)
  //         .order("created_at", { ascending: false });

  //       if (error) throw error;

  //       // Transform the data to match our Session interface
  //       const transformedSessions = (data || []).map((session: any) => ({
  //         id: session.id,
  //         title: session.title || "Untitled Chat",
  //         subtitle: `Created ${formatDate(session.created_at)}`,
  //         createdAt: session.created_at,
  //         isActive: false,
  //       }));

  //       setSessions(transformedSessions);
  //     } catch (error) {
  //       console.error("Error fetching sessions:", error);
  //       toast.error("Failed to load chat history");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchSessions();
  // }, [user, active]);

  useEffect(() => {
    const fetchSessions = async () => {
      if (!user?.email) return;

      try {
        setLoading(true);
        
        const { data: authData } = await supabase.auth.getUser();
        if (!authData.user) return;

        const { data, error } = await supabase
          .from("sessions")
          .select("*")
          .eq("user_id", authData.user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        const transformedSessions = (data || []).map((session: any) => ({
          id: session.id,
          title: session.title || "Untitled Chat",
          subtitle: `Created ${formatDate(session.created_at)}`,
          createdAt: session.created_at,
          isActive: false,
        }));

        setSessions(transformedSessions);
      } catch (error) {
        console.error("Error fetching sessions:", error);
        toast.error("Failed to load chat history");
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [user, active, supabase]); // ✅ Keep the same dependencies

  const handleNewChat = async () => {
    if (!user?.email) {
      toast.error("User not authenticated");
      return;
    }

    setIsCreatingSession(true);

    try {
      // Get the authenticated user ID
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        toast.error("User not authenticated");
        return;
      }

      // Create a new session with a default title
      const defaultTitle = `New Chat`;
      
      const { data, error } = await supabase
        .from("sessions")
        .insert({
          user_id: authData.user.id,
          title: defaultTitle,
        })
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        const newSession = data[0];
        
        // Add the new session to the top of the list
        const newSessionFormatted = {
          id: newSession.id,
          title: newSession.title,
          subtitle: `Created just now`,
          createdAt: newSession.created_at,
          isActive: true,
        };

        // Mark all other sessions as inactive and add the new one
        setSessions((prevSessions) => [
          newSessionFormatted,
          ...prevSessions.map((s) => ({ ...s, isActive: false })),
        ]);
        setActive(newSession.id);
        
        toast.success("New chat created!");
        
        // Optional: Navigate to the new chat
        // router.push(`/chat/${newSession.id}`);
      }
    } catch (error: any) {
      console.error("Error creating session:", error);
      toast.error(error.message || "Failed to create new chat");
    } finally {
      setIsCreatingSession(false);
    }
  };

  const handleGetChat = async (id: number) => {
    setActive(id)
    console.log("Open chat", id)
  };
 
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <SidebarContent className="scrollbar-hide px-0">
      <div className="flex h-full flex-col gap-3 px-3 py-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-md">
            <MessageCircle className="h-4 w-4" />
            <span>Chats</span>
          </div>

          <Button
            size="sm"
            className="h-7 px-2 text-xs"
            variant="outline"
            onClick={handleNewChat}
            disabled={isCreatingSession}
          >
            <Plus />
            {isCreatingSession ? "Creating..." : "New Chat"}
          </Button>
        </div>

        {/* History List */}
        <div className="flex-1 space-y-1 overflow-y-auto pr-1">
          {loading ? (
            <div className="flex flex-1 items-center justify-center py-8">
              <Spinner />
              <div className="pl-2 text-md text-muted-foreground">Loading chats...</div>
            </div>
          ) : sessions.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <span className="text-sm text-muted-foreground">No chats yet. Create one to get started!</span>
            </div>
          ) : (
            sessions.map((item) => (
              <div
                key={item.id}
                role="button"
                tabIndex={0}
                className={cn(
                  "group flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-left text-md transition",
                  item.id === active
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted/70"
                )}
                onClick={() => handleGetChat(item.id)}
              >
                {/* Left icon */}
                <div className="flex items-center justify-center pt-1">
                  <Bot className="h-3.5 w-3.5 opacity-80" />
                </div>

                {/* Title + subtitle */}
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="text-md leading-tight line-clamp-2 wrap-break-word">
                    {itineraryData?.stops && itineraryData.stops.length > 0 ? itineraryData.title : item.title}
                  </span>

                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <span className="truncate max-w-full">{item.subtitle}</span>
                  </span>
                </div>

                {/* Ellipsis actions */}
                {/* <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="ml-auto h-6 w-6 p-0 opacity-100 hover:opacity-100 cursor-pointer rounded-full bg-transparent hover:bg-muted/50 focus:bg-muted/50"
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log("More actions for", item.id);
                  }}
                >
                  <MoreVertical className="h-3.5 w-3.5" />
                </Button> */}
                {/* <DropdownMenuDialog /> */}
              </div>
            ))
          )}
        </div>
      </div>
    </SidebarContent>
  );
}

function async(id: any) {
  throw new Error("Function not implemented.");
}
