"use client"

import { Button } from "@/components/ui/button"
import { CornerUpLeft, CornerUpRight } from "lucide-react"

export function TouringHeaderActions() {
    return (
        <div className="flex items-center gap-4">
            {/* Left: Cancel (red) */}
            <Button
                variant="destructive"
                className="flex items-center gap-2"
            >
                <CornerUpLeft className="w-4 h-4" />
                <span>Cancel this tour</span>
            </Button>

            {/* Right: Approve (green) */}
            <Button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white">
                <span>Approve</span>
                <CornerUpRight className="w-4 h-4" />
            </Button>
        </div>
    )
}
