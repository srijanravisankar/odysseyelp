"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type TagStat = {
  tag: string
  usageCount: number
  avgLikes: number
}

type TagPerformanceProps = {
  tags: TagStat[]
}

export function TagPerformance({ tags }: TagPerformanceProps) {
  return (
    <Card className="col-span-full xl:col-span-1">
      <CardHeader>
        <CardTitle className="text-lg">Tag Performance</CardTitle>
        <CardDescription>Top hashtags driving engagement</CardDescription>
      </CardHeader>
      <CardContent>
        {tags.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Tags from published itineraries will appear here once available.
          </p>
        ) : (
          <div className="space-y-3">
            {tags.map((tag) => (
              <div
                key={tag.tag}
                className="flex items-center justify-between rounded-lg border bg-card/60 px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium">{tag.tag}</p>
                  <p className="text-xs text-muted-foreground">
                    {tag.usageCount} uses • avg {tag.avgLikes.toFixed(1)} likes
                  </p>
                </div>
                <Badge variant="secondary" className={cn("text-xs")}>{tag.avgLikes.toFixed(1)} avg</Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

