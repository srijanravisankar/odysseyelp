import { useEffect, useState } from "react"
import { useSupabase } from "@/hooks/context/supabase-context"
import { useUser } from "@/hooks/context/user-context"
import { formatDistanceToNow } from "date-fns"
import { Globe, Heart, Users, MapPin } from "lucide-react"

import type { HeroStats } from "@/components/dashboard/analytics-hero"
import type { MetricCard } from "@/components/dashboard/metrics-grid"
import type { GroupInsight } from "@/components/dashboard/group-insights"
import type { TagStat } from "@/components/dashboard/tag-performance"
import type { PulseItem } from "@/components/dashboard/community-pulse"

type HomeAnalytics = {
  loading: boolean
  error?: string
  hero: HeroStats
  metrics: MetricCard[]
  pulse: PulseItem[]
  tags: TagStat[]
  groups: GroupInsight[]
}

const initialState: HomeAnalytics = {
  loading: true,
  hero: {
    totalItineraries: 0,
    newThisWeek: 0,
    publishedCount: 0,
  },
  metrics: [],
  pulse: [],
  tags: [],
  groups: [],
}

export function useHomeAnalytics() {
  const supabase = useSupabase()
  const { user } = useUser()
  const [data, setData] = useState<HomeAnalytics>(initialState)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sinceDate = new Date()
        sinceDate.setDate(sinceDate.getDate() - 7)

        const [itinerariesRes, statsRes, commentsRes, votesRes, groupsRes, wishesRes] = await Promise.all([
          supabase
            .from("itineraries")
            .select("id, title, created_at, published, favorites, tags, stops, group_id")
            .order("created_at", { ascending: false }),
          supabase
            .from("itinerary_social_stats")
            .select("itinerary_id, like_count, dislike_count, comment_count"),
          supabase
            .from("itinerary_comments")
            .select("id, itinerary_id, comment_text, created_at, user_id")
            .order("created_at", { ascending: false })
            .limit(10),
          supabase
            .from("itinerary_votes")
            .select("id, itinerary_id, vote_type, created_at, user_id")
            .order("created_at", { ascending: false })
            .limit(10),
          supabase
            .from("groups")
            .select("id, name, created_at")
            .order("created_at", { ascending: false }),
          supabase
            .from("group_wishes")
            .select("id, group_id, created_at")
            .order("created_at", { ascending: false }),
        ])

        if (itinerariesRes.error) throw itinerariesRes.error
        if (statsRes.error) throw statsRes.error
        if (commentsRes.error) throw commentsRes.error
        if (votesRes.error) throw votesRes.error
        if (groupsRes.error) throw groupsRes.error
        if (wishesRes.error) throw wishesRes.error

        const itineraries = itinerariesRes.data || []
        const stats = statsRes.data || []
        const comments = commentsRes.data || []
        const votes = votesRes.data || []
        const groups = groupsRes.data || []
        const wishes = wishesRes.data || []

        const hero: HeroStats = {
          totalItineraries: itineraries.length,
          newThisWeek: itineraries.filter((itinerary) => new Date(itinerary.created_at) >= sinceDate).length,
          publishedCount: itineraries.filter((i) => i.published).length,
          topItinerary: undefined,
        }

        if (stats.length > 0) {
          const sorted = [...stats].sort((a, b) => b.like_count + b.comment_count - (a.like_count + a.comment_count))
          const top = sorted[0]
          const itinerary = itineraries.find((i) => i.id === top.itinerary_id)
          if (itinerary) {
            hero.topItinerary = {
              title: itinerary.title,
              likeCount: top.like_count,
              commentCount: top.comment_count,
            }
          }
        }

        const metrics: MetricCard[] = [
          {
            title: "Published",
            value: hero.publishedCount,
            description: "Live itineraries",
            icon: <Globe className="h-4 w-4" />,
            accent: "bg-sky-100 text-sky-600 dark:bg-sky-950/50 dark:text-sky-300",
            chip: `${((hero.publishedCount / (hero.totalItineraries || 1)) * 100).toFixed(0)}% of total`,
          },
          {
            title: "Favorites",
            value: itineraries.filter((i) => i.favorites).length,
            description: "Saved itineraries",
            icon: <Heart className="h-4 w-4" />,
            accent: "bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-300",
          },
          {
            title: "Groups",
            value: groups.length,
            description: "Active planning circles",
            icon: <Users className="h-4 w-4" />,
            accent: "bg-purple-100 text-purple-600 dark:bg-purple-950/50 dark:text-purple-300",
            chip: `${wishes.length} wishes shared`,
          },
          {
            title: "Unique cities",
            value: new Set(
              itineraries
                .flatMap((i) => (Array.isArray(i.stops?.stops) ? i.stops.stops : []))
                .map((stop: any) => stop?.address?.split(",").pop()?.trim())
                .filter(Boolean)
            ).size || 0,
            description: "Covered across your plans",
            icon: <MapPin className="h-4 w-4" />,
            accent: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300",
          },
        ]

        const pulse: PulseItem[] = [
          ...comments.map((comment) => {
            const itinerary = itineraries.find((i) => i.id === comment.itinerary_id)
            return {
              id: String(comment.id),
              type: "comment" as const,
              content: comment.comment_text,
              itineraryTitle: itinerary?.title ?? "Untitled itinerary",
              itineraryId: comment.itinerary_id,
              authorName: comment.user_id.slice(0, 6),
              createdAt: comment.created_at,
            }
          }),
          ...votes.map((vote) => {
            const itinerary = itineraries.find((i) => i.id === vote.itinerary_id)
            return {
              id: String(vote.id),
              type: "vote" as const,
              content: vote.vote_type === "like" ? "Liked an itinerary" : "Disliked an itinerary",
              itineraryTitle: itinerary?.title ?? "Untitled itinerary",
              itineraryId: vote.itinerary_id,
              authorName: vote.user_id.slice(0, 6),
              createdAt: vote.created_at,
              voteType: vote.vote_type,
            }
          }),
        ]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 8)

        const tagsMap = new Map<string, { usage: number; likes: number; count: number }>()
        for (const itinerary of itineraries) {
          if (!Array.isArray(itinerary.tags)) continue
          const stat = stats.find((s) => s.itinerary_id === itinerary.id)
          for (const tag of itinerary.tags) {
            if (!tagsMap.has(tag)) {
              tagsMap.set(tag, { usage: 0, likes: 0, count: 0 })
            }
            const current = tagsMap.get(tag)!
            current.usage += 1
            current.likes += stat?.like_count ?? 0
            current.count += stat ? 1 : 0
          }
        }
        const tags: TagStat[] = [...tagsMap.entries()]
          .map(([tag, info]) => ({ tag, usageCount: info.usage, avgLikes: info.count ? info.likes / info.count : 0 }))
          .sort((a, b) => b.usageCount - a.usageCount)
          .slice(0, 6)

        const groupsInsights: GroupInsight[] = groups.map((group) => {
          const groupItineraries = itineraries.filter((i) => i.group_id === group.id)
          const groupWishes = wishes.filter((w) => w.group_id === group.id)
          return {
            id: group.id,
            name: group.name,
            memberCount: 1,
            wishCount: groupWishes.length,
            itineraryCount: groupItineraries.length,
            lastActivity: groupItineraries[0]?.created_at
              ? formatDistanceToNow(new Date(groupItineraries[0].created_at), { addSuffix: true })
              : "No activity",
          }
        })

        setData({
          loading: false,
          hero,
          metrics,
          pulse,
          tags,
          groups: groupsInsights,
        })
      } catch (error: any) {
        console.error("Failed to load home analytics", error)
        setData((prev) => ({ ...prev, loading: false, error: "Unable to load analytics" }))
      }
    }

    fetchData()
  }, [supabase])

  return { ...data, user }
}

