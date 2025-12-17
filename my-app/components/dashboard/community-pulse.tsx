"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, ThumbsUp, ThumbsDown } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

export type PulseItem = {
  id: string
  type: "comment" | "vote"
  content: string
  itineraryTitle: string
  itineraryId: number
  authorName: string
  createdAt: string
  voteType?: "like" | "dislike"
}

type CommunityPulseProps = {
  items: PulseItem[]
}

export function CommunityPulse({ items }: CommunityPulseProps) {
  return (
    <Card className="col-span-full xl:col-span-1">
      <CardHeader>
        <CardTitle className="text-lg">Community Pulse</CardTitle>
        <CardDescription>Live comments & reactions</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[320px]">
          <div className="space-y-4 px-6 pb-6">
            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground">No activity yet. Publish and share an itinerary to spark engagement.</p>
            ) : (
              items.map((item) => (
                <div key={`${item.type}-${item.id}`} className="rounded-xl border bg-card/60 p-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      {item.type === "comment" ? (
                        <Badge variant="secondary" className="gap-1">
                          <MessageSquare className="h-3 w-3" /> Comment
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1">
                          {item.voteType === "like" ? <ThumbsUp className="h-3 w-3" /> : <ThumbsDown className="h-3 w-3" />}
                          Vote
                        </Badge>
                      )}
                      <span>{formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}</span>
                    </div>
                    <span className="text-muted-foreground">{item.authorName}</span>
                  </div>
                  <p className="mt-2 text-sm line-clamp-2">{item.content}</p>
                  <Link href={`/explore?focus=${item.itineraryId}`} className="mt-3 inline-flex text-xs text-primary hover:underline">
                    View “{item.itineraryTitle}”
                  </Link>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
