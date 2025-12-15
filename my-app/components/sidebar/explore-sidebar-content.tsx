"use client"

import React from "react"
import { Globe } from "lucide-react"
import { SidebarGroupContent } from "@/components/ui/sidebar"

export function ExploreSidebarContent() {
    return (
        <SidebarGroupContent className="px-0">
            <div className="flex flex-col gap-4 px-4 py-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Globe className="h-5 w-5" />
                    <span className="text-sm font-medium">Community Itineraries</span>
                </div>
                <p className="text-xs text-muted-foreground">
                    Browse itineraries shared by other users. Discover new places and get inspired for your next adventure!
                </p>
            </div>
        </SidebarGroupContent>
    )
}

