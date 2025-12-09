"use client"

import React from "react"
import { usePathname } from "next/navigation"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { InputWithButton } from "@/components/input-with-button"
import { TouringHeaderActions } from "@/components/touring-header-actions"

export function ShellHeader() {
    const pathname = usePathname()
    const isTouring = pathname.startsWith("/touring")

    return (
        <header className="flex h-16 shrink-0 items-center gap-2">
            <div className="flex flex-1 items-center gap-2 px-4">
                {isTouring ? <TouringHeaderActions /> : <InputWithButton />}
            </div>
        </header>
    )
}
