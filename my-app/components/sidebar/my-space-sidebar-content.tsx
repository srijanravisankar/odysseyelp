"use client"

import React from "react"
import { Heart, Waypoints, MapPinCheckInside } from "lucide-react"

export function MySpaceSidebarContent() {
    return (
        <div className="flex flex-col gap-6 p-4 text-sm">
            {/* Favorites */}
            <div>
                <div className="flex items-center gap-2 font-semibold">
                    <Heart className="w-4 h-4" />
                    Favorites
                </div>
                <p className="text-muted-foreground text-xs">
                    Your saved places.
                </p>
            </div>

            {/* Shared */}
            <div>
                <div className="flex items-center gap-2 font-semibold">
                    <Waypoints className="w-4 h-4" />
                    Shared
                </div>
                <p className="text-muted-foreground text-xs">
                    Places others shared with you.
                </p>
            </div>

            {/* Visited */}
            <div>
                <div className="flex items-center gap-2 font-semibold">
                    <MapPinCheckInside className="w-4 h-4" />
                    Visited
                </div>
                <p className="text-muted-foreground text-xs">
                    Your visited history.
                </p>
            </div>
        </div>
    )
}
