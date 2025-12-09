"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Heart, Waypoints, MapPinCheckInside } from "lucide-react"
import { cn } from "@/lib/utils"

const items = [
    {
        href: "/my-space/favorites",
        icon: Heart,
        label: "Favorites",
        description: "Your favorite places you visited.",
    },
    {
        href: "/my-space/published",
        icon: Waypoints,
        label: "Published",
        description: "Places you published for others to see.",
    },
    {
        href: "/my-space/visited",
        icon: MapPinCheckInside,
        label: "Visited",
        description: "Places you visited so far.",
    },
]

export function MySpaceSidebarContent() {
    const pathname = usePathname()

    return (
        <div className="flex flex-col gap-3 p-4 text-sm">
            {items.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex flex-col gap-1 rounded-md px-2 py-2 text-xs transition",
                            "hover:bg-muted/80",
                            isActive && "bg-primary/10 text-primary"
                        )}
                    >
                        <div className="flex items-center gap-2 font-semibold">
                            <Icon className="h-4 w-4" />
                            <span>{item.label}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                            {item.description}
                        </p>
                    </Link>
                )
            })}
        </div>
    )
}
