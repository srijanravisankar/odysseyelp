"use client";

import React, { useState } from "react";
import {
  Heart,
  MessageCircle,
  Repeat2,
  Share,
  MoreHorizontal,
  Bookmark,
  MapPin,
  Clock,
  Users,
  TrendingUp,
  Sparkles,
  BadgeCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PlanCard } from "@/components/plan-card";
import { TouringMap } from "@/components/touring-map";
import { cn } from "@/lib/utils";

// Mock data for published itineraries (social feed)
const publishedItineraries = [
  {
    id: "1",
    user: {
      name: "Toronto Foodies",
      handle: "@torontofoodies",
      avatar: "/avatars/user1.jpg",
      isVerified: true,
    },
    title: "Ultimate Kensington Market Food Crawl 🍜",
    description:
      "Spent the whole afternoon exploring hidden gems in Kensington! From the best empanadas to authentic Vietnamese pho. This route covers 6 amazing spots you NEED to try.",
    tags: ["TorontoFoodie", "KensingtonMarket", "FoodCrawl", "HiddenGems"],
    stops: 6,
    duration: "3 hours",
    location: "Kensington Market, Toronto",
    coordinates: { lng: -79.4025, lat: 43.6545, zoom: 15 },
    stats: {
      likes: 2453,
      comments: 187,
      reposts: 342,
      saves: 1205,
    },
    isLiked: false,
    isSaved: false,
    timestamp: "2h ago",
  },
  {
    id: "2",
    user: {
      name: "DateNight TO",
      handle: "@datenightto",
      avatar: "/avatars/user2.jpg",
      isVerified: false,
    },
    title: "Romantic Waterfront Evening Walk & Dinner 💑",
    description:
      "Perfect date night itinerary! Start with sunset views at Sugar Beach, walk along the boardwalk, and end with dinner at one of the best Italian restaurants in the city.",
    tags: ["DateNight", "Waterfront", "RomanticDinner", "TorontoDate"],
    stops: 4,
    duration: "4 hours",
    location: "Harbourfront, Toronto",
    coordinates: { lng: -79.3762, lat: 43.6393, zoom: 14 },
    stats: {
      likes: 1876,
      comments: 94,
      reposts: 256,
      saves: 892,
    },
    isLiked: true,
    isSaved: true,
    timestamp: "5h ago",
  },
  {
    id: "3",
    user: {
      name: "Local Explorer",
      handle: "@localexplorer",
      avatar: "/avatars/user3.jpg",
      isVerified: true,
    },
    title: "High Park Cherry Blossom Walking Tour 🌸",
    description:
      "Cherry blossom season is HERE! Created the perfect walking route through High Park to see all the best spots. Pro tip: Go early morning to avoid crowds!",
    tags: ["HighPark", "CherryBlossoms", "Spring", "NatureWalk"],
    stops: 5,
    duration: "2 hours",
    location: "High Park, Toronto",
    coordinates: { lng: -79.4636, lat: 43.6465, zoom: 14 },
    stats: {
      likes: 3241,
      comments: 256,
      reposts: 512,
      saves: 1567,
    },
    isLiked: false,
    isSaved: false,
    timestamp: "1d ago",
  },
  {
    id: "4",
    user: {
      name: "Adventure Seekers",
      handle: "@adventureseekers",
      avatar: "/avatars/user4.jpg",
      isVerified: true,
    },
    title: "Downtown Toronto Bar Hopping Route 🍻",
    description:
      "The ultimate Friday night bar crawl! Starting from King West, hitting all the best cocktail bars and ending at a rooftop with stunning city views.",
    tags: ["NightLife", "BarCrawl", "KingWest", "TorontoNightlife"],
    stops: 7,
    duration: "5 hours",
    location: "King West, Toronto",
    coordinates: { lng: -79.3957, lat: 43.6445, zoom: 15 },
    stats: {
      likes: 1543,
      comments: 123,
      reposts: 234,
      saves: 678,
    },
    isLiked: false,
    isSaved: false,
    timestamp: "2d ago",
  },
  {
    id: "5",
    user: {
      name: "Family Fun TO",
      handle: "@familyfunto",
      avatar: "/avatars/user5.jpg",
      isVerified: false,
    },
    title: "Kid-Friendly Science Centre & Zoo Day 🦁",
    description:
      "Perfect family day out! Combined the Ontario Science Centre with Toronto Zoo. Kids were exhausted but SO happy. Includes lunch spots that are kid-approved!",
    tags: ["FamilyFriendly", "TorontoWithKids", "ScienceCentre", "TorontoZoo"],
    stops: 4,
    duration: "6 hours",
    location: "North York & Scarborough",
    coordinates: { lng: -79.3382, lat: 43.7165, zoom: 12 },
    stats: {
      likes: 987,
      comments: 67,
      reposts: 145,
      saves: 423,
    },
    isLiked: true,
    isSaved: false,
    timestamp: "3d ago",
  },
];

function formatNumber(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return num.toString();
}

type FeedItemProps = {
  itinerary: (typeof publishedItineraries)[0];
  onLike: (id: string) => void;
  onSave: (id: string) => void;
};

function FeedItem({ itinerary, onLike, onSave }: FeedItemProps) {
  return (
    <article className="border-b border-border/50 p-4 hover:bg-muted/30 transition-colors">
      {/* Header */}
      <div className="flex gap-3">
        <Avatar className="h-10 w-10 ring-2 ring-background">
          <AvatarImage src={itinerary.user.avatar} />
          <AvatarFallback>{itinerary.user.name[0]}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          {/* User info row */}
          <div className="flex items-center gap-1 flex-wrap">
            <span className="font-semibold text-sm hover:underline cursor-pointer">
              {itinerary.user.name}
            </span>
            {itinerary.user.isVerified && (
              <BadgeCheck className="h-4 w-4 text-primary fill-primary/20" />
            )}
            <span className="text-muted-foreground text-sm">
              {itinerary.user.handle}
            </span>
            <span className="text-muted-foreground text-sm">·</span>
            <span className="text-muted-foreground text-sm">
              {itinerary.timestamp}
            </span>

            {/* More menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 ml-auto rounded-full hover:bg-muted"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Copy link</DropdownMenuItem>
                <DropdownMenuItem>
                  Follow {itinerary.user.handle}
                </DropdownMenuItem>
                <DropdownMenuItem>Report</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Content */}
          <div className="mt-1 space-y-3">
            <h3 className="font-semibold text-base">{itinerary.title}</h3>
            <p className="text-sm text-foreground/90 leading-relaxed">
              {itinerary.description}
            </p>

            {/* Meta info */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {itinerary.location}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {itinerary.duration}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {itinerary.stops} stops
              </span>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5">
              {itinerary.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-xs font-normal cursor-pointer hover:bg-primary hover:text-primary-foreground"
                >
                  #{tag}
                </Badge>
              ))}
            </div>

            {/* Map Preview Card */}
            <div className="mt-3 rounded-xl overflow-hidden border border-border/50">
              <PlanCard
                title={itinerary.title}
                createdBy={itinerary.user.name}
                meta={`${itinerary.stops} stops · ${itinerary.duration}`}
                isLiked={itinerary.isLiked}
                isPublished={true}
                onClick={() => console.log("Open itinerary", itinerary.id)}
                onToggleLike={() => onLike(itinerary.id)}
                onTogglePublish={() => {}}
                thumbnail={
                  <TouringMap
                    initialLng={itinerary.coordinates.lng}
                    initialLat={itinerary.coordinates.lat}
                    initialZoom={itinerary.coordinates.zoom}
                  />
                }
              />
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between pt-2 -mx-2">
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full"
              >
                <MessageCircle className="h-4 w-4" />
                <span className="text-xs">
                  {formatNumber(itinerary.stats.comments)}
                </span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 rounded-full"
              >
                <Repeat2 className="h-4 w-4" />
                <span className="text-xs">
                  {formatNumber(itinerary.stats.reposts)}
                </span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "gap-1.5 rounded-full",
                  itinerary.isLiked
                    ? "text-red-500 hover:text-red-500 hover:bg-red-500/10"
                    : "text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                )}
                onClick={() => onLike(itinerary.id)}
              >
                <Heart
                  className={cn("h-4 w-4", itinerary.isLiked && "fill-current")}
                />
                <span className="text-xs">
                  {formatNumber(itinerary.stats.likes)}
                </span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "gap-1.5 rounded-full",
                  itinerary.isSaved
                    ? "text-primary hover:text-primary hover:bg-primary/10"
                    : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                )}
                onClick={() => onSave(itinerary.id)}
              >
                <Bookmark
                  className={cn("h-4 w-4", itinerary.isSaved && "fill-current")}
                />
                <span className="text-xs">
                  {formatNumber(itinerary.stats.saves)}
                </span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full"
              >
                <Share className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function ExplorePage() {
  const [itineraries, setItineraries] = useState(publishedItineraries);
  const [activeTab, setActiveTab] = useState("for-you");

  const handleLike = (id: string) => {
    setItineraries((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              isLiked: !item.isLiked,
              stats: {
                ...item.stats,
                likes: item.isLiked
                  ? item.stats.likes - 1
                  : item.stats.likes + 1,
              },
            }
          : item
      )
    );
  };

  const handleSave = (id: string) => {
    setItineraries((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              isSaved: !item.isSaved,
              stats: {
                ...item.stats,
                saves: item.isSaved
                  ? item.stats.saves - 1
                  : item.stats.saves + 1,
              },
            }
          : item
      )
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Tabs Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border/50">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full h-12 bg-transparent p-0 rounded-none">
            <TabsTrigger
              value="for-you"
              className="flex-1 h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              For You
            </TabsTrigger>
            <TabsTrigger
              value="trending"
              className="flex-1 h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Trending
            </TabsTrigger>
            <TabsTrigger
              value="following"
              className="flex-1 h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              <Users className="h-4 w-4 mr-2" />
              Following
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Feed */}
      <ScrollArea className="flex-1">
        <div className="divide-y divide-border/50">
          {itineraries.map((itinerary) => (
            <FeedItem
              key={itinerary.id}
              itinerary={itinerary}
              onLike={handleLike}
              onSave={handleSave}
            />
          ))}
        </div>

        {/* Load more indicator */}
        <div className="p-8 text-center text-muted-foreground">
          <Button variant="outline" className="rounded-full">
            Load more itineraries
          </Button>
        </div>
      </ScrollArea>
    </div>
  );
}
