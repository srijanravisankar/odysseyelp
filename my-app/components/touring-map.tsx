"use client";

import { useEffect, useRef, useState } from "react";
import { useItinerary } from "@/hooks/context/itinerary-context";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

type TouringMapProps = {
  initialLng?: number;
  initialLat?: number;
  initialZoom?: number;
};

// Map styles
const LIGHT_MAP_STYLE = "mapbox://styles/mapbox/streets-v12";
const DARK_MAP_STYLE = "mapbox://styles/mapbox/navigation-night-v1";

export function TouringMap({
  initialLng = -79.3832, // Toronto-ish
  initialLat = 43.6532,
  initialZoom = 12,
}: TouringMapProps) {
  const outerRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  // Keep track of markers we've added so we can clear them
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  const { itineraryData, selectedStopIds, appTheme } = useItinerary();

  const [viewMode, setViewMode] = useState<"2d" | "3d">("3d");
  const [projection, setProjection] = useState<"globe" | "mercator">("globe");

  // Helper function to create custom marker element with letter
  const createMarkerElement = (letter: string, isSelected: boolean) => {
    const el = document.createElement("div");
    el.className = "custom-marker";
    el.style.width = "32px";
    el.style.height = "32px";
    el.style.borderRadius = "50%";
    el.style.backgroundColor = isSelected ? "#22c55e" : "#ef4444";
    el.style.border = "2px solid white";
    el.style.display = "flex";
    el.style.alignItems = "center";
    el.style.justifyContent = "center";
    el.style.fontWeight = "bold";
    el.style.fontSize = "14px";
    el.style.color = "white";
    el.style.cursor = "pointer";
    el.style.boxShadow = "0 2px 4px rgba(0,0,0,0.3)";
    el.textContent = letter;
    return el;
  };

  // Helper to add 3D buildings (reused for init and theme switch)
  const add3DBuildings = (
    map: mapboxgl.Map,
    theme: "light" | "dark" | "system"
  ) => {
    // 1. Get the style object safely
    const style = map.getStyle();
    if (!style || !style.layers) return;

    const layers = style.layers;

    const labelLayerId = layers.find(
      (layer) =>
        layer.type === "symbol" && (layer.layout as any)?.["text-field"]
    )?.id;

    // Check if layer already exists to avoid errors
    if (map.getLayer("3d-buildings")) return;

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
            // Darker buildings for dark mode, lighter for light mode
            "fill-extrusion-color": theme === "dark" ? "#444" : "#aaa",
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
      );
    }
  };

  // 1. Initialize Map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Determine initial style
    const initialStyle = appTheme === "dark" ? DARK_MAP_STYLE : LIGHT_MAP_STYLE;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: initialStyle,
      center: [initialLng, initialLat],
      zoom: initialZoom,
      pitch: 60, // start in 3D
      bearing: -20,
      antialias: true,
      projection: "globe", // default for v12
    });

    mapRef.current = map;
    setViewMode("3d");
    setProjection("globe");

    map.on("load", () => {
      add3DBuildings(map, appTheme);
    });

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, [initialLng, initialLat, initialZoom]); // Run once on mount

  // 2. Handle Theme Changes (Switch Style)
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    const targetStyle = appTheme === "dark" ? DARK_MAP_STYLE : LIGHT_MAP_STYLE;

    try {
      map.setStyle(targetStyle);
    } catch (e) {
      console.error("Error setting map style:", e);
    }

    // setStyle removes all layers. We wait for 'style.load' to add 3D buildings back.
    map.once("style.load", () => {
      add3DBuildings(map, appTheme);
      map.setProjection(projection);
    });
  }, [appTheme, projection]);

  // 6. Draw Route Between All Stops
  useEffect(() => {
    if (!mapRef.current) return;
    if (!itineraryData?.stops?.stops || itineraryData.stops.stops.length < 2) {
      // Remove route if less than 2 stops
      const map = mapRef.current;
      if (map.getLayer("route-layer")) {
        map.removeLayer("route-layer");
      }
      if (map.getSource("route-source")) {
        map.removeSource("route-source");
      }
      return;
    }

    const map = mapRef.current;
    const stops = itineraryData.stops.stops;

    // Build coordinate string for Mapbox Directions API
    const coordinates = stops
      .filter((stop: any) => stop.coordinates?.lat && stop.coordinates?.lng)
      .map((stop: any) => `${stop.coordinates.lng},${stop.coordinates.lat}`)
      .join(";");

    if (!coordinates) return;

    // Fetch route from Mapbox Directions API
    const fetchRoute = async () => {
      try {
        const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
        const response = await fetch(
          `https://api.mapbox.com/directions/v5/mapbox/walking/${coordinates}?geometries=geojson&access_token=${token}`
        );
        const data = await response.json();

        if (data.routes && data.routes[0]) {
          const routeGeoJSON = data.routes[0].geometry;

          // Add or update route layer
          if (map.getSource("route-source")) {
            (map.getSource("route-source") as mapboxgl.GeoJSONSource).setData(routeGeoJSON);
          } else {
            map.addSource("route-source", {
              type: "geojson",
              data: routeGeoJSON,
            });
          }

          if (!map.getLayer("route-layer")) {
            map.addLayer({
              id: "route-layer",
              type: "line",
              source: "route-source",
              layout: {
                "line-join": "round",
                "line-cap": "round",
              },
              paint: {
                "line-color": "#3b82f6",
                "line-width": 4,
                "line-opacity": 0.75,
              },
            });
          }
        }
      } catch (error) {
        console.error("Error fetching route:", error);
      }
    };

    // Wait for map to be ready
    if (map.isStyleLoaded()) {
      fetchRoute();
    } else {
      map.once("style.load", fetchRoute);
    }
  }, [itineraryData?.stops?.stops]);

  // 3. Handle Resizing (Fix for Sidebar toggle)
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      if (mapRef.current) {
        mapRef.current.resize();
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  // 4. Update Center
  useEffect(() => {
    if (!mapRef.current || !itineraryData?.stops?.center) return;

    const { lat, lng } = itineraryData.stops.center;
    if (typeof lat !== "number" || typeof lng !== "number") return;

    mapRef.current.setCenter([lng, lat]);
  }, [itineraryData?.stops?.center?.lat, itineraryData?.stops?.center?.lng]);

  // 5. Update Markers - Show all stops with alphabetic labels
  useEffect(() => {
    if (!mapRef.current) return;
    if (!itineraryData?.stops?.stops) return;

    const map = mapRef.current;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    const bounds = new mapboxgl.LngLatBounds();

    itineraryData.stops.stops.forEach((stop: any, index: number) => {
      const stopId = stop.id ?? String(index);
      const lat = stop.coordinates?.lat;
      const lng = stop.coordinates?.lng;

      if (typeof lat !== "number" || typeof lng !== "number") return;

      // Create alphabetic label (A, B, C, etc.)
      const letter = String.fromCharCode(65 + index);
      const isSelected = selectedStopIds.includes(stopId);

      // Create custom marker element
      const markerElement = createMarkerElement(letter, isSelected);

      const marker = new mapboxgl.Marker({ element: markerElement })
        .setLngLat([lng, lat])
        .addTo(map);

      markersRef.current.push(marker);
      bounds.extend([lng, lat]);
    });

    // Fit bounds to show all markers
    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, {
        padding: 80,
        duration: 800,
        maxZoom: 14,
      });
    }
  }, [itineraryData?.stops?.stops, selectedStopIds]);

  // --- handlers ---

  const switchTo2D = () => {
    if (!mapRef.current) return;
    setViewMode("2d");
    mapRef.current.easeTo({
      pitch: 0,
      bearing: 0,
      duration: 800,
    });
  };

  const switchTo3D = () => {
    if (!mapRef.current) return;
    setViewMode("3d");
    mapRef.current.easeTo({
      pitch: 60,
      bearing: -20,
      duration: 800,
      offset: [0, -100],
    });
  };

  const setProj = (proj: "globe" | "mercator") => {
    if (!mapRef.current) return;
    setProjection(proj);
    mapRef.current.setProjection(proj);
  };

  return (
    <div ref={outerRef} className="absolute inset-0 h-full w-full">
      {/* Map canvas */}
      <div ref={containerRef} className="h-full w-full" />

      {/* Controls overlay - now horizontal */}
      <div className="pointer-events-auto absolute right-3 top-3 flex items-center gap-2 rounded-md bg-background/50 p-1 text-xs shadow">
        {/* 2D / 3D */}
        <div className="flex gap-1">
          <button
            onClick={switchTo2D}
            className={`rounded cursor-pointer px-2 py-1 ${
              viewMode === "2d"
                ? "bg-primary text-primary-foreground"
                : "bg-muted"
            }`}
          >
            2D
          </button>
          <button
            onClick={switchTo3D}
            className={`rounded cursor-pointer px-2 py-1 ${
              viewMode === "3d"
                ? "bg-primary text-primary-foreground"
                : "bg-muted"
            }`}
          >
            3D
          </button>
        </div>

        {/* Globe / Flat */}
        <div className="flex gap-1">
          <button
            onClick={() => setProj("globe")}
            className={`rounded cursor-pointer px-2 py-1 ${
              projection === "globe"
                ? "bg-primary text-primary-foreground"
                : "bg-muted"
            }`}
          >
            Globe
          </button>
          <button
            onClick={() => setProj("mercator")}
            className={`rounded cursor-pointer px-2 py-1 ${
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
  );
}
