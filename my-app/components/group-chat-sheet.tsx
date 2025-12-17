"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Boxes, CheckCheck, Copy, Users } from "lucide-react";
import { WishSidebar } from "./wish-sidebar";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useSupabase } from "@/hooks/context/supabase-context";
import { useUser } from "@/hooks/context/user-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Group {
  id: number;
  name: string;
  createdAt: string;
  secretCode: string;
  createdBy: string;
}

interface GroupChatSheetProps {
  group: Group | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GroupChatSheet({ group, open, onOpenChange }: GroupChatSheetProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [members, setMembers] = useState<{ name: string; isCurrentUser?: boolean }[]>([]);
  const supabase = useSupabase();
  const { user: currentUser } = useUser();

  // Fetch Members when sheet opens
  useEffect(() => {
    if (!open || !group?.id) return;

    const fetchMembers = async () => {
      const { data, error } = await supabase
        .from("group_members")
        .select(`
          user:users (
            name
          )
        `)
        .eq("group_id", group.id);

      if (error) {
        console.error("Error fetching members:", error);
      } else if (data) {
        // Map response to a clean list of names
        let memberList = data.map((m: any) => ({
          name: m.user?.name || "Unknown User",
          isCurrentUser: false,
        }));

        // Add current user if not already in the list
        if (currentUser?.name) {
          const currentUserExists = memberList.some(
            (m) => m.name.toLowerCase() === currentUser.name.toLowerCase()
          );
          if (!currentUserExists) {
            memberList.unshift({
              name: currentUser.name,
              isCurrentUser: true,
            });
          } else {
            // Mark them as current user if they're in the list
            memberList = memberList.map((m) =>
              m.name.toLowerCase() === currentUser.name.toLowerCase()
                ? { ...m, isCurrentUser: true }
                : m
            );
          }
        }

        setMembers(memberList);
      }
    };

    fetchMembers();
  }, [open, group?.id, supabase, currentUser?.name]);

  const handleCopyCode = async () => {
    if (!group?.secretCode) return;
    
    try {
      await navigator.clipboard.writeText(group.secretCode);
      setIsCopied(true);
      toast.success("Secret code copied!");
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy code");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:w-[450px] p-0 border-l flex flex-col h-full rounded-l-2xl">
        <SheetHeader className="px-4 py-3 border-b shrink-0">
          <SheetTitle className="text-lg flex items-center gap-2 wrap-normal">
            <Boxes className="w-4 h-4 text-primary" />
            <span className="truncate max-w-[150px]">{group?.name || "Group Chat"}</span>
            
            {/* MEMBERS DROPDOWN BUTTON */}
            {group && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-1 h-6 px-2 gap-1 text-muted-foreground hover:text-foreground bg-muted cursor-pointer"
                  >
                    <Users className="h-3 w-3" />
                    <span className="text-[10px]">Members</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuLabel className="text-xs font-bold text-muted-foreground">
                    {members.length} Member{members.length !== 1 ? 's' : ''}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <ScrollArea className="h-[200px]">
                    {members.length > 0 ? (
                      members.map((member, i) => (
                        <DropdownMenuItem key={i} className="text-sm">
                          {member.name}
                          {member.isCurrentUser && (
                            <span className="ml-2 text-xs text-muted-foreground">(You)</span>
                          )}
                        </DropdownMenuItem>
                      ))
                    ) : (
                      <div className="p-2 text-xs text-muted-foreground">Loading...</div>
                    )}
                  </ScrollArea>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* SECRET CODE BUTTON */}
            {group?.secretCode && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm" 
                      className="ml-1 h-6 px-1 gap-1 text-muted-foreground hover:text-foreground bg-muted cursor-pointer"
                      onClick={handleCopyCode}
                    >
                      {isCopied ? (
                        <CheckCheck className="h-2 w-2" />
                      ) : (
                        <Copy className="h-2 w-2 text-2xl" />
                      )}
                      <span className="text-[10px]">Secret Code</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Click to copy invite code</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 min-h-0 overflow-hidden relative">
          {group && <WishSidebar group={group} />}
        </div>
      </SheetContent>
    </Sheet>
  );
}