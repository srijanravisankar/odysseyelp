"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@/components/user-context";
import { Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

export function WelcomeCard() {
  const { user } = useUser();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const getFirstName = () => {
    if (!user?.name) return "Explorer";
    return user.name.split(" ")[0];
  };

  return (
    <Card className="col-span-full bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14 border-2 border-primary/20">
              <AvatarImage src={user?.avatar} alt={user?.name || "User"} />
              <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                {getFirstName().charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">
                {getGreeting()}, {getFirstName()}! 👋
              </CardTitle>
              <CardDescription className="text-base mt-1">
                Ready to discover your next adventure?
              </CardDescription>
            </div>
          </div>
          <Link href="/chat">
            <Button className="gap-2 hidden sm:flex">
              <Sparkles className="h-4 w-4" />
              Start Planning
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <p className="text-sm text-muted-foreground">
          Use AI to plan the perfect itinerary. Tell us where you want to go,
          and we&apos;ll help you discover amazing places.
        </p>
        <Link href="/chat" className="sm:hidden">
          <Button className="gap-2 mt-4 w-full">
            <Sparkles className="h-4 w-4" />
            Start Planning
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
