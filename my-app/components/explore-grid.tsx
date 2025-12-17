"use client"
// here is the comment

import { useEffect, useState, useMemo } from "react"
import { PlanCard } from "@/components/plan-card"
import { TouringMap } from "@/components/touring-map"
import { useSupabase } from "@/hooks/context/supabase-context"
import { Spinner } from "@/components/ui/spinner"
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Timeline,
    TimelineBody,
    TimelineHeader,
    TimelineIcon,
    TimelineItem,
    TimelineSeparator,
} from "@/components/ui/timeline"
import { Store, MapPin, Star, Phone } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { FilterOptions, SortOption } from "@/hooks/context/explore-context"

interface PublishedItinerary {
    id: number
    created_at: string
    user_id: string
    title: string
    prompt: string
    stops: any
    tags: string[]
    user: {
        name: string
        email: string
    }
    social_stats?: {
        like_count: number
        dislike_count: number
        comment_count: number
    }
}


type ExploreGridProps = {
    sortBy: SortOption
    filters: FilterOptions
}

export function ExploreGrid({
    sortBy,
    filters,
}: ExploreGridProps) {
    const supabase = useSupabase()
    const [itineraries, setItineraries] = useState<PublishedItinerary[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [selectedItinerary, setSelectedItinerary] = useState<PublishedItinerary | null>(null)
    const [activeTab, setActiveTab] = useState<"stops" | "map" | "comments">("stops")
    const [userVotes, setUserVotes] = useState<Record<number, 'like' | 'dislike'>>({})
    const [currentUserId, setCurrentUserId] = useState<string | null>(null)
    const [comments, setComments] = useState<any[]>([])
    const [commentText, setCommentText] = useState('')
    const [loadingComments, setLoadingComments] = useState(false)
    const [submittingComment, setSubmittingComment] = useState(false)

    // Fetch current user
    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                setCurrentUserId(user.id)
            }
        }
        fetchUser()
    }, [supabase])

    // Fetch user's votes when user is loaded
    useEffect(() => {
        if (!currentUserId) return

        const fetchUserVotes = async () => {
            const { data, error } = await supabase
                .from('itinerary_votes')
                .select('itinerary_id, vote_type')
                .eq('user_id', currentUserId)

            if (!error && data) {
                const votesMap: Record<number, 'like' | 'dislike'> = {}
                data.forEach((vote: any) => {
                    votesMap[vote.itinerary_id] = vote.vote_type
                })
                setUserVotes(votesMap)
            }
        }
        fetchUserVotes()
    }, [currentUserId, supabase])

    useEffect(() => {
        const fetchPublishedItineraries = async () => {
            setLoading(true)
            setError(null)

            try {
                const { data, error: queryError } = await supabase
                    .from("itineraries")
                    .select(`
                        id,
                        created_at,
                        user_id,
                        title,
                        prompt,
                        stops,
                        tags,
                        user:users!itineraries_user_id_fkey (
                            name,
                            email
                        ),
                        social_stats:itinerary_social_stats!itinerary_social_stats_itinerary_id_fkey (
                            like_count,
                            dislike_count,
                            comment_count
                        )
                    `)
                    .eq("published", true)
                    .order("created_at", { ascending: false })

                if (queryError) {
                    setError(queryError.message)
                    console.error("Error fetching published itineraries:", queryError)
                    return
                }

                const transformedData = (data || []).map((item: any) => ({
                    ...item,
                    user: item.user || { name: "Unknown", email: "" },
                    social_stats: Array.isArray(item.social_stats) && item.social_stats.length > 0
                        ? item.social_stats[0]
                        : item.social_stats || { like_count: 0, dislike_count: 0, comment_count: 0 }
                }))

                setItineraries(transformedData)
            } catch (err: any) {
                setError(err.message || "Failed to fetch itineraries")
                console.error("Fetch error:", err)
            } finally {
                setLoading(false)
            }
        }

        fetchPublishedItineraries()
    }, [supabase])

    // Helper function to get stops count
    const getStopsCount = (stops: any): number => {
        if (!stops) return 0
        if (Array.isArray(stops)) return stops.length
        if (stops.stops && Array.isArray(stops.stops)) return stops.stops.length
        return 0
    }

    // Enhanced filtering logic with all filter types
    const filteredAndSortedItineraries = useMemo(() => {
        let result = [...itineraries]

        // Apply tag filter
        if (filters.tags.length > 0) {
            result = result.filter((itinerary) => {
                // Check if filtering for "none" (no tags)
                if (filters.tags.includes('none')) {
                    // If "none" is selected and this itinerary has no tags, include it
                    if (!itinerary.tags || itinerary.tags.length === 0) {
                        return true
                    }
                }

                // For other tag filters
                const otherTags = filters.tags.filter(t => t !== 'none')
                if (otherTags.length > 0) {
                    return otherTags.some(filterTag =>
                        itinerary.tags?.some(tag =>
                            tag.toLowerCase() === filterTag.toLowerCase()
                        )
                    )
                }

                return filters.tags.includes('none') && (!itinerary.tags || itinerary.tags.length === 0)
            })
        }


        // Apply date range filter
        if (filters.dateRange) {
            const now = new Date()
            result = result.filter((itinerary) => {
                const createdDate = new Date(itinerary.created_at)
                const diffMs = now.getTime() - createdDate.getTime()
                const diffDays = Math.floor(diffMs / 86400000)

                if (filters.dateRange === 'today') return diffDays === 0
                if (filters.dateRange === 'week') return diffDays <= 7
                if (filters.dateRange === 'month') return diffDays <= 30
                return true
            })
        }

        // Apply sorting
        switch (sortBy) {
            case "newest":
                result.sort((a, b) =>
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                )
                break
            case "oldest":
                result.sort((a, b) =>
                    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                )
                break
            case "most-stops":
                result.sort((a, b) => {
                    const stopsA = getStopsCount(a.stops)
                    const stopsB = getStopsCount(b.stops)
                    return stopsB - stopsA
                })
                break
            case "fewest-stops":
                result.sort((a, b) => {
                    const stopsA = getStopsCount(a.stops)
                    const stopsB = getStopsCount(b.stops)
                    return stopsA - stopsB
                })
                break
        }

        return result
    }, [itineraries, sortBy, filters])

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)

        if (diffMins < 1) return "just now"
        if (diffMins < 60) return `${diffMins}m ago`
        if (diffHours < 24) return `${diffHours}h ago`
        if (diffDays < 7) return `${diffDays}d ago`

        return date.toLocaleDateString()
    }

    const getMapCenter = (stops: any): { lat: number; lng: number } => {
        const defaultCenter = { lat: 43.6532, lng: -79.3832 }
        if (!stops) return defaultCenter
        if (stops.center?.lat && stops.center?.lng) {
            return { lat: stops.center.lat, lng: stops.center.lng }
        }
        const stopsArray = Array.isArray(stops) ? stops : stops.stops
        if (stopsArray && stopsArray.length > 0) {
            const firstStop = stopsArray[0]
            if (firstStop.coordinates?.lat && firstStop.coordinates?.lng) {
                return { lat: firstStop.coordinates.lat, lng: firstStop.coordinates.lng }
            }
        }
        return defaultCenter
    }

    const getInitials = (name: string): string => {
        return name
            .split(" ")
            .map(n => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
    }

    // Fetch comments when dialog opens or activeTab changes to comments
    useEffect(() => {
        if (dialogOpen && selectedItinerary && activeTab === 'comments') {
            fetchComments(selectedItinerary.id)
        }
    }, [dialogOpen, selectedItinerary, activeTab])

    const fetchComments = async (itineraryId: number) => {
        setLoadingComments(true)
        const { data, error } = await supabase
            .from('itinerary_comments')
            .select(`
                id,
                comment_text,
                created_at,
                updated_at,
                is_edited,
                user_id,
                user:users!itinerary_comments_user_id_fkey (
                    name,
                    email
                )
            `)
            .eq('itinerary_id', itineraryId)
            .order('created_at', { ascending: false })

        if (!error && data) {
            setComments(data)
        } else {
            console.error('Error fetching comments:', error)
        }
        setLoadingComments(false)
    }

    const handleSubmitComment = async () => {
        if (!currentUserId || !selectedItinerary || !commentText.trim()) {
            return
        }

        setSubmittingComment(true)
        const { error } = await supabase
            .from('itinerary_comments')
            .insert({
                itinerary_id: selectedItinerary.id,
                user_id: currentUserId,
                comment_text: commentText.trim()
            })

        if (!error) {
            setCommentText('')
            await fetchComments(selectedItinerary.id)

            // Update comment count in itineraries state
            const { data: statsData } = await supabase
                .from('itinerary_social_stats')
                .select('comment_count')
                .eq('itinerary_id', selectedItinerary.id)
                .single()

            if (statsData) {
                setItineraries(prev => prev.map(it => {
                    if (it.id === selectedItinerary.id) {
                        return {
                            ...it,
                            social_stats: {
                                ...it.social_stats!,
                                comment_count: statsData.comment_count
                            }
                        }
                    }
                    return it
                }))
            }
        } else {
            console.error('Error submitting comment:', error)
        }
        setSubmittingComment(false)
    }

    const handleDeleteComment = async (commentId: number) => {
        if (!currentUserId || !selectedItinerary) return

        const { error } = await supabase
            .from('itinerary_comments')
            .delete()
            .eq('id', commentId)
            .eq('user_id', currentUserId)

        if (!error) {
            await fetchComments(selectedItinerary.id)

            // Update comment count
            const { data: statsData } = await supabase
                .from('itinerary_social_stats')
                .select('comment_count')
                .eq('itinerary_id', selectedItinerary.id)
                .single()

            if (statsData) {
                setItineraries(prev => prev.map(it => {
                    if (it.id === selectedItinerary.id) {
                        return {
                            ...it,
                            social_stats: {
                                ...it.social_stats!,
                                comment_count: statsData.comment_count
                            }
                        }
                    }
                    return it
                }))
            }
        } else {
            console.error('Error deleting comment:', error)
        }
    }

    const handleVote = async (itineraryId: number, voteType: 'like' | 'dislike') => {
        if (!currentUserId) {
            console.error('User must be logged in to vote')
            return
        }

        const currentVote = userVotes[itineraryId]

        // Optimistic UI update
        const newVotes = { ...userVotes }

        if (currentVote === voteType) {
            // User is removing their vote
            delete newVotes[itineraryId]
            setUserVotes(newVotes)

            // Remove vote from database
            const { error } = await supabase
                .from('itinerary_votes')
                .delete()
                .eq('itinerary_id', itineraryId)
                .eq('user_id', currentUserId)

            if (error) {
                console.error('Error removing vote:', error)
                setUserVotes(userVotes) // Revert on error
            }
        } else {
            // User is adding or changing their vote
            newVotes[itineraryId] = voteType
            setUserVotes(newVotes)

            // Insert or update vote in database
            const { error } = await supabase
                .from('itinerary_votes')
                .upsert({
                    itinerary_id: itineraryId,
                    user_id: currentUserId,
                    vote_type: voteType,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'itinerary_id,user_id'
                })

            if (error) {
                console.error('Error updating vote:', error)
                setUserVotes(userVotes) // Revert on error
            }
        }

        // Refetch itineraries to get updated counts
        const { data, error: queryError } = await supabase
            .from("itineraries")
            .select(`
                id,
                social_stats:itinerary_social_stats!itinerary_social_stats_itinerary_id_fkey (
                    like_count,
                    dislike_count,
                    comment_count
                )
            `)
            .eq("id", itineraryId)
            .single()

        if (!queryError && data) {
            setItineraries(prev => prev.map(it => {
                if (it.id === itineraryId) {
                    const socialStatsArray = data.social_stats as any
                    const socialStats: { like_count: number; dislike_count: number; comment_count: number } =
                        Array.isArray(socialStatsArray) && socialStatsArray.length > 0
                            ? socialStatsArray[0]
                            : socialStatsArray || { like_count: 0, dislike_count: 0, comment_count: 0 }
                    return { ...it, social_stats: socialStats }
                }
                return it
            }))
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64 w-full">
                <Spinner />
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64 w-full">
                <p className="text-muted-foreground">Error: {error}</p>
            </div>
        )
    }

    if (filteredAndSortedItineraries.length === 0) {
        const message = filters.tags.length > 0 || filters.dateRange
            ? "No itineraries match your filters"
            : "No published itineraries yet"
        const description = filters.tags.length > 0 || filters.dateRange
            ? "Try adjusting your filters"
            : "Be the first to share your itinerary with the community!"

        return (
            <div className="flex flex-col items-center justify-center h-64 w-full gap-2">
                <p className="text-muted-foreground">{message}</p>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
        )
    }

    return (
        <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredAndSortedItineraries.map((itinerary) => {
                    const stopsCount = getStopsCount(itinerary.stops)
                    const center = getMapCenter(itinerary.stops)

                    return (
                        <PlanCard
                            key={itinerary.id}
                            title={itinerary.title}
                            createdBy={itinerary.user.name}
                            meta={`${stopsCount} stop${stopsCount !== 1 ? 's' : ''} · ${formatDate(itinerary.created_at)}`}
                            isLiked={false}
                            isPublished={true}
                            hideActions={true}
                            showSocialActions={true}
                            likeCount={itinerary.social_stats?.like_count || 0}
                            dislikeCount={itinerary.social_stats?.dislike_count || 0}
                            commentCount={itinerary.social_stats?.comment_count || 0}
                            userVote={userVotes[itinerary.id]}
                            onLike={() => handleVote(itinerary.id, 'like')}
                            onDislike={() => handleVote(itinerary.id, 'dislike')}
                            onComment={() => {
                                setSelectedItinerary(itinerary)
                                setActiveTab("comments")
                                setDialogOpen(true)
                            }}
                            onClick={() => {
                                setSelectedItinerary(itinerary)
                                setActiveTab("stops")
                                setDialogOpen(true)
                            }}
                            thumbnail={
                                <TouringMap
                                    initialLng={center.lng}
                                    initialLat={center.lat}
                                    initialZoom={12}
                                    itineraryDataProp={itinerary}
                                    isPreview={true}
                                />
                            }
                        />
                    )
                })}
            </div>

            <Dialog open={dialogOpen} onOpenChange={(open) => {
                setDialogOpen(open)
                if (!open) setActiveTab("stops")
            }}>
                <DialogContent
                  className="max-w-[1200px] w-[90vw] h-[85vh] p-0 flex flex-col overflow-hidden"
                >
                    {/* Header */}
                    <div className="px-6 py-4 border-b shrink-0">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-primary/10 text-primary">
                                    {selectedItinerary?.user?.name ? getInitials(selectedItinerary.user.name) : "?"}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <DialogTitle className="text-lg font-semibold">
                                    {selectedItinerary?.title}
                                </DialogTitle>
                                <p className="text-sm text-muted-foreground">
                                    by {selectedItinerary?.user?.name}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex justify-center border-b shrink-0 bg-background">
                        <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground my-2">
                            <button
                                onClick={() => setActiveTab("stops")}
                                className={cn(
                                    "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-1.5 text-sm font-medium transition-all",
                                    activeTab === "stops"
                                        ? "bg-background text-foreground shadow-sm"
                                        : "hover:bg-background/50"
                                )}
                            >
                                Stops
                            </button>
                            <button
                                onClick={() => setActiveTab("map")}
                                className={cn(
                                    "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-1.5 text-sm font-medium transition-all",
                                    activeTab === "map"
                                        ? "bg-background text-foreground shadow-sm"
                                        : "hover:bg-background/50"
                                )}
                            >
                                Map
                            </button>
                            <button
                                onClick={() => setActiveTab("comments")}
                                className={cn(
                                    "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-1.5 text-sm font-medium transition-all",
                                    activeTab === "comments"
                                        ? "bg-background text-foreground shadow-sm"
                                        : "hover:bg-background/50"
                                )}
                            >
                                Comments
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-hidden relative">
                        {activeTab === "stops" ? (
                            <ScrollArea className="h-full">
                                <div className="p-6">
                                    <Timeline>
                                        {selectedItinerary?.stops?.stops?.map((stop: any, index: number) => {
                                            const formattedAddress =
                                                stop.address?.split("\n").join(", ") || "Address unavailable"
                                            const stopId = stop.id ?? String(index)
                                            const totalStops = selectedItinerary?.stops?.stops?.length || 0

                                            return (
                                                <TimelineItem key={stopId}>
                                                    <TimelineHeader className="flex flex-col items-center">
                                                        {index !== totalStops - 1 && (
                                                            <TimelineSeparator className="bg-gray-300 w-px flex-1 mt-1" />
                                                        )}
                                                        <TimelineIcon
                                                            className={cn(
                                                                "mt-4 h-9 w-9 [&_svg]:h-5 [&_svg]:w-5 bg-muted flex items-center justify-center border",
                                                                "border-rose-400/70 text-rose-500"
                                                            )}
                                                        >
                                                            <Store />
                                                        </TimelineIcon>
                                                    </TimelineHeader>

                                                    <TimelineBody className="pl-1 w-full relative">
                                                        <div
                                                            className={cn(
                                                                "relative w-full overflow-hidden rounded-lg border p-3",
                                                                "bg-card/70 hover:bg-accent/40",
                                                                "transition-all duration-200",
                                                                "border-rose-400/70"
                                                            )}
                                                        >
                                                            <div className="flex gap-3">
                                                                <div className="w-0.5 rounded-full mt-3 mb-3 bg-rose-400" />

                                                                <div className="flex-1 flex flex-col gap-0.5 min-w-0">
                                                                    <h3
                                                                        className="text-md leading-tight text-foreground truncate"
                                                                        title={stop.name}
                                                                    >
                                                                        {stop.name}
                                                                    </h3>

                                                                    <Separator />

                                                                    <div className="grid gap-2 text-sm text-muted-foreground">
                                                                        <div className="flex items-center gap-1">
                                                                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                                            <span className="text-xs font-semibold text-foreground">
                                                                                {stop.rating || "N/A"}
                                                                            </span>
                                                                            <span className="text-xs">
                                                                                ({stop.reviewCount || 0} reviews)
                                                                            </span>
                                                                        </div>

                                                                        <div className="flex items-start gap-1">
                                                                            <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                                                                            <div
                                                                                className="leading-tight text-foreground truncate"
                                                                                title={formattedAddress}
                                                                            >
                                                                                {formattedAddress}
                                                                            </div>
                                                                        </div>

                                                                        {stop.phone && (
                                                                            <div className="flex items-center gap-1">
                                                                                <Phone className="h-4 w-4 shrink-0" />
                                                                                <a
                                                                                    href={`tel:${stop.phone}`}
                                                                                    className="hover:text-primary hover:underline transition-colors"
                                                                                >
                                                                                    {stop.phone}
                                                                                </a>
                                                                            </div>
                                                                        )}

                                                                        <div className={cn(
                                                                            "absolute bottom-3 right-4 flex items-center justify-center h-6 w-6 rounded-full text-md font-medium border border-rose-400/70 bg-primary/10 text-primary"
                                                                        )}>
                                                                            {String.fromCharCode(65 + index)}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </TimelineBody>
                                                </TimelineItem>
                                            )
                                        })}
                                    </Timeline>
                                </div>
                            </ScrollArea>
                        ) : activeTab === "map" ? (
                            <div className="w-full h-full">
                                <TouringMap
                                    initialLng={selectedItinerary?.stops?.center?.lng || -79.3832}
                                    initialLat={selectedItinerary?.stops?.center?.lat || 43.6532}
                                    initialZoom={12}
                                    itineraryDataProp={selectedItinerary}
                                    isPreview={true}
                                />
                            </div>
                        ) : (
                            <ScrollArea className="h-full">
                                <div className="p-6 space-y-6">
                                    {/* Comment Input */}
                                    {currentUserId ? (
                                        <div className="space-y-3">
                                            <h3 className="text-lg font-semibold">Add a Comment</h3>
                                            <div className="flex gap-3">
                                                <Avatar className="h-8 w-8 shrink-0">
                                                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                                        You
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 space-y-2">
                                                    <textarea
                                                        value={commentText}
                                                        onChange={(e) => setCommentText(e.target.value)}
                                                        placeholder="Share your thoughts..."
                                                        className="w-full min-h-[80px] px-3 py-2 text-sm rounded-md border border-input bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                                                        maxLength={2000}
                                                    />
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs text-muted-foreground">
                                                            {commentText.length}/2000
                                                        </span>
                                                        <button
                                                            onClick={handleSubmitComment}
                                                            disabled={!commentText.trim() || submittingComment}
                                                            className="px-4 py-1.5 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                        >
                                                            {submittingComment ? 'Posting...' : 'Post Comment'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-4 text-muted-foreground">
                                            Please log in to comment
                                        </div>
                                    )}

                                    <Separator />

                                    {/* Comments List */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold">
                                            Comments ({comments.length})
                                        </h3>

                                        {loadingComments ? (
                                            <div className="flex justify-center py-8">
                                                <Spinner />
                                            </div>
                                        ) : comments.length === 0 ? (
                                            <div className="text-center py-12 text-muted-foreground">
                                                No comments yet. Be the first to comment!
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {comments.map((comment) => {
                                                    const isOwnComment = comment.user_id === currentUserId
                                                    const timeAgo = formatDate(comment.created_at)

                                                    return (
                                                        <div key={comment.id} className="flex gap-3 group">
                                                            <Avatar className="h-8 w-8 shrink-0">
                                                                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                                                    {getInitials(comment.user?.name || 'U')}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex-1 space-y-1">
                                                                <div className="flex items-baseline gap-2">
                                                                    <span className="text-sm font-semibold">
                                                                        {comment.user?.name || 'Unknown User'}
                                                                    </span>
                                                                    <span className="text-xs text-muted-foreground">
                                                                        {timeAgo}
                                                                    </span>
                                                                    {comment.is_edited && (
                                                                        <span className="text-xs text-muted-foreground italic">
                                                                            (edited)
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <p className="text-sm text-foreground whitespace-pre-wrap break-words">
                                                                    {comment.comment_text}
                                                                </p>
                                                                {isOwnComment && (
                                                                    <button
                                                                        onClick={() => handleDeleteComment(comment.id)}
                                                                        className="text-xs text-red-500 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                    >
                                                                        Delete
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </ScrollArea>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

