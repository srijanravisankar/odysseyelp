"use client";

import React from "react";
import { usePathname } from "next/navigation";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { InputWithButton } from "@/components/input-with-button";
import { TouringHeaderActions } from "@/components/touring-header-actions";
import { ChatSurveyHeader } from "@/components/chat-survey-header";
import { ExploreHeaderActions } from "@/components/explore-header-actions";
import { Button } from "./ui/button";
import { Map } from "lucide-react";

import { useGroup } from "@/hooks/context/group-context";

export function ShellHeader() {
  const pathname = usePathname();
  const isTouring = pathname.startsWith("/touring");
  const isChat = pathname.startsWith("/chat");
  const isGroup = pathname.startsWith("/groups");
  const isExplore = pathname.startsWith("/explore");

  const { 
      activeGroup, 
      setActiveGroup, 
      isGroupSheetOpen, 
      setIsGroupSheetOpen 
    } = useGroup();

  return (
    <header className="flex h-16 shrink-0 items-center gap-2">
      <div className="flex flex-1 items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />

        {/* Route-specific header content */}
        {isChat ? (
          <ChatSurveyHeader />
        ) : isExplore ? (
          <ExploreHeaderActions />
        ) : isGroup ?(
          <div className="flex text-lg font-medium">
            <Button
              size="sm"
              variant="outline"
              disabled={!activeGroup}
              className="ml-auto h-7 gap-2 text-xs cursor-pointer"
            >
              <Map className="h-3.5 w-3.5" />
              {activeGroup ? <>
                <span className="-mr-1">Plan from</span>
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
