"use client"

import { useEffect, useRef, useState } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ""

type TouringMapProps = {
    initialLng?: number
    initialLat?: number
    initialZoom?: number
}

export function TouringMap({
                               initialLng = -79.3832,  // Toronto-ish
                               initialLat = 43.6532,
                               initialZoom = 12,
                           }: TouringMapProps) {
    const outerRef = useRef<HTMLDivElement | null>(null)
    const containerRef = useRef<HTMLDivElement | null>(null)
    const mapRef = useRef<mapboxgl.Map | null>(null)

    const [viewMode, setViewMode] = useState<"2d" | "3d">("3d")
    const [projection, setProjection] = useState<"globe" | "mercator">("globe")

    useEffect(() => {
        if (!containerRef.current || mapRef.current) return

        const map = new mapboxgl.Map({
            container: containerRef.current,
            style: "mapbox://styles/mapbox/streets-v12", // has roads + POIs, globe by default :contentReference[oaicite:0]{index=0}
            center: [initialLng, initialLat],
            zoom: initialZoom,
            pitch: 60,   // start in 3D
            bearing: -20,
            antialias: true,
            projection: "globe", // explicit, matches v12 default :contentReference[oaicite:1]{index=1}
        })

        mapRef.current = map
        setViewMode("3d")
        setProjection("globe")

        map.on("load", () => {
            // 3D buildings layer (from Mapbox example) :contentReference[oaicite:2]{index=2}
            const layers = map.getStyle().layers
            if (!layers) return

            const labelLayerId = layers.find(
                (layer) =>
                    layer.type === "symbol" &&
                    (layer.layout as any)?.["text-field"]
            )?.id

            if (labelLayerId) {
                map.addLayer(
                    {
                        id: "3d-buildings",
                        source: "composite",
                        "source-layer": "building",
                        filter: ["==", "extrude", "true"],
                        type: "fill-extrusion",
                        minzoom: 15,
                        paint: {
                            "fill-extrusion-color": "#aaa",
                            "fill-extrusion-height": [
                                "interpolate",
                                ["linear"],
                                ["zoom"],
                                15,
                                0,
                                15.05,
                                ["get", "height"],
                            ],
                            "fill-extrusion-base": [
                                "interpolate",
                                ["linear"],
                                ["zoom"],
                                15,
                                0,
                                15.05,
                                ["get", "min_height"],
                            ],
                            "fill-extrusion-opacity": 0.6,
                        },
                    },
                    labelLayerId
                )
            }
        })

        return () => {
            map.remove()
            mapRef.current = null
        }
    }, [initialLng, initialLat, initialZoom])

    // --- handlers ---

    const switchTo2D = () => {
        if (!mapRef.current) return
        setViewMode("2d")
        mapRef.current.easeTo({
            pitch: 0,
            bearing: 0,
            duration: 800,
        })
    }

    const switchTo3D = () => {
        if (!mapRef.current) return
        setViewMode("3d")
        mapRef.current.easeTo({
            pitch: 60,
            bearing: -20,
            duration: 800,
            // small upward offset so the scene feels more visually centered
            offset: [0, -100],
        })
    }

    const setProj = (proj: "globe" | "mercator") => {
        if (!mapRef.current) return
        setProjection(proj)
        // Mapbox GL lets you change projection at runtime with setProjection :contentReference[oaicite:3]{index=3}
        mapRef.current.setProjection(proj)
    }

    return (
        <div ref={outerRef} className="absolute inset-0 w-full h-full">
            {/* Map canvas */}
            <div ref={containerRef} className="w-full h-full" />

            {/* Controls overlay */}
            <div className="pointer-events-auto absolute right-3 top-3 flex flex-col gap-2 rounded-md bg-background/80 p-2 text-xs shadow">
                <div className="flex gap-1">
                    <button
                        onClick={switchTo2D}
                        className={`rounded px-2 py-1 ${
                            viewMode === "2d"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                        }`}
                    >
                        2D
                    </button>
                    <button
                        onClick={switchTo3D}
                        className={`rounded px-2 py-1 ${
                            viewMode === "3d"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                        }`}
                    >
                        3D
                    </button>
                </div>

                <div className="flex gap-1">
                    <button
                        onClick={() => setProj("globe")}
                        className={`rounded px-2 py-1 ${
                            projection === "globe"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                        }`}
                    >
                        Globe
                    </button>
                    <button
                        onClick={() => setProj("mercator")}
                        className={`rounded px-2 py-1 ${
                            projection === "mercator"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                        }`}
                    >
                        Flat
                    </button>
                </div>
            </div>
        </div>
    )
}
