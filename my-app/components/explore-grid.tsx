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
import { FilterOptions } from "@/hooks/context/explore-context"

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
}

type SortOption = "newest" | "oldest" | "most-stops"

type ExploreGridProps = {
    searchQuery?: string
    sortBy?: SortOption
    filters?: FilterOptions
}

export function ExploreGrid({
    searchQuery = "",
    sortBy = "newest",
    filters = {
        tags: [],
        cities: [],
        priceRanges: [],
        categories: [],
        stopCounts: [],
        dateRange: null,
    }
}: ExploreGridProps) {
    const supabase = useSupabase()
    const [itineraries, setItineraries] = useState<PublishedItinerary[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [selectedItinerary, setSelectedItinerary] = useState<PublishedItinerary | null>(null)
    const [activeTab, setActiveTab] = useState<"stops" | "map">("stops")

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
                    user: item.user || { name: "Unknown", email: "" }
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

    // Enhanced filtering logic with all filter types
    const filteredAndSortedItineraries = useMemo(() => {
        let result = [...itineraries]

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim()
            result = result.filter((itinerary) => {
                const titleMatch = itinerary.title.toLowerCase().includes(query)
                const userNameMatch = itinerary.user?.name?.toLowerCase().includes(query)
                const tagsMatch = itinerary.tags?.some(tag =>
                    tag.toLowerCase().includes(query)
                )
                return titleMatch || userNameMatch || tagsMatch
            })
        }

        // Apply tag filter
        if (filters.tags.length > 0) {
            result = result.filter((itinerary) => {
                return filters.tags.every(filterTag =>
                    itinerary.tags?.some(tag =>
                        tag.toLowerCase() === filterTag.toLowerCase()
                    )
                )
            })
        }

        // Apply category filter
        if (filters.categories.length > 0) {
            result = result.filter((itinerary) => {
                const stops = itinerary.stops?.stops || []
                return stops.some((stop: any) =>
                    filters.categories.some(filterCat =>
                        stop.category?.toLowerCase().includes(filterCat.toLowerCase())
                    )
                )
            })
        }

        // Apply price range filter
        if (filters.priceRanges.length > 0) {
            result = result.filter((itinerary) => {
                const stops = itinerary.stops?.stops || []
                return stops.some((stop: any) =>
                    stop.price && filters.priceRanges.includes(stop.price)
                )
            })
        }


        // Apply date range filter, here is the comment
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
        }

        return result
    }, [itineraries, searchQuery, sortBy, filters])

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
        const message = searchQuery || filters.tags.length > 0 || filters.priceRanges.length > 0 || filters.categories.length > 0 || filters.dateRange
            ? "No itineraries match your search"
            : "No published itineraries yet"
        const description = searchQuery || filters.tags.length > 0 || filters.priceRanges.length > 0 || filters.categories.length > 0 || filters.dateRange
            ? "Try adjusting your search or filters"
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
                            onClick={() => {
                                setSelectedItinerary(itinerary)
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

