"use client"

import React from "react"
import { usePathname } from "next/navigation"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { InputWithButton } from "@/components/input-with-button"
import { TouringHeaderActions } from "@/components/touring-header-actions"
import { ChatSurveyHeader } from "@/components/chat-survey-header"

export function ShellHeader() {
    const pathname = usePathname()
    const isTouring = pathname.startsWith("/touring")
    const isChat = pathname.startsWith("/chat")

    return (
        <header className="flex h-16 shrink-0 items-center gap-2">
            <div className="flex flex-1 items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator
                    orientation="vertical"
                    className="mr-2 data-[orientation=vertical]:h-4"
                />

                {/* Route-specific header content */}
                {isTouring ? (
                    <TouringHeaderActions />
                ) : isChat ? (
                    <ChatSurveyHeader />
                ) : (
                    <InputWithButton />
                )}
            </div>
        </header>
    )
}
