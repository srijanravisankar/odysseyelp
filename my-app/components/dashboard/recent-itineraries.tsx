"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MapPin,
  Clock,
  ChevronRight,
  Calendar,
  Coffee,
  Utensils,
  Music,
  ShoppingBag,
  Footprints,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Itinerary = {
  id: string;
  title: string;
  location: string;
  stopsCount: number;
  createdAt: string;
  status: "draft" | "planned" | "completed";
  category: "food" | "nightlife" | "shopping" | "nature" | "culture";
};

// This would typically come from the database
const recentItineraries: Itinerary[] = [
  {
    id: "1",
    title: "Birthday bar-hopping in downtown",
    location: "Toronto, ON",
    stopsCount: 5,
    createdAt: "2 hours ago",
    status: "planned",
    category: "nightlife",
  },
  {
    id: "2",
    title: "Cozy cafe date + sunset walk",
    location: "Queen St W, Toronto",
    stopsCount: 3,
    createdAt: "1 day ago",
    status: "draft",
    category: "food",
  },
  {
    id: "3",
    title: "Kensington Market food crawl",
    location: "Kensington, Toronto",
    stopsCount: 6,
    createdAt: "3 days ago",
    status: "completed",
    category: "food",
  },
  {
    id: "4",
    title: "High Park cherry blossoms",
    location: "High Park, Toronto",
    stopsCount: 2,
    createdAt: "1 week ago",
    status: "completed",
    category: "nature",
  },
];

const categoryIcons = {
  food: <Utensils className="h-3 w-3" />,
  nightlife: <Music className="h-3 w-3" />,
  shopping: <ShoppingBag className="h-3 w-3" />,
  nature: <Footprints className="h-3 w-3" />,
  culture: <Coffee className="h-3 w-3" />,
};

const statusColors = {
  draft:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300",
  planned: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  completed:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
};

export function RecentItineraries() {
  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg">Recent Itineraries</CardTitle>
          <CardDescription>Your latest travel plans</CardDescription>
        </div>
        <Link href="/my-space">
          <Button variant="ghost" size="sm" className="gap-1">
            View all
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[280px]">
          <div className="space-y-1 px-6 pb-6">
            {recentItineraries.map((itinerary) => (
              <Link
                key={itinerary.id}
                href={`/my-space?id=${itinerary.id}`}
                className="block"
              >
                <div
                  className={cn(
                    "flex items-center gap-4 p-3 rounded-lg",
                    "hover:bg-muted/50 transition-colors cursor-pointer",
                    "group"
                  )}
                >
                  {/* Category Icon */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                    {categoryIcons[itinerary.category]}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm truncate">
                        {itinerary.title}
                      </p>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-[10px] px-1.5 py-0",
                          statusColors[itinerary.status]
                        )}
                      >
                        {itinerary.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {itinerary.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {itinerary.createdAt}
                      </span>
                    </div>
                  </div>

                  {/* Stops count */}
                  <div className="text-right shrink-0">
                    <p className="text-sm font-medium">
                      {itinerary.stopsCount}
                    </p>
                    <p className="text-xs text-muted-foreground">stops</p>
                  </div>

                  {/* Arrow */}
                  <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
