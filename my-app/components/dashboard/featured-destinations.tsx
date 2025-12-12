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
import { Star, MapPin, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Image from "next/image";

type Destination = {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviewCount: number;
  image: string;
  trending: boolean;
  priceRange: string;
};

// These would typically come from Yelp API
const featuredDestinations: Destination[] = [
  {
    id: "1",
    name: "Pai Northern Thai Kitchen",
    category: "Thai Restaurant",
    rating: 4.8,
    reviewCount: 2341,
    image: "/traveller-image.jpg",
    trending: true,
    priceRange: "$$",
  },
  {
    id: "2",
    name: "Bar Raval",
    category: "Wine Bar",
    rating: 4.7,
    reviewCount: 1892,
    image: "/traveller-image.jpg",
    trending: true,
    priceRange: "$$$",
  },
  {
    id: "3",
    name: "Kensington Market",
    category: "Neighborhood",
    rating: 4.6,
    reviewCount: 3421,
    image: "/traveller-image.jpg",
    trending: false,
    priceRange: "$",
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
          <CardDescription>Popular places to explore</CardDescription>
        </div>
        <Link href="/explore">
          <Button variant="ghost" size="sm" className="gap-1">
            Explore more
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-3">
          {featuredDestinations.map((destination) => (
            <div
              key={destination.id}
              className={cn(
                "group relative overflow-hidden rounded-xl border",
                "hover:border-primary/50 transition-all duration-200 cursor-pointer"
              )}
            >
              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={destination.image}
                  alt={destination.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Trending badge */}
                {destination.trending && (
                  <Badge className="absolute top-2 left-2 gap-1 bg-primary/90">
                    <TrendingUp className="h-3 w-3" />
                    Trending
                  </Badge>
                )}

                {/* Price */}
                <Badge
                  variant="secondary"
                  className="absolute top-2 right-2 bg-black/50 text-white border-0"
                >
                  {destination.priceRange}
                </Badge>
              </div>

              {/* Content */}
              <div className="p-3">
                <h4 className="font-semibold text-sm line-clamp-1">
                  {destination.name}
                </h4>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="h-3 w-3" />
                  {destination.category}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-medium">
                      {destination.rating}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    ({destination.reviewCount.toLocaleString()} reviews)
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
