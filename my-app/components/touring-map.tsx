"use client"

import { useEffect, useRef } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ""

type TouringMapProps = {
    initialLng?: number
    initialLat?: number
    initialZoom?: number
}

export function TouringMap({
                               initialLng = -79.3832,  // Toronto-ish for now, change as you like
                               initialLat = 43.6532,
                               initialZoom = 10,
                           }: TouringMapProps) {
    const containerRef = useRef<HTMLDivElement | null>(null)
    const mapRef = useRef<mapboxgl.Map | null>(null)

    useEffect(() => {
        // Avoid re-initializing the map if it already exists
        if (!containerRef.current || mapRef.current) return

        mapRef.current = new mapboxgl.Map({
            container: containerRef.current,
            style: "mapbox://styles/mapbox/streets-v12",
            center: [initialLng, initialLat],
            zoom: initialZoom,
        })

        // Basic zoom / rotate controls
        mapRef.current.addControl(new mapboxgl.NavigationControl(), "top-right")

        // Cleanup on unmount
        return () => {
            mapRef.current?.remove()
            mapRef.current = null
        }
    }, [initialLng, initialLat, initialZoom])

    return <div ref={containerRef} className="w-full h-full" />
}
