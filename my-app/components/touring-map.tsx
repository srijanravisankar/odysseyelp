// // "use client";

// // import { useEffect, useRef, useState } from "react";
// // import { useItinerary } from "@/components/chat-page/itinerary-context";
// // import mapboxgl from "mapbox-gl";
// // import "mapbox-gl/dist/mapbox-gl.css";

// // mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

// // type TouringMapProps = {
// //   initialLng?: number;
// //   initialLat?: number;
// //   initialZoom?: number;
// // };

// // // Map styles
// // const LIGHT_MAP_STYLE = "mapbox://styles/mapbox/streets-v12";
// // const DARK_MAP_STYLE = "mapbox://styles/mapbox/navigation-night-v1";

// // export function TouringMap({
// //   initialLng = -79.3832, // Toronto-ish
// //   initialLat = 43.6532,
// //   initialZoom = 12,
// // }: TouringMapProps) {
// //   const outerRef = useRef<HTMLDivElement | null>(null);
// //   const containerRef = useRef<HTMLDivElement | null>(null);
// //   const mapRef = useRef<mapboxgl.Map | null>(null);

// //   // Keep track of markers we’ve added so we can clear them
// //   const markersRef = useRef<mapboxgl.Marker[]>([]);

// //   // Access itinerary + selected stops + theme from context
// //   const { itineraryData, selectedStopIds, appTheme } = useItinerary();

// //   const [viewMode, setViewMode] = useState<"2d" | "3d">("3d");
// //   const [projection, setProjection] = useState<"globe" | "mercator">("globe");

// //   // Helper to add 3D buildings (reused for init and theme switch)
// //   const add3DBuildings = (
// //     map: mapboxgl.Map,
// //     theme: "light" | "dark" | "system"
// //   ) => {
// //     // Safety check: ensure style is loaded before accessing layers
// //     if (!map.isStyleLoaded()) return;

// //     const layers = map.getStyle().layers;
// //     if (!layers) return;

// //     const labelLayerId = layers.find(
// //       (layer) =>
// //         layer.type === "symbol" && (layer.layout as any)?.["text-field"]
// //     )?.id;

// //     // Check if layer already exists to avoid errors
// //     if (map.getLayer("3d-buildings")) return;

// //     if (labelLayerId) {
// //       map.addLayer(
// //         {
// //           id: "3d-buildings",
// //           source: "composite",
// //           "source-layer": "building",
// //           filter: ["==", "extrude", "true"],
// //           type: "fill-extrusion",
// //           minzoom: 15,
// //           paint: {
// //             // Darker buildings for dark mode, lighter for light mode
// //             "fill-extrusion-color": theme === "dark" ? "#444" : "#aaa",
// //             "fill-extrusion-height": [
// //               "interpolate",
// //               ["linear"],
// //               ["zoom"],
// //               15,
// //               0,
// //               15.05,
// //               ["get", "height"],
// //             ],
// //             "fill-extrusion-base": [
// //               "interpolate",
// //               ["linear"],
// //               ["zoom"],
// //               15,
// //               0,
// //               15.05,
// //               ["get", "min_height"],
// //             ],
// //             "fill-extrusion-opacity": 0.6,
// //           },
// //         },
// //         labelLayerId
// //       );
// //     }
// //   };

// //   // 1. Initialize Map
// //   useEffect(() => {
// //     if (!containerRef.current || mapRef.current) return;

// //     // Determine initial style
// //     const initialStyle = appTheme === "dark" ? DARK_MAP_STYLE : LIGHT_MAP_STYLE;

// //     const map = new mapboxgl.Map({
// //       container: containerRef.current,
// //       style: initialStyle,
// //       center: [initialLng, initialLat],
// //       zoom: initialZoom,
// //       pitch: 60, // start in 3D
// //       bearing: -20,
// //       antialias: true,
// //       projection: "globe", // default for v12
// //     });

// //     mapRef.current = map;
// //     setViewMode("3d");
// //     setProjection("globe");

// //     map.on("load", () => {
// //       add3DBuildings(map, appTheme);
// //     });

// //     return () => {
// //       markersRef.current.forEach((marker) => marker.remove());
// //       markersRef.current = [];
// //       map.remove();
// //       mapRef.current = null;
// //     };
// //   }, [initialLng, initialLat, initialZoom]); // Run once on mount

// //   // 2. Handle Theme Changes (Switch Style)
// //   useEffect(() => {
// //     if (!mapRef.current) return;
// //     const map = mapRef.current;

// //     const targetStyle = appTheme === "dark" ? DARK_MAP_STYLE : LIGHT_MAP_STYLE;

// //     // Only update if the style has actually changed
// //     // We check if the style is loaded first to avoid errors,
// //     // but map.setStyle is generally safe to call.
// //     // However, we removed the crashing 'map.getStyle()' call here.

// //     try {
// //       map.setStyle(targetStyle);
// //     } catch (e) {
// //       console.error("Error setting map style:", e);
// //     }

// //     // setStyle removes all layers. We wait for 'style.load' to add 3D buildings back.
// //     map.once("style.load", () => {
// //       add3DBuildings(map, appTheme);
// //       // Ensure projection is maintained
// //       map.setProjection(projection);
// //     });
// //   }, [appTheme]);

// //   // 3. Handle Resizing (Fix for Sidebar toggle)
// //   useEffect(() => {
// //     if (!containerRef.current) return;

// //     const resizeObserver = new ResizeObserver(() => {
// //       if (mapRef.current) {
// //         mapRef.current.resize();
// //       }
// //     });

// //     resizeObserver.observe(containerRef.current);

// //     return () => resizeObserver.disconnect();
// //   }, []);

// //   // 4. Update Center
// //   useEffect(() => {
// //     if (!mapRef.current || !itineraryData?.center) return;

// //     const { lat, lng } = itineraryData.center;
// //     if (typeof lat !== "number" || typeof lng !== "number") return;

// //     mapRef.current.setCenter([lng, lat]);
// //   }, [itineraryData?.center?.lat, itineraryData?.center?.lng]);

// //   // 5. Update Markers
// //   useEffect(() => {
// //     if (!mapRef.current) return;
// //     if (!itineraryData?.stops) return;

// //     const map = mapRef.current;

// //     // Clear existing markers
// //     markersRef.current.forEach((marker) => marker.remove());
// //     markersRef.current = [];

// //     // Only show markers for selected stops
// //     if (selectedStopIds.length === 0) {
// //       return;
// //     }

// //     const bounds = new mapboxgl.LngLatBounds();

// //     itineraryData.stops.forEach((stop: any, index: number) => {
// //       const stopId = stop.id ?? String(index);
// //       if (!selectedStopIds.includes(stopId)) return;

// //       const lat = stop.coordinates?.lat;
// //       const lng = stop.coordinates?.lng;

// //       if (typeof lat !== "number" || typeof lng !== "number") return;

// //       const marker = new mapboxgl.Marker({ color: "#22c55e" })
// //         .setLngLat([lng, lat])
// //         .addTo(map);

// //       markersRef.current.push(marker);
// //       bounds.extend([lng, lat]);
// //     });

// //     // Zoom/fit to the selected markers
// //     if (!bounds.isEmpty()) {
// //       map.fitBounds(bounds, {
// //         padding: 80,
// //         duration: 800,
// //         maxZoom: 14,
// //       });
// //     }
// //   }, [itineraryData, selectedStopIds]);

// //   // --- handlers ---

// //   const switchTo2D = () => {
// //     if (!mapRef.current) return;
// //     setViewMode("2d");
// //     mapRef.current.easeTo({
// //       pitch: 0,
// //       bearing: 0,
// //       duration: 800,
// //     });
// //   };

// //   const switchTo3D = () => {
// //     if (!mapRef.current) return;
// //     setViewMode("3d");
// //     mapRef.current.easeTo({
// //       pitch: 60,
// //       bearing: -20,
// //       duration: 800,
// //       offset: [0, -100],
// //     });
// //   };

// //   const setProj = (proj: "globe" | "mercator") => {
// //     if (!mapRef.current) return;
// //     setProjection(proj);
// //     mapRef.current.setProjection(proj);
// //   };

// //   return (
// //     <div ref={outerRef} className="absolute inset-0 h-full w-full">
// //       {/* Map canvas */}
// //       <div ref={containerRef} className="h-full w-full" />

// //       {/* Controls overlay - now horizontal */}
// //       <div className="pointer-events-auto absolute right-3 top-3 flex items-center gap-2 rounded-md bg-background/50 p-1 text-xs shadow">
// //         {/* 2D / 3D */}
// //         <div className="flex gap-1">
// //           <button
// //             onClick={switchTo2D}
// //             className={`rounded cursor-pointer px-2 py-1 ${
// //               viewMode === "2d"
// //                 ? "bg-primary text-primary-foreground"
// //                 : "bg-muted"
// //             }`}
// //           >
// //             2D
// //           </button>
// //           <button
// //             onClick={switchTo3D}
// //             className={`rounded cursor-pointer px-2 py-1 ${
// //               viewMode === "3d"
// //                 ? "bg-primary text-primary-foreground"
// //                 : "bg-muted"
// //             }`}
// //           >
// //             3D
// //           </button>
// //         </div>

// //         {/* Globe / Flat */}
// //         <div className="flex gap-1">
// //           <button
// //             onClick={() => setProj("globe")}
// //             className={`rounded cursor-pointer px-2 py-1 ${
// //               projection === "globe"
// //                 ? "bg-primary text-primary-foreground"
// //                 : "bg-muted"
// //             }`}
// //           >
// //             Globe
// //           </button>
// //           <button
// //             onClick={() => setProj("mercator")}
// //             className={`rounded cursor-pointer px-2 py-1 ${
// //               projection === "mercator"
// //                 ? "bg-primary text-primary-foreground"
// //                 : "bg-muted"
// //             }`}
// //           >
// //             Flat
// //           </button>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// "use client";

// import { useEffect, useRef, useState } from "react";
// import { useItinerary } from "@/components/chat-page/itinerary-context";
// import mapboxgl from "mapbox-gl";
// import "mapbox-gl/dist/mapbox-gl.css";

// mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

// type TouringMapProps = {
//   initialLng?: number;
//   initialLat?: number;
//   initialZoom?: number;
// };

// // Map styles
// const LIGHT_MAP_STYLE = "mapbox://styles/mapbox/streets-v12";
// const DARK_MAP_STYLE = "mapbox://styles/mapbox/navigation-night-v1";

// export function TouringMap({
//   initialLng = -79.3832, // Toronto-ish
//   initialLat = 43.6532,
//   initialZoom = 12,
// }: TouringMapProps) {
//   const outerRef = useRef<HTMLDivElement | null>(null);
//   const containerRef = useRef<HTMLDivElement | null>(null);
//   const mapRef = useRef<mapboxgl.Map | null>(null);

//   // Keep track of markers we’ve added so we can clear them
//   const markersRef = useRef<mapboxgl.Marker[]>([]);

//   // Access itinerary + selected stops + theme from context
//   const { itineraryData, selectedStopIds, appTheme } = useItinerary();

//   const [viewMode, setViewMode] = useState<"2d" | "3d">("3d");
//   const [projection, setProjection] = useState<"globe" | "mercator">("globe");

//   // Helper to add 3D buildings (reused for init and theme switch)
//   const add3DBuildings = (
//     map: mapboxgl.Map,
//     theme: "light" | "dark" | "system"
//   ) => {
//     // 1. Get the style object safely
//     const style = map.getStyle();
//     if (!style || !style.layers) return;

//     const layers = style.layers;

//     const labelLayerId = layers.find(
//       (layer) =>
//         layer.type === "symbol" && (layer.layout as any)?.["text-field"]
//     )?.id;

//     // Check if layer already exists to avoid errors
//     if (map.getLayer("3d-buildings")) return;

//     if (labelLayerId) {
//       map.addLayer(
//         {
//           id: "3d-buildings",
//           source: "composite",
//           "source-layer": "building",
//           filter: ["==", "extrude", "true"],
//           type: "fill-extrusion",
//           minzoom: 15,
//           paint: {
//             // Darker buildings for dark mode, lighter for light mode
//             "fill-extrusion-color": theme === "dark" ? "#444" : "#aaa",
//             "fill-extrusion-height": [
//               "interpolate",
//               ["linear"],
//               ["zoom"],
//               15,
//               0,
//               15.05,
//               ["get", "height"],
//             ],
//             "fill-extrusion-base": [
//               "interpolate",
//               ["linear"],
//               ["zoom"],
//               15,
//               0,
//               15.05,
//               ["get", "min_height"],
//             ],
//             "fill-extrusion-opacity": 0.6,
//           },
//         },
//         labelLayerId
//       );
//     }
//   };

//   // 1. Initialize Map
//   useEffect(() => {
//     if (!containerRef.current || mapRef.current) return;

//     // Determine initial style
//     const initialStyle = appTheme === "dark" ? DARK_MAP_STYLE : LIGHT_MAP_STYLE;

//     const map = new mapboxgl.Map({
//       container: containerRef.current,
//       style: initialStyle,
//       center: [initialLng, initialLat],
//       zoom: initialZoom,
//       pitch: 60, // start in 3D
//       bearing: -20,
//       antialias: true,
//       projection: "globe", // default for v12
//     });

//     mapRef.current = map;
//     setViewMode("3d");
//     setProjection("globe");

//     map.on("load", () => {
//       add3DBuildings(map, appTheme);
//     });

//     return () => {
//       markersRef.current.forEach((marker) => marker.remove());
//       markersRef.current = [];
//       map.remove();
//       mapRef.current = null;
//     };
//   }, [initialLng, initialLat, initialZoom]); // Run once on mount

//   // 2. Handle Theme Changes (Switch Style)
//   useEffect(() => {
//     if (!mapRef.current) return;
//     const map = mapRef.current;

//     const targetStyle = appTheme === "dark" ? DARK_MAP_STYLE : LIGHT_MAP_STYLE;

//     // Avoid switching if already on the correct style to prevent reload flash
//     // (Optional optimization, but map.setStyle handles it reasonably well)
//     try {
//       map.setStyle(targetStyle);
//     } catch (e) {
//       console.error("Error setting map style:", e);
//     }

//     // setStyle removes all layers. We wait for 'style.load' to add 3D buildings back.
//     map.once("style.load", () => {
//       add3DBuildings(map, appTheme);
//       // Ensure projection is maintained
//       map.setProjection(projection);
//     });
//   }, [appTheme]);

//   // 3. Handle Resizing (Fix for Sidebar toggle)
//   useEffect(() => {
//     if (!containerRef.current) return;

//     const resizeObserver = new ResizeObserver(() => {
//       if (mapRef.current) {
//         mapRef.current.resize();
//       }
//     });

//     resizeObserver.observe(containerRef.current);

//     return () => resizeObserver.disconnect();
//   }, []);

//   // 4. Update Center
//   useEffect(() => {
//     if (!mapRef.current || !itineraryData?.center) return;

//     const { lat, lng } = itineraryData.center;
//     if (typeof lat !== "number" || typeof lng !== "number") return;

//     mapRef.current.setCenter([lng, lat]);
//   }, [itineraryData?.center?.lat, itineraryData?.center?.lng]);

//   // 5. Update Markers
//   useEffect(() => {
//     if (!mapRef.current) return;
//     if (!itineraryData?.stops) return;

//     const map = mapRef.current;

//     // Clear existing markers
//     markersRef.current.forEach((marker) => marker.remove());
//     markersRef.current = [];

//     // Only show markers for selected stops
//     if (selectedStopIds.length === 0) {
//       return;
//     }

//     const bounds = new mapboxgl.LngLatBounds();

//     itineraryData.stops.forEach((stop: any, index: number) => {
//       const stopId = stop.id ?? String(index);
//       if (!selectedStopIds.includes(stopId)) return;

//       const lat = stop.coordinates?.lat;
//       const lng = stop.coordinates?.lng;

//       if (typeof lat !== "number" || typeof lng !== "number") return;

//       const marker = new mapboxgl.Marker({ color: "#22c55e" })
//         .setLngLat([lng, lat])
//         .addTo(map);

//       markersRef.current.push(marker);
//       bounds.extend([lng, lat]);
//     });

//     // Zoom/fit to the selected markers
//     if (!bounds.isEmpty()) {
//       map.fitBounds(bounds, {
//         padding: 80,
//         duration: 800,
//         maxZoom: 14,
//       });
//     }
//   }, [itineraryData, selectedStopIds]);

//   // --- handlers ---

//   const switchTo2D = () => {
//     if (!mapRef.current) return;
//     setViewMode("2d");
//     mapRef.current.easeTo({
//       pitch: 0,
//       bearing: 0,
//       duration: 800,
//     });
//   };

//   const switchTo3D = () => {
//     if (!mapRef.current) return;
//     setViewMode("3d");
//     mapRef.current.easeTo({
//       pitch: 60,
//       bearing: -20,
//       duration: 800,
//       offset: [0, -100],
//     });
//   };

//   const setProj = (proj: "globe" | "mercator") => {
//     if (!mapRef.current) return;
//     setProjection(proj);
//     mapRef.current.setProjection(proj);
//   };

//   return (
//     <div ref={outerRef} className="absolute inset-0 h-full w-full">
//       {/* Map canvas */}
//       <div ref={containerRef} className="h-full w-full" />

//       {/* Controls overlay - now horizontal */}
//       <div className="pointer-events-auto absolute right-3 top-3 flex items-center gap-2 rounded-md bg-background/50 p-1 text-xs shadow">
//         {/* 2D / 3D */}
//         <div className="flex gap-1">
//           <button
//             onClick={switchTo2D}
//             className={`rounded cursor-pointer px-2 py-1 ${
//               viewMode === "2d"
//                 ? "bg-primary text-primary-foreground"
//                 : "bg-muted"
//             }`}
//           >
//             2D
//           </button>
//           <button
//             onClick={switchTo3D}
//             className={`rounded cursor-pointer px-2 py-1 ${
//               viewMode === "3d"
//                 ? "bg-primary text-primary-foreground"
//                 : "bg-muted"
//             }`}
//           >
//             3D
//           </button>
//         </div>

//         {/* Globe / Flat */}
//         <div className="flex gap-1">
//           <button
//             onClick={() => setProj("globe")}
//             className={`rounded cursor-pointer px-2 py-1 ${
//               projection === "globe"
//                 ? "bg-primary text-primary-foreground"
//                 : "bg-muted"
//             }`}
//           >
//             Globe
//           </button>
//           <button
//             onClick={() => setProj("mercator")}
//             className={`rounded cursor-pointer px-2 py-1 ${
//               projection === "mercator"
//                 ? "bg-primary text-primary-foreground"
//                 : "bg-muted"
//             }`}
//           >
//             Flat
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

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

  // Keep track of markers we’ve added so we can clear them
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  // 🔑 Access routeGeoJSON from context
  const { itineraryData, selectedStopIds, appTheme, routeGeoJSON } =
    useItinerary();

  const [viewMode, setViewMode] = useState<"2d" | "3d">("3d");
  const [projection, setProjection] = useState<"globe" | "mercator">("globe");

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

      // 🔑 Re-add the route layer if it exists (since setStyle clears layers)
      // We trigger this by just setting the routeGeoJSON again or relying on React to re-run the effect below?
      // Actually, relying on the separate useEffect below is safer, but we need to make sure it fires.
      // The easiest hack is to force the route effect to run, but standard React deps handle this
      // ONLY IF the component re-renders or deps change.
      // Ideally, we re-add the route inside THIS callback too, OR we simply let the
      // user click "Find Route" again.
      // A better UX: check if we have routeGeoJSON and add it back right here:
      if (routeGeoJSON) {
        addRouteLayer(map, routeGeoJSON);
      }
    });
  }, [appTheme]); // eslint-disable-line react-hooks/exhaustive-deps

  // Helper to add route layer
  const addRouteLayer = (map: mapboxgl.Map, geojson: any) => {
    const sourceId = "optimized-route-source";
    const layerId = "optimized-route-layer";

    if (map.getSource(sourceId)) {
      // Update data if source exists
      (map.getSource(sourceId) as mapboxgl.GeoJSONSource).setData(geojson);
    } else {
      map.addSource(sourceId, {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: geojson,
        },
      });
    }

    if (!map.getLayer(layerId)) {
      map.addLayer({
        id: layerId,
        type: "line",
        source: sourceId,
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#3b82f6", // Blue color
          "line-width": 5,
          "line-opacity": 0.8,
        },
      });
    }
  };

  // 🔑 6. Draw Route Line (New Effect)
  useEffect(() => {
    if (!mapRef.current || !routeGeoJSON) return;
    const map = mapRef.current;

    // Wait for style to load if it's not ready
    if (!map.isStyleLoaded()) {
      map.once("style.load", () => addRouteLayer(map, routeGeoJSON));
    } else {
      addRouteLayer(map, routeGeoJSON);
    }

    // Optional: Fit bounds to the route
    // Note: GeoJSON coordinates are usually nested arrays.
    // Calculating bounds for a LineString is easy:
    if (routeGeoJSON.coordinates) {
      const bounds = new mapboxgl.LngLatBounds();
      routeGeoJSON.coordinates.forEach((coord: number[]) => {
        bounds.extend(coord as [number, number]);
      });
      map.fitBounds(bounds, { padding: 50 });
    }
  }, [routeGeoJSON]);

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
    if (!mapRef.current || !itineraryData?.center) return;

    const { lat, lng } = itineraryData.center;
    if (typeof lat !== "number" || typeof lng !== "number") return;

    mapRef.current.setCenter([lng, lat]);
  }, [itineraryData?.center?.lat, itineraryData?.center?.lng]);

  // 5. Update Markers
  useEffect(() => {
    if (!mapRef.current) return;
    if (!itineraryData?.stops) return;

    const map = mapRef.current;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Only show markers for selected stops
    if (selectedStopIds.length === 0) {
      return;
    }

    const bounds = new mapboxgl.LngLatBounds();

    itineraryData.stops.forEach((stop: any, index: number) => {
      const stopId = stop.id ?? String(index);
      if (!selectedStopIds.includes(stopId)) return;

      const lat = stop.coordinates?.lat;
      const lng = stop.coordinates?.lng;

      if (typeof lat !== "number" || typeof lng !== "number") return;

      const marker = new mapboxgl.Marker({ color: "#22c55e" })
        .setLngLat([lng, lat])
        .addTo(map);

      markersRef.current.push(marker);
      bounds.extend([lng, lat]);
    });

    // Zoom/fit to the selected markers (Only if no route is present to avoid conflict)
    if (!bounds.isEmpty() && !routeGeoJSON) {
      map.fitBounds(bounds, {
        padding: 80,
        duration: 800,
        maxZoom: 14,
      });
    }
  }, [itineraryData, selectedStopIds, routeGeoJSON]);

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
