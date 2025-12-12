"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Lightbulb,
  MessageSquare,
  Map,
  Heart,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Tip = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  completed: boolean;
};

const tips: Tip[] = [
  {
    id: "1",
    title: "Chat with AI to plan your first trip",
    description: "Tell our AI where you want to go and what you're looking for",
    icon: <MessageSquare className="h-4 w-4" />,
    href: "/chat",
    completed: false,
  },
  {
    id: "2",
    title: "Explore the interactive map",
    description: "Discover places visually and find hidden gems nearby",
    icon: <Map className="h-4 w-4" />,
    href: "/touring",
    completed: false,
  },
  {
    id: "3",
    title: "Save your favorite spots",
    description: "Build a collection of places you love",
    icon: <Heart className="h-4 w-4" />,
    href: "/my-space",
    completed: true,
  },
];

export function QuickStartTips() {
  const completedCount = tips.filter((t) => t.completed).length;
  const progress = (completedCount / tips.length) * 100;

  return (
    <Card className="col-span-full md:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            <CardTitle className="text-lg">Getting Started</CardTitle>
          </div>
          <span className="text-sm text-muted-foreground">
            {completedCount}/{tips.length} completed
          </span>
        </div>
        <CardDescription>
          Quick tips to help you get the most out of Ranger
        </CardDescription>

        {/* Progress bar */}
        <div className="mt-2 h-2 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {tips.map((tip) => (
            <Link key={tip.id} href={tip.href}>
              <div
                className={cn(
                  "flex items-start gap-4 p-3 rounded-lg",
                  "hover:bg-muted/50 transition-colors cursor-pointer",
                  "group",
                  tip.completed && "opacity-60"
                )}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                    tip.completed
                      ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {tip.completed ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    tip.icon
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "font-medium text-sm",
                      tip.completed && "line-through"
                    )}
                  >
                    {tip.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {tip.description}
                  </p>
                </div>

                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
