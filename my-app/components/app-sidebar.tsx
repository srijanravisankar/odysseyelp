"use client"

import * as React from "react"
import {
	Binoculars,
	Command,
	Globe,
	Heart,
	MapPinCheckInside,
	Moon,
	Sun,
	Waypoints,
} from "lucide-react"

import { Label } from "@/components/ui/label"
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarHeader,
	SidebarInput,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar"
import { Switch } from "@/components/ui/switch"
import { useTheme } from "next-themes"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { SidebarUserAccordion } from "@/components/user-accordion"
import { NavUser } from "./nav-user"

// ----------------------
// Sample data
// ----------------------
const data = {
	user: {
		name: "shadcn",
		email: "m@example.com",
		avatar: "/avatars/shadcn.jpg",
	},
	navMain: [
		{
			title: "Touring",
			url: "/touring",
			icon: Binoculars,
		},
		{
			title: "Favorites",
			url: "/favorites",
			icon: Heart,
		},
		{
			title: "Shared",
			url: "/shared",
			icon: Waypoints,
		},
		{
			title: "Visited",
			url: "/visited",
			icon: MapPinCheckInside,
		},
		{
			title: "Explore",
			url: "/explore",
			icon: Globe,
		},
		{
			title: "Theme",
			url: "#", // special: toggles theme instead of navigating
			icon: Moon,
		},
	],
}
//
// // ----------------------
// // Your user accordion
// // ----------------------
// function SidebarUserAccordion() {
//     return (
//         <Accordion type="single" collapsible className="w-full">
//             <AccordionItem value="user-info">
//                 <AccordionTrigger>Account &amp; context</AccordionTrigger>
//                 <AccordionContent>
//                     <div className="space-y-1 text-xs text-muted-foreground">
//                         <div>
//                             <span className="font-medium text-foreground">shadcn</span>
//                             <div>m@example.com</div>
//                         </div>
//                         <div className="pt-2 border-t">
//                             <div>Last updated: just now</div>
//                             <div>More account stuff can go here.</div>
//                         </div>
//                     </div>
//                 </AccordionContent>
//             </AccordionItem>
//
//             <AccordionItem value="help">
//                 <AccordionTrigger>Help &amp; tips</AccordionTrigger>
//                 <AccordionContent>
//                     <div className="text-xs text-muted-foreground space-y-1">
//                         <p>• Use the left icons to switch pages.</p>
//                         <p>• Use the theme item to toggle dark/light mode.</p>
//                     </div>
//                 </AccordionContent>
//             </AccordionItem>
//         </Accordion>
//     )
// }

// ----------------------
// Sidebar component
// ----------------------
export function AppSidebar(
	props: React.ComponentProps<typeof Sidebar>
) {
	const { setOpen } = useSidebar()
	const { theme, setTheme, resolvedTheme } = useTheme()
	const pathname = usePathname()

	const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

	// Active item is derived from current route
	const activeItem = React.useMemo(() => {
		return (
			data.navMain.find(
				(item) =>
					item.title !== "Theme" &&
					item.url !== "#" &&
					pathname.startsWith(item.url)
			) ?? data.navMain[0]
		)
	}, [pathname])

	return (
		<Sidebar
			collapsible="icon"
			className="h-[calc(100svh-theme(spacing.6))] overflow-hidden *:data-[sidebar=sidebar]:flex-row rounded-xl border border-border bg-card/50 mt-3 mb-3 ml-2"
			{...props}
		>
			{/* Left mini sidebar (icons only) */}
			<Sidebar
				collapsible="none"
				className="w-[calc(var(--sidebar-width-icon))]! border-r"
			>
				<SidebarHeader>
					<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuButton size="lg" asChild className="md:h-8 md:p-0">
								<a href="/">
									<div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
										<Command className="size-4" />
									</div>
									<div className="grid flex-1 text-left text-sm leading-tight">
										<span className="truncate font-medium">Acme Inc</span>
										<span className="truncate text-xs">Enterprise</span>
									</div>
								</a>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarHeader>

				<SidebarContent>
					<SidebarGroup>
						<SidebarGroupContent className="px-1.5 md:px-0">
							<SidebarMenu>
								{data.navMain.map((item) => {
									const isThemeItem = item.title === "Theme"
									const Icon = item.icon // 🔒 no theme-based switching here

									return (
										<SidebarMenuItem key={item.title}>
											<SidebarMenuButton
												tooltip={{
													children: isThemeItem && mounted ? (resolvedTheme === "dark" ? "Dark Mode" : "Light Mode"): item.title,
													hidden: false,
												}}
												onClick={() => {
													if (isThemeItem) {
														// safe to use theme here (client-only)
														setTheme(resolvedTheme === "dark" ? "light" : "dark")
														return
													}
													setOpen(true)
												}}
												isActive={activeItem?.title === item.title}
												className="px-2.5 md:px-2"
												asChild={!isThemeItem} // use <Link> as child for non-theme
											>
												{isThemeItem ? (
													<>
														<Sun className="hidden dark:block cursor-pointer" />
														<Moon className="dark:hidden cursor-pointer" />
														<span>
															{/* Shows "Theme" while loading, then the actual mode. Prevents "Light Mode" flash. */}
															{mounted ? (resolvedTheme === "dark" ? "Dark Mode" : "Light Mode") : "Theme"}
														</span>
													</>
												) : (
													<Link href={item.url}>
														<Icon />
														<span>{item.title}</span>
													</Link>
												)}
											</SidebarMenuButton>
										</SidebarMenuItem>
									)
								})}
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				</SidebarContent>

				<SidebarFooter>
          <NavUser user={data.user} />
        </SidebarFooter>
			</Sidebar>

			{/* Right sidebar – your "inside navbar" area */}
			<Sidebar collapsible="none" className="hidden flex-1 md:flex">
				<SidebarHeader className="gap-3.5 border-b p-4">
					<div className="flex w-full items-center justify-between">
						<div className="text-foreground text-base font-medium">
							{activeItem?.title}
						</div>
						<Label className="flex items-center gap-2 text-sm">
							<span>Unreads</span>
							<Switch className="shadow-none" />
						</Label>
					</div>

					<div className="text-xs text-muted-foreground">
						Currently in {activeItem?.title} page
					</div>

					<SidebarInput placeholder="Type to search..." />
				</SidebarHeader>

				<SidebarContent className="scrollbar-hide px-0">
					<SidebarGroup className="px-0">
						<SidebarGroupContent className="px-4 py-2">
							{/* This is where accordion shows up */}
							<SidebarUserAccordion />
						</SidebarGroupContent>
					</SidebarGroup>
				</SidebarContent>
			</Sidebar>
		</Sidebar>
	)
}
