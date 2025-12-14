"use client"

import { useEffect, useState } from "react"
import { useSupabase } from "@/hooks/context/supabase-context"
import { Spinner } from "@/components/ui/spinner"
import { TouringMap } from "@/components/touring-map"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MapPin } from "lucide-react"
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
import { Store, Star, Phone } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"

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

export default function ExplorePage() {
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
                // Fetch all published itineraries with user info
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

                // Transform the data to flatten the user object
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

    if (itineraries.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 w-full gap-2">
                <p className="text-muted-foreground">No published itineraries yet</p>
                <p className="text-sm text-muted-foreground">
                    Be the first to share your itinerary with the community!
                </p>
            </div>
        )
    }

    return (
        <>
            <div className="flex flex-col gap-4">
                <h1 className="text-xl font-semibold tracking-tight">Explore</h1>
                <p className="text-sm text-muted-foreground">
                    Discover itineraries shared by the community
                </p>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {itineraries.map((itinerary) => {
                        const stopsCount = getStopsCount(itinerary.stops)
                        const center = getMapCenter(itinerary.stops)

                        return (
                            <div
                                key={itinerary.id}
                                role="button"
                                tabIndex={0}
                                onClick={() => {
                                    setSelectedItinerary(itinerary)
                                    setDialogOpen(true)
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        setSelectedItinerary(itinerary)
                                        setDialogOpen(true)
                                    }
                                }}
                                className="group flex flex-col overflow-hidden rounded-2xl border bg-card/80 shadow-sm transition hover:border-primary/60 hover:shadow-lg cursor-pointer"
                            >
                                {/* Map Thumbnail */}
                                <div className="relative aspect-video w-full overflow-hidden">
                                    <div className="h-full w-full">
                                        <TouringMap
                                            initialLng={center.lng}
                                            initialLat={center.lat}
                                            initialZoom={12}
                                        />
                                    </div>
                                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-black/40 opacity-80" />
                                    <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2 text-[10px] font-medium text-white/90">
                                        <span className="rounded-full bg-black/40 px-2 py-0.5 backdrop-blur">
                                            Map preview
                                        </span>
                                    </div>
                                </div>

                                {/* Card Body */}
                                <div className="flex flex-1 flex-col gap-3 p-4">
                                    {/* User Info */}
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                                {getInitials(itinerary.user.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">{itinerary.user.name}</span>
                                            <span className="text-[10px] text-muted-foreground">
                                                {formatDate(itinerary.created_at)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Title */}
                                    <h3 className="line-clamp-2 text-sm font-semibold leading-snug">
                                        {itinerary.title}
                                    </h3>

                                    {/* Meta Info */}
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <MapPin className="h-3 w-3" />
                                            <span>{stopsCount} stop{stopsCount !== 1 ? 's' : ''}</span>
                                        </div>
                                    </div>

                                    {/* Tags */}
                                    {itinerary.tags && itinerary.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                            {itinerary.tags.slice(0, 3).map((tag, index) => (
                                                <Badge
                                                    key={index}
                                                    variant="secondary"
                                                    className="text-[10px] px-2 py-0"
                                                >
                                                    {tag}
                                                </Badge>
                                            ))}
                                            {itinerary.tags.length > 3 && (
                                                <Badge
                                                    variant="outline"
                                                    className="text-[10px] px-2 py-0"
                                                >
                                                    +{itinerary.tags.length - 3}
                                                </Badge>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Itinerary Detail Dialog */}
            <Dialog open={dialogOpen} onOpenChange={(open) => {
                setDialogOpen(open)
                if (!open) setActiveTab("stops")
            }}>
                <DialogContent className="max-w-[900px] w-[95vw] h-[85vh] p-0 flex flex-col overflow-hidden">
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
                                                                    <h3
                                                                        className="text-md leading-tight text-foreground truncate max-w-[600px]"
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
                                />
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

