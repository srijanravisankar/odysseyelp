"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { InputWithButton } from "@/components/input-with-button";
import { ChatSurveyHeader } from "@/components/chat-survey-header";
import { ExploreHeaderActions } from "@/components/explore-header-actions";
import { ExploreProvider } from "@/hooks/context/explore-context";
import { Button } from "./ui/button";
import { Loader, Map } from "lucide-react";

import { useGroup } from "@/hooks/context/group-context";
import { useGroupWishes } from "@/hooks/use-group-wishes";
import { useUser } from "@/hooks/context/user-context";
import { toast } from "sonner";

export function ShellHeader() {
  const pathname = usePathname();
  const isChat = pathname.startsWith("/chat");
  const isGroup = pathname.startsWith("/groups");
  const isExplore = pathname.startsWith("/explore");

  const { 
      activeGroup, 
      setActiveGroup, 
      isGroupSheetOpen, 
      setIsGroupSheetOpen 
    } = useGroup();
  const { wishes } = useGroupWishes(activeGroup?.id ?? 0);
  const [isPlanning, setIsPlanning] = useState(false);
  const { user } = useUser();

  const handlePlanFromGroup = async () => {
    if (!activeGroup) return;
    if (wishes.length === 0) {
      toast.error("No wishes found. Chat in the group first!");
      return;
    }

    setIsPlanning(true);
    try {
      // Construct the prompt
      const wishListText = wishes
        .map((w) => `- ${w.message} (requested by ${w.sender_name})`)
        .join("\n");

      const fullPrompt = `Plan a trip for a group named "${activeGroup.name}" based on these requests:\n${wishListText}`;

      // Call your API
      const response = await fetch("/api/chat", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: fullPrompt,
          groupId: activeGroup.id,
          userId: user?.id,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate itinerary");

      const data = await response.json();
      
      toast.success("Itinerary generated successfully!");
      // The ItineraryContext (if properly set up) will auto-detect the new entry in DB
      
    } catch (error) {
      console.error(error);
      toast.error("Failed to plan trip. Please try again.");
    } finally {
      setIsPlanning(false);
    }
  };

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
          <ExploreProvider>
            <ExploreHeaderActions />
          </ExploreProvider>
        ) : isGroup ?(
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
        ) : (
          <InputWithButton />
        )}
      </div>
    </header>
  );
}
