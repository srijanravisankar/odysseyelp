"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export type GroupInsight = {
  id: number
  name: string
  memberCount: number
  wishCount: number
  itineraryCount: number
  lastActivity: string
}

type GroupInsightsProps = {
  groups: GroupInsight[]
}

export function GroupInsights({ groups }: GroupInsightsProps) {
  return (
    <Card className="col-span-full">
      <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-lg">Group Highlights</CardTitle>
          <CardDescription>Track wishlists and planning momentum</CardDescription>
        </div>
        <Link href="/groups" className="text-xs text-primary hover:underline">
          View groups
        </Link>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {groups.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Join or create a group to see collaborative insights here.
          </p>
        ) : (
          groups.map((group) => (
            <div key={group.id} className="rounded-xl border bg-card/60 p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium">{group.name}</p>
                <Badge variant="outline" className="text-xs">{group.memberCount} members</Badge>
              </div>
              <div className="mt-3 text-sm text-muted-foreground space-y-1">
                <p>{group.wishCount} wishes shared</p>
                <p>{group.itineraryCount} itineraries planned</p>
                <p>Last activity {group.lastActivity}</p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

