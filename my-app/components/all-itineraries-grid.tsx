"use client"

import { useEffect, useState } from "react"
import { PlanCard } from "@/components/plan-card"
import { TouringMap } from "@/components/touring-map"
import { useSupabase } from "@/hooks/context/supabase-context"
import { useUser } from "@/hooks/context/user-context"
import { Spinner } from "@/components/ui/spinner"
import { Itinerary } from "@/hooks/context/itinerary-context"
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
import { toast } from "sonner"

type FilterType = "all" | "favorites" | "published"

type AllItinerariesGridProps = {
    filter?: FilterType
}

export function AllItinerariesGrid({ filter = "all" }: AllItinerariesGridProps) {
    const supabase = useSupabase()
    const { user } = useUser()
    const [itineraries, setItineraries] = useState<Itinerary[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [selectedItinerary, setSelectedItinerary] = useState<Itinerary | null>(null)
    const [activeTab, setActiveTab] = useState<"stops" | "map">("stops")

    useEffect(() => {
        const fetchAllItineraries = async () => {
            if (!user?.email) {
                setItineraries([])
                setLoading(false)
                return
            }

            setLoading(true)
            setError(null)

            try {
                const { data: authData } = await supabase.auth.getUser()
                if (!authData.user) {
                    setError("User not authenticated")
                    setLoading(false)
                    return
                }

                let query = supabase
                    .from("itineraries")
                    .select("*")
                    .eq("user_id", authData.user.id)

                // Apply filter based on type
                if (filter === "favorites") {
                    query = query.eq("favorites", true)
                } else if (filter === "published") {
                    query = query.eq("published", true)
                }

                const { data, error: queryError } = await query.order("created_at", { ascending: false })

                if (queryError) {
                    setError(queryError.message)
                    console.error("Error fetching itineraries:", queryError)
                    return
                }

                setItineraries(data || [])
            } catch (err: any) {
                setError(err.message || "Failed to fetch itineraries")
                console.error("Fetch itineraries error:", err)
            } finally {
                setLoading(false)
            }
        }

        fetchAllItineraries()
    }, [user?.email, supabase, filter])

    // Handle publish/unpublish with tags
    const handleTogglePublish = async (itineraryId: number, currentlyPublished: boolean, tags?: string[]) => {
        try {
            const newPublishedState = !currentlyPublished

            // Build update object
            const updateData: { published: boolean; tags?: string[] } = {
                published: newPublishedState,
            }

            // Only update tags if publishing (not unpublishing) and tags are provided
            if (newPublishedState && tags && tags.length > 0) {
                updateData.tags = tags
            }

            // If unpublishing, clear the tags
            if (!newPublishedState) {
                updateData.tags = []
            }

            const { error: updateError } = await supabase
                .from("itineraries")
                .update(updateData)
                .eq("id", itineraryId)

            if (updateError) {
                console.error("Error updating publish status:", updateError)
                toast.error("Failed to update publish status")
                return
            }

            // Update local state
            if (filter === "published" && !newPublishedState) {
                // Remove from list if we're in published view and unpublishing
                setItineraries(prev => prev.filter(itinerary => itinerary.id !== itineraryId))
            } else {
                setItineraries(prev =>
                    prev.map(itinerary =>
                        itinerary.id === itineraryId
                            ? {
                                ...itinerary,
                                published: newPublishedState,
                                tags: newPublishedState ? (tags || []) : []
                              }
                            : itinerary
                    )
                )
            }

            toast.success(newPublishedState ? "Itinerary published!" : "Itinerary unpublished")
        } catch (err: any) {
            console.error("Toggle publish error:", err)
            toast.error("Failed to update publish status")
        }
    }

    // Handle favorite/unfavorite
    const handleToggleFavorite = async (itineraryId: number, currentlyFavorited: boolean) => {
        try {
            const newFavoritedState = !currentlyFavorited

            const { error: updateError } = await supabase
                .from("itineraries")
                .update({ favorites: newFavoritedState })
                .eq("id", itineraryId)

            if (updateError) {
                console.error("Error updating favorite status:", updateError)
                toast.error("Failed to update favorite status")
                return
            }

            // Update local state
            if (filter === "favorites" && !newFavoritedState) {
                // Remove from list if we're in favorites view and unfavoriting
                setItineraries(prev => prev.filter(itinerary => itinerary.id !== itineraryId))
            } else {
                setItineraries(prev =>
                    prev.map(itinerary =>
                        itinerary.id === itineraryId
                            ? { ...itinerary, favorites: newFavoritedState }
                            : itinerary
                    )
                )
            }

            toast.success(newFavoritedState ? "Added to favorites!" : "Removed from favorites")
        } catch (err: any) {
            console.error("Toggle favorite error:", err)
            toast.error("Failed to update favorite status")
        }
    }

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

    const getStopsCount = (stops: any): number => {
        if (!stops) return 0
        if (Array.isArray(stops)) return stops.length
        if (stops.stops && Array.isArray(stops.stops)) return stops.stops.length
        return 0
    }

    const getMapCenter = (stops: any): { lat: number; lng: number } => {
        // Default to Toronto
        const defaultCenter = { lat: 43.6532, lng: -79.3832 }

        if (!stops) return defaultCenter

        // Check if stops has a center property
        if (stops.center?.lat && stops.center?.lng) {
            return { lat: stops.center.lat, lng: stops.center.lng }
        }

        // Try to get coordinates from the first stop
        const stopsArray = Array.isArray(stops) ? stops : stops.stops
        if (stopsArray && stopsArray.length > 0) {
            const firstStop = stopsArray[0]
            if (firstStop.coordinates?.lat && firstStop.coordinates?.lng) {
                return { lat: firstStop.coordinates.lat, lng: firstStop.coordinates.lng }
            }
        }

        return defaultCenter
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

    if (itineraries.length === 0) {
        const emptyMessages = {
            all: {
                title: "No itineraries yet",
                description: "Create your first itinerary in the Chat page!"
            },
            favorites: {
                title: "No favorite itineraries",
                description: "Click the heart icon on any itinerary to add it to your favorites."
            },
            published: {
                title: "No published itineraries",
                description: "Click the globe icon on any itinerary to publish it for others to see."
            }
        }

        return (
            <div className="flex flex-col items-center justify-center h-64 w-full gap-2">
                <p className="text-muted-foreground">{emptyMessages[filter].title}</p>
                <p className="text-sm text-muted-foreground">
                    {emptyMessages[filter].description}
                </p>
            </div>
        )
    }

    return (
        <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {itineraries.map((itinerary) => {
                    const stopsCount = getStopsCount(itinerary.stops)
                    const center = getMapCenter(itinerary.stops)

                    return (
                        <PlanCard
                            key={itinerary.id}
                            title={itinerary.title}
                            createdBy="You"
                            meta={`${stopsCount} stop${stopsCount !== 1 ? 's' : ''} · ${formatDate(itinerary.created_at)}`}
                            isLiked={itinerary.favorites}
                            isPublished={itinerary.published}
                            onClick={() => {
                                setSelectedItinerary(itinerary)
                                setDialogOpen(true)
                            }}
                            onToggleLike={() => handleToggleFavorite(itinerary.id, itinerary.favorites)}
                            onTogglePublish={(tags) => handleTogglePublish(itinerary.id, itinerary.published, tags)}
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
                <DialogContent className="max-w-[900px] w-[95vw] h-[85vh] p-0 flex flex-col overflow-hidden">
                    {/* Header with title - fixed at top */}
                    <div className="px-6 py-4 border-b shrink-0">
                        <DialogTitle className="text-lg font-semibold">{selectedItinerary?.title}</DialogTitle>
                    </div>

                    {/* Tabs - fixed below header */}
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
                        </div>
                    </div>

                    {/* Content area - takes remaining space */}
                    <div className="flex-1 overflow-hidden">
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

                                                                <div className="flex-1 flex flex-col gap-0.5">
                                                                    <div className="flex justify-between items-start gap-2">
                                                                        <h3
                                                                            className="text-md leading-tight text-foreground truncate max-w-[600px]"
                                                                            title={stop.name}
                                                                        >
                                                                            {stop.name}
                                                                        </h3>
                                                                    </div>

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
                                                                                className="leading-tight text-foreground truncate max-w-[600px]"
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
                        ) : (
                            <div className="w-full h-full">
                                <TouringMap
                                    initialLng={selectedItinerary?.stops?.center?.lng || -79.3832}
                                    initialLat={selectedItinerary?.stops?.center?.lat || 43.6532}
                                    initialZoom={12}
                                    itineraryDataProp={selectedItinerary}
                                    isPreview={true}
                                />
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

