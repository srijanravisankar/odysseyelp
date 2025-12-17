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
  BotMessageSquare,
  Sparkles,
  Route,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type QuickAction = {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
  bgColor: string;
};

const quickActions: QuickAction[] = [
  {
    title: "AI Chat",
    description: "Plan with AI assistant",
    icon: <BotMessageSquare className="h-5 w-5" />,
    href: "/chat",
    color: "text-violet-600 dark:text-violet-400",
    bgColor: "bg-violet-100 dark:bg-violet-950/50",
  },
  {
    title: "My Trips",
    description: "View saved itineraries",
    icon: <Route className="h-5 w-5" />,
    href: "/my-space",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-950/50",
  },
  {
    title: "Groups",
    description: "Collaborate with friends",
    icon: <UsersRound className="h-5 w-5" />,
    href: "/groups",
    color: "text-rose-600 dark:text-rose-400",
    bgColor: "bg-rose-100 dark:bg-rose-950/50",
  },
  {
    title: "Discover",
    description: "Browse trending spots",
    icon: <Sparkles className="h-5 w-5" />,
    href: "/explore",
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-100 dark:bg-amber-950/50",
  },
];

export function QuickActions() {
  return (
    <Card className="col-span-full md:col-span-2">
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
        <CardDescription>Jump right into what you need</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <Link key={action.title} href={action.href}>
              <Button
                variant="outline"
                className={cn(
                  "flex flex-col items-center justify-center gap-2 h-auto py-4 w-full",
                  "hover:border-primary/50 transition-all duration-200",
                  "group"
                )}
              >
                <div
                  className={cn(
                    "p-2 rounded-lg transition-transform group-hover:scale-110",
                    action.bgColor
                  )}
                >
                  <span className={action.color}>{action.icon}</span>
                </div>
                <div className="text-center">
                  <p className="font-medium text-sm">{action.title}</p>
                  <p className="text-xs text-muted-foreground hidden sm:block">
                    {action.description}
                  </p>
                </div>
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
