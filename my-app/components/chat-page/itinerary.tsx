// "use client";

// import { useState } from "react";
// import { Card, CardContent, CardFooter } from "@/components/ui/card";
// import { ItineraryScrollArea } from "./itinerary-scroll-area";
// import { TouringMap } from "@/components/touring-map";
// import { ButtonGroup } from "@/components/ui/button-group";
// import { Button } from "../ui/button";
// import { CircleCheckBig, SquarePen, MapPinned } from "lucide-react";
// import { useItinerary } from "./itinerary-context";

// // 1. Import your new components
// import { LiveButton } from "@/components/ui/live-button";

// // 2. 🔑 FIXED IMPORT: Import 'AlertDialogPopup' and alias it as 'AlertDialogContent'
// import {
//   AlertDialog,
//   AlertDialogPopup as AlertDialogContent, // <--- Renaming here
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogAction,
//   AlertDialogCancel,
// } from "@/components/animate-ui/components/base/alert-dialog";

// import { Input } from "../ui/input";
// import { Label } from "../ui/label";

// export function Itinerary() {
//   const { itineraryData, selectedStopIds, setRouteGeoJSON } = useItinerary();

//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [startAddress, setStartAddress] = useState("");
//   const [loading, setLoading] = useState(false);

//   // --- Logic to Find Best Route ---
//   const handleFindRoute = async () => {
//     if (!startAddress.trim()) return;
//     setLoading(true);

//     try {
//       const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
//       if (!token) throw new Error("Missing Mapbox Token");

//       // 1. Geocode the Starting Address
//       const geocodeRes = await fetch(
//         `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
//           startAddress
//         )}.json?access_token=${token}&limit=1`
//       );
//       const geocodeData = await geocodeRes.json();
//       const startCoords = geocodeData.features?.[0]?.center; // [lng, lat]

//       if (!startCoords) {
//         alert("Could not find that address!");
//         setLoading(false);
//         return;
//       }

//       // 2. Gather Selected Stops Coordinates
//       const stopsToVisit = itineraryData?.stops.filter((stop: any) => {
//         const stopId = stop.id ?? "unknown";
//         return selectedStopIds.includes(stopId);
//       });

//       if (!stopsToVisit || stopsToVisit.length === 0) {
//         alert("Please select at least one stop from the list.");
//         setLoading(false);
//         return;
//       }

//       // 3. Build Coordinate String
//       const coordsString = [
//         startCoords.join(","),
//         ...stopsToVisit.map(
//           (s: any) => `${s.coordinates.lng},${s.coordinates.lat}`
//         ),
//       ].join(";");

//       // 4. Call Mapbox Optimization API
//       const optimizeRes = await fetch(
//         `https://api.mapbox.com/optimized-trips/v1/mapbox/driving/${coordsString}?source=first&geometries=geojson&access_token=${token}`
//       );
//       const optimizeData = await optimizeRes.json();

//       if (optimizeData.trips && optimizeData.trips[0]) {
//         // 5. Save the route geometry
//         setRouteGeoJSON(optimizeData.trips[0].geometry);
//         setIsDialogOpen(false);
//       } else {
//         console.error("No route found", optimizeData);
//       }
//     } catch (err) {
//       console.error("Error finding route:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Card className="flex flex-row p-0 bg-muted/50 h-full overflow-hidden">
//       <CardContent className="flex flex-col flex-1 min-h-0 pr-3 pl-3 pt-3 pb-3 overflow-y-auto w-50">
//         <ItineraryScrollArea />
//         <div className="w-full flex justify-end shrink-0 pt-1">
//           <ButtonGroup>
//             <LiveButton
//               className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white"
//               onClick={() => setIsDialogOpen(true)}
//             >
//               <MapPinned className="mr-2 h-4 w-4" />
//               Find Best Route
//             </LiveButton>

//             <Button
//               variant="ghost"
//               className="hover:bg-gray-300 cursor-pointer"
//             >
//               <CircleCheckBig className="text-green-600" />
//               Add to My Space
//             </Button>
//             <Button
//               variant="ghost"
//               className="hover:bg-gray-300 cursor-pointer"
//             >
//               <SquarePen className="text-yellow-600" />
//               Modify
//             </Button>
//           </ButtonGroup>
//         </div>
//       </CardContent>

//       <CardFooter className="p-0 flex-1 pr-3 pl-3 pt-3 pb-3 shrink-0">
//         <div className="relative w-full flex-1 h-full overflow-hidden rounded-xl border bg-muted">
//           <TouringMap />
//         </div>
//       </CardFooter>

//       {/* Alert Dialog */}
//       <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//         {/* We use AlertDialogContent here because we aliased it in the import */}
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Plan your route</AlertDialogTitle>
//             <AlertDialogDescription>
//               Enter your starting location. We will calculate the best order to
//               visit your selected stops.
//             </AlertDialogDescription>
//           </AlertDialogHeader>

//           <div className="grid gap-2 py-4">
//             <Label htmlFor="start-address">Starting Address</Label>
//             <Input
//               id="start-address"
//               placeholder="e.g. Union Station, Toronto"
//               value={startAddress}
//               onChange={(e) => setStartAddress(e.target.value)}
//             />
//           </div>

//           <AlertDialogFooter>
//             <AlertDialogCancel>Cancel</AlertDialogCancel>
//             <AlertDialogAction
//               onClick={(e) => {
//                 e.preventDefault();
//                 handleFindRoute();
//               }}
//             >
//               {loading ? "Calculating..." : "Go"}
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </Card>
//   );
// }

"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ItineraryScrollArea } from "./itinerary-scroll-area";
import { TouringMap } from "@/components/touring-map";
import { ButtonGroup } from "@/components/ui/button-group";
import { Button } from "../ui/button";
// 1. Import Route icon
import { CircleCheckBig, SquarePen, Route } from "lucide-react";
import { useItinerary } from "./itinerary-context";

// 2. Remove LiveButton import
// import { LiveButton } from "@/components/ui/live-button";

import {
  AlertDialog,
  AlertDialogPopup as AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/animate-ui/components/base/alert-dialog";

import { Input } from "../ui/input";
import { Label } from "../ui/label";

export function Itinerary() {
  const { itineraryData, selectedStopIds, setRouteGeoJSON } = useItinerary();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [startAddress, setStartAddress] = useState("");
  const [loading, setLoading] = useState(false);

  // --- Logic to Find Best Route ---
  const handleFindRoute = async () => {
    if (!startAddress.trim()) return;
    setLoading(true);

    try {
      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
      if (!token) throw new Error("Missing Mapbox Token");

      // 1. Geocode the Starting Address
      const geocodeRes = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          startAddress
        )}.json?access_token=${token}&limit=1`
      );
      const geocodeData = await geocodeRes.json();
      const startCoords = geocodeData.features?.[0]?.center; // [lng, lat]

      if (!startCoords) {
        alert("Could not find that address!");
        setLoading(false);
        return;
      }

      // 2. Gather Selected Stops Coordinates
      const stopsToVisit = itineraryData?.stops.filter((stop: any) => {
        const stopId = stop.id ?? "unknown";
        return selectedStopIds.includes(stopId);
      });

      if (!stopsToVisit || stopsToVisit.length === 0) {
        alert("Please select at least one stop from the list.");
        setLoading(false);
        return;
      }

      // 3. Build Coordinate String
      const coordsString = [
        startCoords.join(","),
        ...stopsToVisit.map(
          (s: any) => `${s.coordinates.lng},${s.coordinates.lat}`
        ),
      ].join(";");

      // 4. Call Mapbox Optimization API
      const optimizeRes = await fetch(
        `https://api.mapbox.com/optimized-trips/v1/mapbox/driving/${coordsString}?source=first&geometries=geojson&access_token=${token}`
      );
      const optimizeData = await optimizeRes.json();

      if (optimizeData.trips && optimizeData.trips[0]) {
        // 5. Save the route geometry
        setRouteGeoJSON(optimizeData.trips[0].geometry);
        setIsDialogOpen(false);
      } else {
        console.error("No route found", optimizeData);
      }
    } catch (err) {
      console.error("Error finding route:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="flex flex-row p-0 bg-muted/50 h-full overflow-hidden">
      <CardContent className="flex flex-col flex-1 min-h-0 pr-3 pl-3 pt-3 pb-3 overflow-y-auto w-50">
        <ItineraryScrollArea />
        <div className="w-full flex justify-end shrink-0 pt-1">
          <ButtonGroup>
            {/* 3. Replaced LiveButton with standard Button */}
            <Button
              variant="ghost"
              className="hover:bg-gray-300 cursor-pointer"
              onClick={() => setIsDialogOpen(true)}
            >
              <Route className="text-blue-600 h-4 w-4 mr-2" />
              Find Best Route
            </Button>

            <Button
              variant="ghost"
              className="hover:bg-gray-300 cursor-pointer"
            >
              <CircleCheckBig className="text-green-600 h-4 w-4 mr-2" />
              Add to My Space
            </Button>

            <Button
              variant="ghost"
              className="hover:bg-gray-300 cursor-pointer"
            >
              <SquarePen className="text-yellow-600 h-4 w-4 mr-2" />
              Modify
            </Button>
          </ButtonGroup>
        </div>
      </CardContent>

      <CardFooter className="p-0 flex-1 pr-3 pl-3 pt-3 pb-3 shrink-0">
        <div className="relative w-full flex-1 h-full overflow-hidden rounded-xl border bg-muted">
          <TouringMap />
        </div>
      </CardFooter>

      {/* Alert Dialog */}
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Plan your route</AlertDialogTitle>
            <AlertDialogDescription>
              Enter your starting location. We will calculate the best order to
              visit your selected stops.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="grid gap-2 py-4">
            <Label htmlFor="start-address">Starting Address</Label>
            <Input
              id="start-address"
              placeholder="e.g. Union Station, Toronto"
              value={startAddress}
              onChange={(e) => setStartAddress(e.target.value)}
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleFindRoute();
              }}
            >
              {loading ? "Calculating..." : "Go"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
