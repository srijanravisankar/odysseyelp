"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, ArrowRight, TrendingUp } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export type HeroStats = {
  totalItineraries: number
  newThisWeek: number
  publishedCount: number
  topItinerary?: {
    title: string
    likeCount: number
    commentCount: number
  }
}

type AnalyticsHeroProps = {
  userName?: string
  stats: HeroStats
  className?: string
}

export function AnalyticsHero({ userName, stats, className }: AnalyticsHeroProps) {
  const displayName = userName?.split(" ")[0] ?? "Explorer"

  return (
    <Card className={cn("relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/30", className)}>
      <CardHeader className="gap-4">
        <div className="flex flex-col gap-2">
          <CardTitle className="text-2xl font-semibold">
            Welcome back, {displayName}
          </CardTitle>
          <CardDescription className="text-base">
            {stats.newThisWeek > 0
              ? `${stats.newThisWeek} new ${stats.newThisWeek === 1 ? "plan" : "plans"} created this week`
              : "Ready to craft your next journey?"}
          </CardDescription>
        </div>
        <Link href="/chat">
          <Button className="gap-2 w-full sm:w-auto">
            <Sparkles className="h-4 w-4" />
            Plan with AI
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border bg-background/80 p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Total itineraries</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-3xl font-semibold">{stats.totalItineraries}</span>
            {stats.newThisWeek > 0 && (
              <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="h-3 w-3" />
                +{stats.newThisWeek} this week
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {stats.publishedCount} published • {stats.totalItineraries - stats.publishedCount} drafts
          </p>
        </div>
        <div className="rounded-xl border bg-background/80 p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Top performer</p>
          {stats.topItinerary ? (
            <div className="mt-2">
              <p className="font-medium text-sm line-clamp-2">{stats.topItinerary.title}</p>
              <p className="text-xs text-muted-foreground mt-2">
                {stats.topItinerary.likeCount} likes • {stats.topItinerary.commentCount} comments
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground mt-2">
              Publish an itinerary to start collecting engagement stats.
            </p>
          )}
        </div>
      </CardContent>
      <div className="pointer-events-none absolute inset-y-0 right-0 m-auto hidden h-40 w-40 rounded-full bg-primary/20 blur-3xl sm:block" />
    </Card>
  )
}

