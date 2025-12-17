"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { InputWithButton } from "@/components/input-with-button";
import { ChatSurveyHeader } from "@/components/chat-survey-header";
import { Button } from "./ui/button";
import { Loader, Map } from "lucide-react";

import { useGroup } from "@/hooks/context/group-context";
import { useGroupWishes } from "@/hooks/use-group-wishes";
import { useUser } from "@/hooks/context/user-context";
import { toast } from "sonner";
import { useItinerary } from "@/hooks/context/itinerary-context";
import { useSaveItinerary } from "@/hooks/use-save-itinerary";
import { createClient } from "@/lib/supabase/client";

export function ShellHeader() {
  const pathname = usePathname();
  const isChat = pathname.startsWith("/chat");
  const isGroup = pathname.startsWith("/groups");
  const isExplore = pathname.startsWith("/explore");
  const isMySpace = pathname.startsWith("/my-space");

  const { 
      activeGroup, 
      setActiveGroup, 
      isGroupSheetOpen, 
      setIsGroupSheetOpen 
    } = useGroup();
  const { wishes } = useGroupWishes(activeGroup?.id ?? 0);
  const [isPlanning, setIsPlanning] = useState(false);
  const { user } = useUser();
  const { itineraryData, setItineraryData, refetchItineraries } = useItinerary();
  const { save: saveItinerary } = useSaveItinerary();

  const supabase = createClient();

  const getUserLocation = (): Promise<{ lat: number; lng: number } | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.warn("Location access denied or failed:", error);
          resolve(null); // Fallback to null if denied
        }
      );
    });
  };

  const handlePlanFromGroup = async () => {
      if (!activeGroup) return;

      setIsPlanning(true);
  
      try {
        const userLocation = await getUserLocation();
        console.log("User Location:", userLocation);

        // 3. FETCH FRESH DATA (Fixes the race condition)
        // Instead of relying on the hook's state (which might lag), fetch the DB directly.
        const { data: latestWishes, error } = await supabase
          .from("group_wishes")
          .select(`
            message,
            users:user_id ( name ) 
          `)
          .eq("group_id", activeGroup.id)
          .order("created_at", { ascending: true });

        if (error || !latestWishes || latestWishes.length === 0) {
          toast.error("No wishes found. Chat in the group first!");
          setIsPlanning(false);
          return;
        }

        // ✅ 4. Use the fresh data to build the prompt
        const wishListText = latestWishes
          .map((w: any) => `- ${w.message} (requested by ${w.users?.name || "Unknown"})`)
          .join("\n");

        const fullPrompt = `Plan a trip for a group named "${activeGroup.name}" based on these requests:\n${wishListText}`;

        console.log("Sending Fresh Wishes:", fullPrompt);
  
        const res = await fetch("/api/chat", { 
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: fullPrompt,   
            userLocation: userLocation,   
          }),
        });
  
        const data = await res.json();
  
        if (!res.ok) {
          console.error("Error from API:", data);
          toast.error("Failed to plan trip. Try again.");
          return;
        }

        if (data.message && data.message === "RETURN") {
          console.log("Received RETURN message from API, not building itinerary.");
          toast.error("Invalid query. Failed to plan trip.");
          return
        }
  
        if (data.itinerary) {
          console.log("Setting global itinerary data...");
          setItineraryData(data.itinerary);
          
          try {
            const result = await saveItinerary(data.itinerary, `${activeGroup.name}'s query`, false);
            setActiveGroup(activeGroup);
            await refetchItineraries();
          } catch (dbErr) {
            console.error("Database save failed:", dbErr);
          } 
        }
      } catch (err) {
        console.error("Network error", err);
        toast.error("Network error. Please try again.");
      } finally {
        setIsPlanning(false);
      }
    }

  return (
    <header className="flex h-16 shrink-0 items-center gap-2">
      <div className="flex flex-1 items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1 cursor-pointer" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />

        {/* Route-specific header content */}
        {isChat ? (
          <ChatSurveyHeader />
        ) : isExplore ? (
          // No header actions for explore page - filters and sort are in the page
          <div />
        ) : isGroup ? (
          // <div className="flex text-lg font-medium">
          //   <Button
          //     size="sm"
          //     variant="outline"
          //     disabled={!activeGroup}
          //     className="ml-auto h-7 gap-2 text-xs cursor-pointer"
          //   >
          //     <Map className="h-3.5 w-3.5" />
          //     {activeGroup ? <>
          //       <span className="-mr-1">Plan from</span>
          //       <span className="font-bold">{activeGroup.name}</span>
          //     </> : "No Group Selected"}
          //   </Button>
          // </div>
          <div className="flex w-full justify-end text-lg font-medium">
             {/* ✅ 4. Updated Button with Handler and Loading State */}
            <Button
              size="sm"
              variant="outline"
              disabled={!activeGroup || isPlanning}
              onClick={handlePlanFromGroup}
              className="h-7 gap-2 text-xs cursor-pointer"
            >
              {isPlanning ? (
                <Loader className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Map className="h-3.5 w-3.5" />
              )}
              
              {activeGroup ? <>
                <span className="-mr-1">{isPlanning ? "Planning..." : "Plan from"}</span>
                <span className="font-bold">{activeGroup.name}</span>
              </> : "No Group Selected"}
            </Button>
          </div>
        ) : isMySpace ? (
          // No search bar for my-space pages
          <div />
        ) : (
          <InputWithButton />
        )}
      </div>
    </header>
  );
}
