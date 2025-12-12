"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Route, Star, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

type StatCard = {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color: string;
  bgColor: string;
};

// These would typically come from the database
const stats: StatCard[] = [
  {
    title: "Total Trips",
    value: 12,
    description: "Itineraries created",
    icon: <Route className="h-4 w-4" />,
    trend: { value: 8, isPositive: true },
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-950/50",
  },
  {
    title: "Places Visited",
    value: 47,
    description: "Unique locations",
    icon: <MapPin className="h-4 w-4" />,
    trend: { value: 12, isPositive: true },
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-100 dark:bg-emerald-950/50",
  },
  {
    title: "Favorites",
    value: 8,
    description: "Saved places",
    icon: <Star className="h-4 w-4" />,
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-100 dark:bg-amber-950/50",
  },
  {
    title: "Upcoming",
    value: 3,
    description: "Planned trips",
    icon: <Calendar className="h-4 w-4" />,
    color: "text-violet-600 dark:text-violet-400",
    bgColor: "bg-violet-100 dark:bg-violet-950/50",
  },
];

export function StatsCards() {
  return (
    <>
      {stats.map((stat) => (
        <Card key={stat.title} className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={cn("p-2 rounded-lg", stat.bgColor)}>
              <span className={stat.color}>{stat.icon}</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stat.description}
            </p>
            {stat.trend && (
              <p
                className={cn(
                  "text-xs mt-2 font-medium",
                  stat.trend.isPositive ? "text-emerald-600" : "text-red-600"
                )}
              >
                {stat.trend.isPositive ? "+" : "-"}
                {stat.trend.value}% from last month
              </p>
            )}
          </CardContent>
          {/* Decorative gradient */}
          <div
            className={cn(
              "absolute -right-8 -bottom-8 w-24 h-24 rounded-full opacity-10",
              stat.bgColor
            )}
          />
        </Card>
      ))}
    </>
  );
}
