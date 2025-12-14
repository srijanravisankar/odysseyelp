"use client"

import { useEffect, useState } from "react"
import { PlanCard } from "@/components/plan-card"
import { TouringMap } from "@/components/touring-map"
import { useSupabase } from "@/hooks/context/supabase-context"
import { useUser } from "@/hooks/context/user-context"
import { Spinner } from "@/components/ui/spinner"
import { Itinerary } from "@/hooks/context/itinerary-context"

export function AllItinerariesGrid() {
    const supabase = useSupabase()
    const { user } = useUser()
    const [itineraries, setItineraries] = useState<Itinerary[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

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

                const { data, error: queryError } = await supabase
                    .from("itineraries")
                    .select("*")
                    .eq("user_id", authData.user.id)
                    .order("created_at", { ascending: false })

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
    }, [user?.email, supabase])

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
        return (
            <div className="flex flex-col items-center justify-center h-64 w-full gap-2">
                <p className="text-muted-foreground">No itineraries yet</p>
                <p className="text-sm text-muted-foreground">
                    Create your first itinerary in the Chat page!
                </p>
            </div>
        )
    }

    return (
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
                        isLiked={false}
                        isPublished={false}
                        onClick={() => console.log("Open itinerary", itinerary.id)}
                        onToggleLike={() => console.log("Toggle like", itinerary.id)}
                        onTogglePublish={() => console.log("Toggle publish", itinerary.id)}
                        thumbnail={
                            <TouringMap
                                initialLng={center.lng}
                                initialLat={center.lat}
                                initialZoom={12}
                            />
                        }
                    />
                )
            })}
        </div>
    )
}

