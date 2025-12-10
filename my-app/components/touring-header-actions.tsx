"use client"

import { Button } from "@/components/ui/button"
import {CircleCheckBig, CornerUpLeft, CornerUpRight, X} from "lucide-react"

export function TouringHeaderActions() {
    return (
        <div className="flex items-center gap-4">
          <Button variant="outline" className="cursor-pointer">
            <X className="text-red-600" />
            Cancel
          </Button>
        </div>
    )
}
