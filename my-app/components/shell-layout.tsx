"use client"

import React from "react"

import { AppSidebar } from "@/components/app-sidebar"
import {
    SidebarProvider,
    SidebarInset,
} from "@/components/ui/sidebar"
import { ShellHeader } from "@/components/shell-header"

export default function ShellLayout({
                                        children,
                                    }: {
    children: React.ReactNode
}) {
    return (
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "350px",
                } as React.CSSProperties
            }
        >
            <AppSidebar />

            <div className="flex flex-1 flex-col gap-0 p-3">
                <SidebarInset className="rounded-xl border border-border bg-card/50">
                    {/* Header */}
                    <ShellHeader />

                    {/* Content */}
                    <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
                        {children}
                    </div>
                </SidebarInset>
            </div>
        </SidebarProvider>
    )
}
