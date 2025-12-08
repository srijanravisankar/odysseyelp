"use client"

import { ThemeProvider } from "next-themes"

import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
	SidebarProvider,
	SidebarInset,
	SidebarTrigger,
} from "@/components/ui/sidebar"
import { InputWithButton } from "@/components/input-with-button"

export default function ShellLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<ThemeProvider
			attribute="class"
			defaultTheme="system"
			enableSystem
			disableTransitionOnChange
		>
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
						<header className="flex h-16 shrink-0 items-center gap-2">
							<div className="flex flex-1 items-center gap-2 px-4">
								<SidebarTrigger className="-ml-1" />
								<Separator
									orientation="vertical"
									className="mr-2 data-[orientation=vertical]:h-4"
								/>
								<InputWithButton />
							</div>
						</header>

						{/* Content */}
						<div className="flex flex-1 flex-col gap-6 p-4 pt-0">
							{children}
						</div>
					</SidebarInset>
				</div>
			</SidebarProvider>
		</ThemeProvider>
	)
}
