"use client";

import {
  QuickActions,
  AnalyticsHero,
  MetricsGrid,
  CommunityPulse,
  TagPerformance,
  GroupInsights,
} from "@/components/dashboard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useHomeAnalytics } from "@/hooks/use-home-analytics";
import { Skeleton } from "@/components/ui/skeleton";

export default function Page() {
  const { loading, error, hero, metrics, pulse, tags, groups, user } = useHomeAnalytics();

  if (loading) {
    return (
      <ScrollArea className="h-full">
        <div className="container max-w-7xl mx-auto p-6 space-y-6">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
          </div>
          <div className="grid gap-6 xl:grid-cols-2">
            <Skeleton className="h-80 rounded-xl" />
            <Skeleton className="h-80 rounded-xl" />
          </div>
        </div>
      </ScrollArea>
    );
  }

  if (error) {
    return (
      <ScrollArea className="h-full">
        <div className="container max-w-7xl mx-auto p-6">
          <p className="text-destructive">{error}</p>
        </div>
      </ScrollArea>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="container max-w-7xl mx-auto p-6 space-y-6">
        {/* Hero Section with Key Stats */}
        <AnalyticsHero userName={user?.name} stats={hero} />

        {/* Quick Actions */}
        <QuickActions />

        {/* Metrics Grid */}
        <MetricsGrid metrics={metrics} />

        {/* Two-column layout: Community Pulse & Tag Performance */}
        <div className="grid gap-6 xl:grid-cols-2">
          <CommunityPulse items={pulse} />
          <TagPerformance tags={tags} />
        </div>

        {/* Group Insights */}
        <GroupInsights groups={groups} />
      </div>
    </ScrollArea>
  );
}
