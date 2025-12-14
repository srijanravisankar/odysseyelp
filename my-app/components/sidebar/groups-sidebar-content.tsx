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

interface Group {
  id: number;
  name: string;
  createdAt: string;
}

export function GroupsSidebarContent() {
  const supabase = useSupabase();
  const { user } = useUser();
  const [groups, setGroups] = useState<Group[]>([]);
  // We reuse 'active' from session-context, or you might want a separate context for groups later
  const { active, setActive } = useChat(); 
  const [loading, setLoading] = useState(true);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);

  // 1. Define the fetch function
  const fetchGroups = useCallback(async () => {
    if (!user?.email) return;

    try {
      setLoading(true);
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) return;

      // ✅ Query the 'groups' table, not 'chats'
      const { data, error } = await supabase
        .from("groups")
        .select("*")
        .eq("created_by", authData.user.id) // Filter by creator
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
      toast.error("Failed to load groups");
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  // 2. Initial Fetch
  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  // 3. Create Group Handler
  const handleNewGroup = async () => {
    if (!user?.email) {
      toast.error("User not authenticated");
      return;
    }

    setIsCreatingGroup(true);

    try {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        toast.error("User not authenticated");
        return;
      }

      const defaultName = `New Group ${groups.length + 1}`;
      
      // ✅ Insert into 'groups' table
      const { data, error } = await supabase
        .from("groups")
        .insert({
          created_by: authData.user.id, // Match your schema (created_by)
          name: defaultName,            // Match your schema (name)
        })
        .select()
        .single(); // Expecting one row

      if (error) throw error;

      if (data) {
        const newGroup = {
          id: data.id,
          name: data.name,
          createdAt: data.created_at,
        };

        setGroups((prev) => [newGroup, ...prev]);
        setActive(data.id); // Set the new group as active
        toast.success("New group created!");
      }
    } catch (error: any) {
      console.error("Error creating group:", error);
      toast.error(error.message || "Failed to create group");
    } finally {
      setIsCreatingGroup(false);
    }
  };

  const handleSelectGroup = (id: number) => {
    setActive(id);
    console.log("Selected group:", id);
    // You will likely want to navigate to a group page here eventually
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <SidebarContent className="scrollbar-hide px-0">
      <div className="flex h-full flex-col gap-3 px-3 py-3">
        {/* Header */}
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

        {/* Groups List */}
        <div className="flex-1 space-y-1 overflow-y-auto pr-1">
          {loading ? (
            <div className="flex flex-1 items-center justify-center py-8">
              <Spinner />
              <div className="pl-2 text-md text-muted-foreground">Loading...</div>
            </div>
          ) : groups.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <span className="text-sm text-muted-foreground">No groups found.</span>
            </div>
          ) : (
            groups.map((group) => (
              <div
                key={group.id}
                role="button"
                tabIndex={0}
                className={cn(
                  "group flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-left text-md transition",
                  group.id === active
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted/70"
                )}
                onClick={() => handleSelectGroup(group.id)}
              >
                {/* Icon */}
                <div className="flex items-center justify-center pt-1">
                  <Boxes className="h-3.5 w-3.5 opacity-80" />
                </div>

                {/* Name & Date */}
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="text-md leading-tight line-clamp-1">
                    {group.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    Created {formatDate(group.createdAt)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </SidebarContent>
  );
}