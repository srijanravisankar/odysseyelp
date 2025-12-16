// "use client";

// import { SidebarContent } from "../ui/sidebar";
// import { Button } from "../ui/button";
// import { Boxes, Merge, Plus } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { useState, useEffect, useCallback } from "react";
// import { toast } from "sonner";
// import { useUser } from "@/hooks/context/user-context";
// import { useChat } from "@/hooks/context/session-context";
// import { Spinner } from "../ui/spinner";
// import { useSupabase } from "@/hooks/context/supabase-context";
// import { GroupChatSheet } from "../group-chat-sheet";

// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog"
// import { Label } from "@radix-ui/react-label";
// import { Input } from "../ui/input";
// import { DialogClose } from "@radix-ui/react-dialog";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// import { useGroup } from "@/hooks/context/group-context";

// interface Group {
//   id: number;
//   name: string;
//   createdAt: string;
//   secretCode: string;
// }

// export function GroupsSidebarContent() {
//   const supabase = useSupabase();
//   const { user } = useUser();
//   const { setActive } = useChat();
  
//   // State for "My Groups"
//   const [groups, setGroups] = useState<Group[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [isCreatingGroup, setIsCreatingGroup] = useState(false);

//   // State for "All Groups" (Join Dialog)
//   const [allGroups, setAllGroups] = useState<Group[]>([]);
//   const [loadingAllGroups, setLoadingAllGroups] = useState(false);

//   // Sheet State
//   const [isSheetOpen, setIsSheetOpen] = useState(false);
//   const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

//   const { 
//     activeGroup, 
//     setActiveGroup, 
//     isGroupSheetOpen, 
//     setIsGroupSheetOpen 
//   } = useGroup();
  
//   // Dialog & Form State
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [selectedJoinGroupId, setSelectedJoinGroupId] = useState("");
//   const [secretCodeInput, setSecretCodeInput] = useState(""); // ✅ Added State
//   const [isJoining, setIsJoining] = useState(false); // ✅ Added Loading State

//   // 1. Fetch "My Groups"
//   const fetchGroups = useCallback(async () => {
//     if (!user?.email) return;

//     try {
//       setLoading(true);
//       const { data: authData } = await supabase.auth.getUser();
//       if (!authData.user) return;

//       const { data, error } = await supabase
//         .rpc("get_user_groups", {
//           current_user_id: authData.user.id,
//         })
//         .order("created_at", { ascending: false });

//       if (error) throw error;

//       const transformedGroups = (data || []).map((group: any) => ({
//         id: group.id,
//         name: group.name || "Untitled Group",
//         createdAt: group.created_at,
//         secretCode: group.secret_code,
//       }));
//       setGroups(transformedGroups);
//     } catch (error) {
//       console.error("Error fetching groups:", error);
//       toast.error("Failed to load groups");
//     } finally {
//       setLoading(false);
//     }
//   }, [user, supabase]);
  
//   useEffect(() => {
//     fetchGroups();
//   }, [fetchGroups]);

//   // 2. Fetch "All Groups" for Join List
//   const fetchAllGroups = useCallback(async () => {
//     try {
//       setLoadingAllGroups(true);
//       const { data, error } = await supabase
//         .from("groups")
//         .select("id, name, created_at")
//         .order("name", { ascending: true });

//       if (error) throw error;

//       const transformed = (data || []).map((g: any) => ({
//         id: g.id,
//         name: g.name,
//         createdAt: g.created_at,
//         secretCode: g.secret_code,
//       }));
//       setAllGroups(transformed);
//     } catch (error) {
//       console.error("Error fetching all groups", error);
//     } finally {
//       setLoadingAllGroups(false);
//     }
//   }, [supabase]);

//   useEffect(() => {
//     if (isDialogOpen) {
//       fetchAllGroups();
//       setSecretCodeInput(""); // Reset input when dialog opens
//       setSelectedJoinGroupId("");
//     }
//   }, [isDialogOpen, fetchAllGroups]);


//   // 3. ✅ Handler: Join Group Logic
//   const handleJoinGroup = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!selectedJoinGroupId || !secretCodeInput) {
//       toast.error("Please select a group and enter the code");
//       return;
//     }
//     if (!user) return;

//     setIsJoining(true);

//     try {
//       const { data: authData } = await supabase.auth.getUser();
//       if (!authData.user) return;

//       // Call our secure RPC function
//       const { error } = await supabase.rpc("join_group_with_code", {
//         group_id_input: Number(selectedJoinGroupId),
//         user_id_input: authData.user.id,
//         secret_code_input: secretCodeInput.trim(), // Ensure UUID format is clean
//       });

//       if (error) throw error;

//       toast.success("Successfully joined the group!");
//       setIsDialogOpen(false);
//       fetchGroups(); // Refresh sidebar list immediately
      
//     } catch (error: any) {
//       console.error("Join Error:", error);
//       // RPC errors usually come in error.message
//       toast.error(error.message || "Failed to join group. Check the code.");
//     } finally {
//       setIsJoining(false);
//     }
//   };

//   // ... (handleNewGroup and handleSelectGroup logic remains the same) ...
//   const handleNewGroup = async () => {
//     if (!user?.email) return;
//     setIsCreatingGroup(true);
//     try {
//       const { data: authData } = await supabase.auth.getUser();
//       if (!authData.user) return;
      
//       const defaultName = `New Group ${groups.length + 1}`;
//       const { data, error } = await supabase
//         .from("groups")
//         .insert({ created_by: authData.user.id, name: defaultName })
//         .select().single();

//       if (error) throw error;
//       if (data) {
//         const newGroup = { id: data.id, name: data.name, createdAt: data.created_at, secretCode: data.secret_code };
//         setGroups((prev) => [newGroup, ...prev]);
//         setSelectedGroup(newGroup);
//         setActiveGroup(newGroup);
//         setIsSheetOpen(true);
//         toast.success("Group created");
//       }
//     } catch (error: any) {
//       toast.error("Failed to create group");
//     } finally {
//       setIsCreatingGroup(false);
//     }
//   };

//   const handleSelectGroup = (group: Group) => {
//     setActive(group.id);
//     setSelectedGroup(group);
//     setIsSheetOpen(true);

//     setActiveGroup(group);     
//     setIsGroupSheetOpen(true);
//   };

//   const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();

//   return (
//     <>
//       <SidebarContent className="scrollbar-hide px-0">
//         <div className="flex h-full flex-col gap-3 px-3 py-3">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-2 text-md">
//               <Boxes className="h-4 w-4" />
//               <span>My Groups</span>
//             </div>

//             <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//               <DialogTrigger asChild>
//                 <Button
//                   size="sm"
//                   variant="outline"
//                   className="ml-8 h-7 gap-2 text-xs cursor-pointer"
//                 >
//                   <Merge className="h-3.5 w-3.5" />
//                   Join
//                 </Button>
//               </DialogTrigger>

//               <DialogContent className="sm:max-w-[425px]">
//                 <DialogHeader>
//                   <DialogTitle>Join a Group</DialogTitle>
//                   <DialogDescription>
//                     Select an existing group and enter its secret code to join.
//                   </DialogDescription>
//                 </DialogHeader>

//                 <form onSubmit={handleJoinGroup} className="grid gap-4 py-4">
//                   <div className="grid gap-2 w-full">
//                     <Label htmlFor="group-select">Group Name</Label>                
//                     <Select 
//                       value={selectedJoinGroupId} 
//                       onValueChange={setSelectedJoinGroupId}
//                     >
//                       <SelectTrigger id="group-select" className="cursor-pointer">
//                         <SelectValue placeholder={loadingAllGroups ? "Loading groups..." : "Select a group..."} />
//                       </SelectTrigger>
//                       <SelectContent className="max-h-[200px]"> 
//                         {allGroups.map((group) => (
//                           <SelectItem key={group.id} value={String(group.id)} className="cursor-pointer">
//                             {group.name}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </div>

//                   <div className="grid gap-2">
//                     <Label htmlFor="group-code">Secret Code</Label>
//                     <Input 
//                       id="group-code" 
//                       value={secretCodeInput}
//                       onChange={(e) => setSecretCodeInput(e.target.value)}
//                       placeholder="e.g. 9bbb5ebf-d92a-4a77..." 
//                       className="col-span-3" 
//                     />
//                   </div>

//                   <DialogFooter>
//                     <DialogClose asChild className="cursor-pointer">
//                       <Button variant="outline" type="button">Cancel</Button>
//                     </DialogClose>
//                     <Button type="submit" disabled={isJoining} className="cursor-pointer">
//                       {isJoining ? "Joining..." : "Join Group"}
//                     </Button>
//                   </DialogFooter>
//                 </form>
//               </DialogContent>
//             </Dialog>
            
//             <Button
//               size="sm"
//               className="h-7 text-xs cursor-pointer"
//               variant="outline"
//               onClick={handleNewGroup}
//               disabled={isCreatingGroup}
//             >
//               <Plus className="h-4 w-4" />
//               {isCreatingGroup ? "..." : "New"}
//             </Button>
//           </div>

//           <div className="flex-1 space-y-1 overflow-y-auto pr-1">
//             {loading ? (
//               <div className="flex justify-center py-8"><Spinner /></div>
//             ) : groups.length === 0 ? (
//               <div className="text-center py-8 text-sm text-muted-foreground">No groups yet.</div>
//             ) : (
//               groups.map((group) => (
//                 <div
//                   key={group.id}
//                   onClick={() => handleSelectGroup(group)}
//                   className={cn(
//                     "flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-left text-md transition",
//                     activeGroup?.id === group.id
//                       ? "bg-primary/10 text-primary"
//                       : "hover:bg-muted/70"
//                   )}
//                 >
//                   <div className="flex items-center justify-center pt-1">
//                     <Boxes className="h-3.5 w-3.5 opacity-80" />
//                   </div>
//                   <div className="flex min-w-0 flex-1 flex-col">
//                     <span className="leading-tight line-clamp-2 wrap-break-word">{group.name}</span>
//                     <span className="text-[10px] text-muted-foreground">
//                       {formatDate(group.createdAt)}
//                     </span>
//                   </div>
//                 </div>
//               ))
//             )}
//           </div>
//         </div>
//       </SidebarContent>

//       <GroupChatSheet
//         group={selectedGroup} 
//         open={isSheetOpen} 
//         onOpenChange={setIsSheetOpen} 
//       />
//     </>
//   );
// }

"use client";

import { SidebarContent } from "../ui/sidebar";
import { Button } from "../ui/button";
import { Boxes, Merge, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useUser } from "@/hooks/context/user-context";
import { useChat } from "@/hooks/context/session-context";
import { Spinner } from "../ui/spinner";
import { useSupabase } from "@/hooks/context/supabase-context";
import { GroupChatSheet } from "../group-chat-sheet";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@radix-ui/react-label";
import { Input } from "../ui/input";
import { DialogClose } from "@radix-ui/react-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { useGroup } from "@/hooks/context/group-context";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Group {
  id: number;
  name: string;
  createdAt: string;
  secretCode: string;
}

export function GroupsSidebarContent() {
  const supabase = useSupabase();
  const { user } = useUser();
  const { setActive } = useChat();
  
  // State for "My Groups"
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  
  // ✅ 1. Replaced isCreatingGroup with Dialog State
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);

  // State for "All Groups" (Join Dialog)
  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const [loadingAllGroups, setLoadingAllGroups] = useState(false);

  // Sheet State
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  const { 
    activeGroup, 
    setActiveGroup, 
    isGroupSheetOpen, 
    setIsGroupSheetOpen 
  } = useGroup();
  
  // Join Dialog State
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [selectedJoinGroupId, setSelectedJoinGroupId] = useState("");
  const [secretCodeInput, setSecretCodeInput] = useState(""); // ✅ Added State
  const [isJoining, setIsJoining] = useState(false); // ✅ Added Loading State
  const [groupToDelete, setGroupToDelete] = useState<Group | null>(null);
  const [isDeletingGroup, setIsDeletingGroup] = useState(false);

  // 1. Fetch "My Groups"
  const fetchGroups = useCallback(async () => {
    if (!user?.email) return;

    try {
      setLoading(true);
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) return;

      const { data, error } = await supabase
        .rpc("get_user_groups", {
          current_user_id: authData.user.id,
        })
        .order("created_at", { ascending: false });

      if (error) throw error;

      const transformedGroups = (data || []).map((group: any) => ({
        id: group.id,
        name: group.name || "Untitled Group",
        createdAt: group.created_at,
        secretCode: group.secret_code,
      }));
      setGroups(transformedGroups);
    } catch (error) {
      console.error("Error fetching groups:", error);
      toast.error("Failed to load groups");
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);
  
  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  // 2. Fetch "All Groups" for Join List
  const fetchAllGroups = useCallback(async () => {
    try {
      setLoadingAllGroups(true);
      const { data, error } = await supabase
        .from("groups")
        .select("id, name, created_at")
        .order("name", { ascending: true });

      if (error) throw error;

      const transformed = (data || []).map((g: any) => ({
        id: g.id,
        name: g.name,
        createdAt: g.created_at,
        secretCode: g.secret_code,
      }));
      setAllGroups(transformed);
    } catch (error) {
      console.error("Error fetching all groups", error);
    } finally {
      setLoadingAllGroups(false);
    }
  }, [supabase]);

  useEffect(() => {
    if (isJoinDialogOpen) {
      fetchAllGroups();
      setSecretCodeInput("");
      setSelectedJoinGroupId("");
    }
  }, [isJoinDialogOpen, fetchAllGroups]);

  // Join Logic
  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJoinGroupId || !secretCodeInput) {
      toast.error("Please select a group and enter the code");
      return;
    }
    if (!user) return;

    setIsJoining(true);

    try {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) return;

      const { error } = await supabase.rpc("join_group_with_code", {
        group_id_input: Number(selectedJoinGroupId),
        user_id_input: authData.user.id,
        secret_code_input: secretCodeInput.trim(),
      });

      if (error) throw error;

      toast.success("Successfully joined the group!");
      setIsJoinDialogOpen(false);
      fetchGroups();
      
    } catch (error: any) {
      console.error("Join Error:", error);
      toast.error(error.message || "Failed to join group.");
    } finally {
      setIsJoining(false);
    }
  };

  // ✅ 2. New Logic: Handle Create Group Submit
  // const handleCreateGroupSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!newGroupName.trim() || !user?.email) return;

  //   setIsSubmittingCreate(true);
  //   try {
  //     const { data: authData } = await supabase.auth.getUser();
  //     if (!authData.user) return;
      
  //     const { data, error } = await supabase
  //       .from("groups")
  //       .insert({ 
  //         created_by: authData.user.id, 
  //         name: newGroupName.trim() // Use the input name
  //       })
  //       .select().single();

  //     if (error) throw error;
  //     if (data) {
  //       const newGroup = { id: data.id, name: data.name, createdAt: data.created_at, secretCode: data.secret_code };
  //       setGroups((prev) => [newGroup, ...prev]);
  //       setSelectedGroup(newGroup);
  //       setActiveGroup(newGroup);
  //       setIsSheetOpen(true);
  //       toast.success("Group created successfully!");
  //       setIsCreateDialogOpen(false); // Close dialog
  //       setNewGroupName(""); // Reset input
  //     }
  //   } catch (error: any) {
  //     toast.error("Failed to create group");
  //   } finally {
  //     setIsSubmittingCreate(false);
  //   }
  // };

  // ✅ Handler: Create Group with Uniqueness Check
  const handleCreateGroupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nameToCheck = newGroupName.trim();
    
    if (!nameToCheck || !user?.email) return;

    setIsSubmittingCreate(true);
    try {
      // 1. Check if name already exists (Case-insensitive)
      const { data: existingGroup } = await supabase
        .from("groups")
        .select("id")
        .ilike("name", nameToCheck)
        .maybeSingle(); // Returns null if not found, object if found

      if (existingGroup) {
        toast.error("Group name already taken. Please choose another.");
        setIsSubmittingCreate(false);
        return; // 🛑 Stop execution here
      }

      // 2. Proceed to Create
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) return;
      
      const { data, error } = await supabase
        .from("groups")
        .insert({ 
          created_by: authData.user.id, 
          name: nameToCheck 
        })
        .select()
        .single();

      if (error) throw error;
      
      // 3. Update UI on Success
      if (data) {
        const newGroup = { id: data.id, name: data.name, createdAt: data.created_at, secretCode: data.secret_code };
        setGroups((prev) => [newGroup, ...prev]);
        setSelectedGroup(newGroup);
        setActiveGroup(newGroup);
        setIsSheetOpen(true);
        
        toast.success("Group created successfully!");
        setIsCreateDialogOpen(false); 
        setNewGroupName(""); 
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to create group");
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  const handleSelectGroup = (group: Group) => {
    setActive(group.id);
    setSelectedGroup(group);
    setIsSheetOpen(true);
    setActiveGroup(group);     
    setIsGroupSheetOpen(true);
  };

  const handleDeleteGroup = async () => {
    if (!groupToDelete) return;

    try {
      setIsDeletingGroup(true);
      const { error } = await supabase
        .from("groups")
        .delete()
        .eq("id", groupToDelete.id);

      if (error) throw error;

      setGroups((prev) => prev.filter((group) => group.id !== groupToDelete.id));
      if (activeGroup?.id === groupToDelete.id) {
        setActiveGroup(null);
        setIsGroupSheetOpen(false);
      }
      toast.success("Group deleted");
    } catch (error) {
      console.error("Error deleting group:", error);
      toast.error("Failed to delete group");
    } finally {
      setIsDeletingGroup(false);
      setGroupToDelete(null);
    }
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

            {/* JOIN GROUP DIALOG */}
            <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="ml-8 h-7 gap-2 text-xs cursor-pointer"
                >
                  <Merge className="h-3.5 w-3.5" />
                  Join
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Join a Group</DialogTitle>
                  <DialogDescription>
                    Select an existing group and enter its secret code to join.
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleJoinGroup} className="grid gap-4 py-4">
                  <div className="grid gap-2 w-full">
                    <Label htmlFor="group-select">Group Name</Label>                
                    <Select 
                      value={selectedJoinGroupId} 
                      onValueChange={setSelectedJoinGroupId}
                    >
                      <SelectTrigger id="group-select" className="cursor-pointer">
                        <SelectValue placeholder={loadingAllGroups ? "Loading groups..." : "Select a group..."} />
                      </SelectTrigger>
                      <SelectContent className="max-h-[200px]"> 
                        {allGroups.map((group) => (
                          <SelectItem key={group.id} value={String(group.id)} className="cursor-pointer">
                            {group.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="group-code">Secret Code</Label>
                    <Input 
                      id="group-code" 
                      value={secretCodeInput}
                      onChange={(e) => setSecretCodeInput(e.target.value)}
                      placeholder="e.g. 9bbb5ebf-d92a-4a77..." 
                      className="col-span-3" 
                    />
                  </div>

                  <DialogFooter>
                    <DialogClose asChild className="cursor-pointer">
                      <Button variant="outline" type="button">Cancel</Button>
                    </DialogClose>
                    <Button type="submit" disabled={isJoining} className="cursor-pointer">
                      {isJoining ? "Joining..." : "Join Group"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            
            {/* ✅ 3. NEW GROUP DIALOG */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  className="h-7 text-xs cursor-pointer"
                  variant="outline"
                >
                  <Plus className="h-4 w-4" />
                  New
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Group</DialogTitle>
                  <DialogDescription>
                    Create a unique name for your new trip group.
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleCreateGroupSubmit} className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="new-group-name">Group Name</Label>
                    <Input 
                      id="new-group-name" 
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      placeholder="e.g. Summer Road Trip 2025" 
                      className="col-span-3" 
                    />
                  </div>

                  <DialogFooter>
                    <DialogClose asChild className="cursor-pointer">
                      <Button variant="outline" type="button">Cancel</Button>
                    </DialogClose>
                    <Button 
                      type="submit" 
                      disabled={isSubmittingCreate || !newGroupName.trim()} 
                      className="cursor-pointer"
                    >
                      {isSubmittingCreate ? "Creating..." : "Create Group"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
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
                    activeGroup?.id === group.id
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted/70"
                  )}
                >
                  <div className="flex items-center justify-center pt-1">
                    <Boxes className="h-3.5 w-3.5 opacity-80" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="leading-tight line-clamp-2 wrap-break-word">{group.name}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {formatDate(group.createdAt)}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="ml-auto h-6 w-6 cursor-pointer p-0 opacity-70 hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      setGroupToDelete(group);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
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

      <AlertDialog open={!!groupToDelete} onOpenChange={(open) => {
        if (!open) setGroupToDelete(null);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete group?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The group “{groupToDelete?.name}” and related itineraries will be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingGroup}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteGroup}
              disabled={isDeletingGroup}
            >
              {isDeletingGroup ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

