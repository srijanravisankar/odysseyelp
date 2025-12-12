"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";
import { PlanCard } from "@/components/plan-card";
import { TouringMap } from "@/components/touring-map";

type TrendingItinerary = {
  id: string;
  title: string;
  createdBy: string;
  meta: string;
  isLiked: boolean;
  lng: number;
  lat: number;
  zoom: number;
};

const trendingItineraries: TrendingItinerary[] = [
  {
    id: "1",
    title: "Pai Northern Thai Kitchen & Bar Raval evening",
    createdBy: "Toronto Foodies",
    meta: "4 stops · 2.3k saves",
    isLiked: false,
    lng: -79.4,
    lat: 43.654,
    zoom: 14,
  },
  {
    id: "2",
    title: "Kensington Market food crawl adventure",
    createdBy: "Local Explorer",
    meta: "6 stops · 1.8k saves",
    isLiked: true,
    lng: -79.4025,
    lat: 43.6545,
    zoom: 15,
  },
  {
    id: "3",
    title: "Waterfront sunset walk & dinner",
    createdBy: "DateNight TO",
    meta: "3 stops · 956 saves",
    isLiked: false,
    lng: -79.3762,
    lat: 43.6393,
    zoom: 14,
  },
];

export function FeaturedDestinations() {
  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Trending Near You
          </CardTitle>
          <CardDescription>Popular itineraries to explore</CardDescription>
        </div>
        <Link href="/explore">
          <Button variant="ghost" size="sm" className="gap-1">
            Explore more
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {trendingItineraries.map((itinerary) => (
            <PlanCard
              key={itinerary.id}
              title={itinerary.title}
              createdBy={itinerary.createdBy}
              meta={itinerary.meta}
              isLiked={itinerary.isLiked}
              isPublished={false}
              onClick={() => console.log("Open itinerary", itinerary.id)}
              onToggleLike={() => console.log("Toggle like", itinerary.id)}
              onTogglePublish={() => console.log("Toggle publish", itinerary.id)}
              thumbnail={
                <TouringMap
                  initialLng={itinerary.lng}
                  initialLat={itinerary.lat}
                  initialZoom={itinerary.zoom}
                />
              }
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
