"use client";

import * as React from "react";
import {
  BotMessageSquare,
  Brain,
  Compass,
  Globe,
  Home,
  Moon,
  Palette,
  Sun,
  UsersRound,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarUserAccordion } from "@/components/user-accordion";
import { NavUser } from "./nav-user";
import { ExploreSidebarContent } from "./sidebar/explore-sidebar-content";
import { ChatSidebarContent } from "./sidebar/chat-sidebar-content";
import { MySpaceSidebarContent } from "@/components/sidebar/my-space-sidebar-content";
import { HomeSidebarContent } from "./sidebar/home-sidebar-content";
import { useItinerary } from "@/hooks/context/itinerary-context";
import { GroupsSidebarContent } from "./sidebar/groups-sidebar-content";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useThemePalette, type ThemePalette } from "@/components/theme-provider";

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
      title: "Home",
      url: "/",
      icon: Home,
    },
    {
      title: "My Space",
      url: "/my-space",
      icon: Brain,
    },
    {
      title: "Chat",
      url: "/chat",
      icon: BotMessageSquare,
    },
    {
      title: "Groups",
      url: "/groups",
      icon: UsersRound,
    },
    {
      title: "Explore",
      url: "/explore",
      icon: Globe,
    },
  ],
};

const themePaletteOptions: { label: string; value: ThemePalette }[] = [
  { label: "Default", value: "default" },
  { label: "Caffeine", value: "caffeine" },
  { label: "Amethyst Haze", value: "amethyst" },
  { label: "Cyberpunk", value: "cyberpunk" },
  { label: "Nature", value: "nature" },
  { label: "Quantum Rose", value: "quantum-rose" },
];

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { setOpen } = useSidebar();
  const { setTheme, resolvedTheme } = useTheme();
  const pathname = usePathname();

  // Access context to update map theme
  const { setAppTheme } = useItinerary();
  const { palette, setPalette } = useThemePalette();

  React.useEffect(() => {
    if (!resolvedTheme) return;
    setAppTheme(resolvedTheme as "light" | "dark");
  }, [resolvedTheme, setAppTheme]);

  // Active item is derived from current route
  const activeItem = React.useMemo(() => {
    return (
      data.navMain.find((item) => {
        if (item.url === "#") return false;
        if (item.url === "/") return pathname === "/";
        return pathname.startsWith(item.url);
      }) ?? data.navMain[0]
    );
  }, [pathname]);

  const sidebarContentMap: Record<string, React.ReactNode> = {
    Home: <HomeSidebarContent />,
    Chat: <ChatSidebarContent />,
    "My Space": <MySpaceSidebarContent />,
    Groups: <GroupsSidebarContent />,
    Explore: <ExploreSidebarContent />,
  };

  const currentSidebarContent = sidebarContentMap[activeItem?.title] || (
    <SidebarUserAccordion />
  );

  const handlePaletteChange = (nextPalette: ThemePalette) => {
    setPalette(nextPalette);
  };

  return (
    <Sidebar
      collapsible="icon"
      className="h-[calc(100svh-(--spacing(6)))] overflow-hidden *:data-[sidebar=sidebar]:flex-row rounded-xl border border-border bg-card/50 mt-3 mb-3 ml-2"
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
                <Link href="/">
                  <div title="The Odyssey Yelp" className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                    <Compass className="size-5" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">The Odyssey Yelp</span>
                    <span className="truncate text-xs">Your Travel Companion</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent className="px-1.5 md:px-0">
              <SidebarMenu>
                {data.navMain.map((item) => {
                  const Icon = item.icon;

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        tooltip={{
                          children: item.title,
                          hidden: false,
                        }}
                        onClick={() => {
                          if (item.url === "#") return;
                          setOpen(true);
                        }}
                        isActive={activeItem?.title === item.title}
                        className="px-2.5 md:px-2"
                        asChild
                      >
                        <Link href={item.url}>
                          <Icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}

                {/* Theme toggle button */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    tooltip={{
                      children: resolvedTheme === "dark" ? "Light Mode" : "Dark Mode",
                      hidden: false,
                    }}
                    onClick={() => {
                      const newTheme =
                        resolvedTheme === "dark" ? "light" : "dark";
                      setTheme(newTheme);
                      setAppTheme(newTheme);
                    }}
                    className="px-2.5 md:px-2"
                  >
                    <Sun className="hidden dark:block" />
                    <Moon className="dark:hidden" />
                    <span>{resolvedTheme === "dark" ? "Light Mode" : "Dark Mode"}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* Palette picker button */}
                <SidebarMenuItem>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuButton
                        tooltip={{
                          children: "Theme Palette",
                          hidden: false,
                        }}
                        className="px-2.5 md:px-2"
                      >
                        <Palette />
                        <span>Theme Palette</span>
                      </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center" className="w-44">
                      {themePaletteOptions.map((option) => (
                        <DropdownMenuItem
                          key={option.value}
                          onClick={() => handlePaletteChange(option.value)}
                          className="flex items-center justify-between"
                        >
                          <span>{option.label}</span>
                          {palette === option.value && (
                            <span className="text-xs text-muted-foreground">Active</span>
                          )}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <NavUser />
        </SidebarFooter>
      </Sidebar>

      {/* Right sidebar – your "inside navbar" area (hidden on home page) */}
      {pathname !== "/" && (
        <Sidebar collapsible="none" className="hidden flex-1 md:flex">
          <SidebarHeader className="gap-3 border-b p-3">
            {activeItem?.title}
          </SidebarHeader>

          <SidebarContent className="scrollbar-hide px-0">
            <SidebarGroup className="px-0">
              {currentSidebarContent}
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
      )}
    </Sidebar>
  );
}
