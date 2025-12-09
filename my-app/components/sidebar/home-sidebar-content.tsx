"use client"

import { SidebarContent } from "../ui/sidebar"
import { Button } from "../ui/button"
import { MoreHorizontal, MessageSquare, Clock, Bot, MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"

// TEMP: mock history data (replace with real data later)
const mockHistory = [
	{
		id: "1",
		title: "Birthday bar-hopping in downtown Toronto",
		subtitle: "3 stops · updated 2h ago",
		createdAt: "2 hours ago",
		isActive: true,
	},
	{
		id: "2",
		title: "Cozy cafe date + walk",
		subtitle: "Queen St W · updated yesterday",
		createdAt: "1 day ago",
		isActive: false,
	},
	{
		id: "3",
		title: "Friend group night out",
		subtitle: "Kensington · 5 stops",
		createdAt: "3 days ago",
		isActive: false,
	},
	{
		id: "4",
		title: "Solo ramen + arcade run",
		subtitle: "Spadina · 2 stops",
		createdAt: "1 week ago",
		isActive: false,
	},
]

export function HomeSidebarContent() {
	return (
		<SidebarContent className="scrollbar-hide px-0">
			<div className="flex h-full flex-col gap-3 px-3 py-3">

				{/* Header */}
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2 text-md">
						<MessageCircle className="h-4 w-4" />
						<span>Chats</span>
					</div>

					<Button
						size="sm"
						className="h-7 px-2 text-xs"
						variant="outline"
						onClick={() => console.log("New plan")}
					>
						+ New plan
					</Button>
				</div>

				{/* History List */}
				<div className="flex-1 space-y-1 overflow-y-auto pr-1">
					{mockHistory.map((item) => (
						<div
							key={item.id}
							role="button"
							tabIndex={0}
							className={cn(
								"group flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-left text-md transition",
								item.isActive
									? "bg-primary/10 text-primary"
									: "hover:bg-muted/70"
							)}
							onClick={() => console.log("Open plan", item.id)}
							onKeyDown={(e) => {
								if (e.key === "Enter") console.log("Open plan", item.id)
							}}
						>
							{/* Left icon */}
							<div className="flex items-center justify-center pt-1">
								<Bot className="h-3.5 w-3.5 opacity-80" />
							</div>

							{/* Title + subtitle */}
							<div className="flex min-w-0 flex-1 flex-col">
								{/* Title: wrap to max 2 lines */}
								<span className="text-md font-light leading-tight line-clamp-2 break-words">
									{item.title}
								</span>

								{/* Subtitle: single-line, but safe inside width */}
								<span className="flex items-center gap-1 text-[10px] text-muted-foreground">
									<span className="truncate max-w-full">{item.subtitle}</span>
								</span>
							</div>

							{/* Ellipsis actions */}
							<Button
								type="button"
								variant="ghost"
								size="icon"
								className="ml-auto h-6 w-6 p-0 opacity-0 hover:opacity-100"
								onClick={(e) => {
									e.stopPropagation()
									console.log("More actions for", item.id)
								}}
							>
								<MoreHorizontal className="h-3.5 w-3.5" />
							</Button>
						</div>
					))}
				</div>
			</div>
		</SidebarContent>
	)
}
