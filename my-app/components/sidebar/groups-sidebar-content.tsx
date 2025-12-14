"use client";

import { SidebarContent } from "../ui/sidebar";
import { Button } from "../ui/button";
import { Boxes, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useUser } from "@/hooks/context/user-context";
import { useChat } from "@/hooks/context/session-context";
import { Spinner } from "../ui/spinner";
import { useSupabase } from "@/hooks/context/supabase-context";
import { GroupChatSheet } from "../group-chat-sheet";

interface Group {
  id: number;
  name: string;
  createdAt: string;
}

export function GroupsSidebarContent() {
  const supabase = useSupabase();
  const { user } = useUser();
  const [groups, setGroups] = useState<Group[]>([]);
  const { setActive } = useChat();
  const [loading, setLoading] = useState(true);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);

  // Sheet State
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  const fetchGroups = useCallback(async () => {
    if (!user?.email) return;
    try {
      setLoading(true);
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) return;
      const { data, error } = await supabase
        .from("groups")
        .select("*")
        .eq("created_by", authData.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const transformedGroups = (data || []).map((group: any) => ({
        id: group.id,
        name: group.name || "Untitled Group",
        createdAt: group.created_at,
      }));
      setGroups(transformedGroups);
    } catch (error) {
      console.error("Error fetching groups:", error);
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const handleNewGroup = async () => {
    if (!user?.email) return;
    setIsCreatingGroup(true);
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) return;
      
      const defaultName = `New Group ${groups.length + 1}`;
      const { data, error } = await supabase
        .from("groups")
        .insert({ created_by: authData.user.id, name: defaultName })
        .select().single();

      if (error) throw error;
      if (data) {
        const newGroup = { id: data.id, name: data.name, createdAt: data.created_at };
        setGroups((prev) => [newGroup, ...prev]);
        
        // Auto-open the new group
        setSelectedGroup(newGroup);
        setIsSheetOpen(true);
        toast.success("Group created");
      }
    } catch (error: any) {
      toast.error("Failed to create group");
    } finally {
      setIsCreatingGroup(false);
    }
  };

  const handleSelectGroup = (group: Group) => {
    setActive(group.id);
    setSelectedGroup(group);
    setIsSheetOpen(true);
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();

  return (
    <>
      <SidebarContent className="scrollbar-hide px-0">
        <div className="flex h-full flex-col gap-3 px-3 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-md">
              <Boxes className="h-4 w-4" />
              <span>My Groups</span>
            </div>
            <Button
              size="sm"
              className="h-7 px-2 text-xs"
              variant="outline"
              onClick={handleNewGroup}
              disabled={isCreatingGroup}
            >
              <Plus className="h-4 w-4" />
              {isCreatingGroup ? "..." : "New"}
            </Button>
          </div>

          <div className="flex-1 space-y-1 overflow-y-auto pr-1">
            {loading ? (
              <div className="flex justify-center py-8"><Spinner /></div>
            ) : groups.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">No groups yet.</div>
            ) : (
              groups.map((group) => (
                <div
                  key={group.id}
                  onClick={() => handleSelectGroup(group)}
                  className={cn(
                    "flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-left text-md transition",
                    selectedGroup?.id === group.id && isSheetOpen
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted/70"
                  )}
                >
                  <div className="flex items-center justify-center pt-1">
                    <Boxes className="h-3.5 w-3.5 opacity-80" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate">{group.name}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {formatDate(group.createdAt)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </SidebarContent>

      <GroupChatSheet 
        group={selectedGroup} 
        open={isSheetOpen} 
        onOpenChange={setIsSheetOpen} 
      />
    </>
  );
}