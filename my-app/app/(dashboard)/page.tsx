"use client";

import {
  WelcomeCard,
  QuickActions,
  StatsCards,
  RecentItineraries,
  FeaturedDestinations,
  QuickStartTips,
  AIPromptCard,
} from "@/components/dashboard";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Page() {
  return (
    <ScrollArea className="h-full">
      <div className="container max-w-7xl mx-auto p-6 space-y-6">
        {/* Welcome Section */}
        <div className="grid gap-6 grid-cols-1">
          <WelcomeCard />
        </div>

        {/* AI Prompt - Hero CTA */}
        <div className="grid gap-6 grid-cols-1">
          <AIPromptCard />
        </div>

        {/* Stats Overview */}
        <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">
          <StatsCards />
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          <QuickActions />
          <QuickStartTips />
        </div>

        {/* Main Content Area */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          <RecentItineraries />
          <FeaturedDestinations />
        </div>
      </div>
    </ScrollArea>
  );
}
