"use client";

import React from "react";
import { Search, Filter, TrendingUp, MapPin, Users, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { SidebarGroupContent } from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";

const trendingTags = [
  { tag: "TorontoFoodie", count: "2.4K" },
  { tag: "WeekendGetaway", count: "1.8K" },
  { tag: "DateNight", count: "1.5K" },
  { tag: "HiddenGems", count: "1.2K" },
  { tag: "NightLife", count: "987" },
  { tag: "CafeHopping", count: "856" },
  { tag: "FamilyFriendly", count: "743" },
  { tag: "BudgetTravel", count: "621" },
];

const suggestedUsers = [
  {
    id: "1",
    name: "Toronto Foodies",
    handle: "@torontofoodies",
    avatar: "🍜",
    followers: "12.4K",
    isVerified: true,
  },
  {
    id: "2",
    name: "Local Explorer",
    handle: "@localexplorer",
    avatar: "🗺️",
    followers: "8.2K",
    isVerified: true,
  },
  {
    id: "3",
    name: "DateNight TO",
    handle: "@datenightto",
    avatar: "💑",
    followers: "5.6K",
    isVerified: false,
  },
  {
    id: "4",
    name: "Adventure Seekers",
    handle: "@adventureseekers",
    avatar: "🏔️",
    followers: "3.9K",
    isVerified: true,
  },
];

type ExploreSidebarProps = {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedSort: string;
  onSortChange: (sort: string) => void;
  onTagClick: (tag: string) => void;
};

export function ExploreSidebarContent({
  searchQuery = "",
  onSearchChange = () => {},
  selectedCategory = "all",
  onCategoryChange = () => {},
  selectedSort = "trending",
  onSortChange = () => {},
  onTagClick = () => {},
}: Partial<ExploreSidebarProps>) {
  return (
    <SidebarGroupContent className="scrollbar-hide px-0">
      <ScrollArea className="h-[calc(100vh-120px)]">
        <div className="flex flex-col gap-5 px-4 py-3">
          {/* Search */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Search Itineraries
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search places, people, tags..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9 bg-muted/50"
              />
            </div>
          </div>

          <Separator />

          {/* Filters */}
          <div className="space-y-3">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Filter className="h-3 w-3" />
              Filters
            </label>

            <div className="space-y-2">
              <span className="text-xs text-muted-foreground">Category</span>
              <Select value={selectedCategory} onValueChange={onCategoryChange}>
                <SelectTrigger className="w-full bg-muted/50">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="food">Food & Dining</SelectItem>
                  <SelectItem value="nightlife">Nightlife</SelectItem>
                  <SelectItem value="outdoors">Outdoors & Nature</SelectItem>
                  <SelectItem value="culture">Arts & Culture</SelectItem>
                  <SelectItem value="shopping">Shopping</SelectItem>
                  <SelectItem value="family">Family Activities</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <span className="text-xs text-muted-foreground">Sort By</span>
              <Select value={selectedSort} onValueChange={onSortChange}>
                <SelectTrigger className="w-full bg-muted/50">
                  <SelectValue placeholder="Trending" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trending">
                    <span className="flex items-center gap-2">
                      <TrendingUp className="h-3 w-3" />
                      Trending
                    </span>
                  </SelectItem>
                  <SelectItem value="recent">
                    <span className="flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      Most Recent
                    </span>
                  </SelectItem>
                  <SelectItem value="popular">
                    <span className="flex items-center gap-2">
                      <Users className="h-3 w-3" />
                      Most Popular
                    </span>
                  </SelectItem>
                  <SelectItem value="nearby">
                    <span className="flex items-center gap-2">
                      <MapPin className="h-3 w-3" />
                      Nearby
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Trending Tags */}
          <div className="space-y-3">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="h-3 w-3" />
              Trending Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {trendingTags.map((item) => (
                <Badge
                  key={item.tag}
                  variant="secondary"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => onTagClick(item.tag)}
                >
                  #{item.tag}
                  <span className="ml-1 text-[10px] opacity-70">
                    {item.count}
                  </span>
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Suggested Users */}
          <div className="space-y-3">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Users className="h-3 w-3" />
              Who to Follow
            </label>
            <div className="space-y-2">
              {suggestedUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-lg">
                    {user.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium truncate">
                        {user.name}
                      </span>
                      {user.isVerified && (
                        <Badge
                          variant="secondary"
                          className="h-4 px-1 text-[10px]"
                        >
                          ✓
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {user.handle} · {user.followers}
                    </span>
                  </div>
                  <Button size="sm" variant="outline" className="h-7 text-xs">
                    Follow
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </SidebarGroupContent>
  );
}
