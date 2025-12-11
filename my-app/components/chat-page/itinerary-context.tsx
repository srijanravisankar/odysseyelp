// // components/chat-page/itinerary-context.tsx
// "use client";

// import React, { createContext, useContext, useState } from "react";

// // Define the shape of your data
// type ItineraryContextType = {
//   itineraryData: any; // Replace 'any' with your actual data type later
//   setItineraryData: (data: any) => void;

//   // Which stops are "selected" (checked) to show on the map
//   selectedStopIds: string[];
//   setSelectedStopIds: React.Dispatch<React.SetStateAction<string[]>>;

//   // NEW: Track the app's resolved theme (light/dark) for the map
//   appTheme: "light" | "dark" | "system";
//   setAppTheme: React.Dispatch<
//     React.SetStateAction<"light" | "dark" | "system">
//   >;
// };

// const ItineraryContext = createContext<ItineraryContextType | undefined>(
//   undefined
// );

// export function ItineraryProvider({ children }: { children: React.ReactNode }) {
//   const [itineraryData, setItineraryData] = useState<any>(null);
//   const [selectedStopIds, setSelectedStopIds] = useState<string[]>([]);

//   // Initialize with 'system' or a default
//   const [appTheme, setAppTheme] = useState<"light" | "dark" | "system">(
//     "system"
//   );

//   return (
//     <ItineraryContext.Provider
//       value={{
//         itineraryData,
//         setItineraryData,
//         selectedStopIds,
//         setSelectedStopIds,
//         appTheme,
//         setAppTheme,
//       }}
//     >
//       {children}
//     </ItineraryContext.Provider>
//   );
// }

// // Custom hook to make using the context easier
// export function useItinerary() {
//   const context = useContext(ItineraryContext);
//   if (!context) {
//     throw new Error("useItinerary must be used within an ItineraryProvider");
//   }
//   return context;
// }

"use client";

import React, { createContext, useContext, useState } from "react";

type ItineraryContextType = {
  itineraryData: any;
  setItineraryData: (data: any) => void;
  selectedStopIds: string[];
  setSelectedStopIds: React.Dispatch<React.SetStateAction<string[]>>;
  appTheme: "light" | "dark" | "system";
  setAppTheme: React.Dispatch<
    React.SetStateAction<"light" | "dark" | "system">
  >;

  // 🔑 NEW: Store the route geometry (GeoJSON) here
  routeGeoJSON: any;
  setRouteGeoJSON: (json: any) => void;
};

const ItineraryContext = createContext<ItineraryContextType | undefined>(
  undefined
);

export function ItineraryProvider({ children }: { children: React.ReactNode }) {
  const [itineraryData, setItineraryData] = useState<any>(null);
  const [selectedStopIds, setSelectedStopIds] = useState<string[]>([]);
  const [appTheme, setAppTheme] = useState<"light" | "dark" | "system">(
    "system"
  );

  // 🔑 Initialize route state
  const [routeGeoJSON, setRouteGeoJSON] = useState<any>(null);

  return (
    <ItineraryContext.Provider
      value={{
        itineraryData,
        setItineraryData,
        selectedStopIds,
        setSelectedStopIds,
        appTheme,
        setAppTheme,
        routeGeoJSON, // 👈
        setRouteGeoJSON, // 👈
      }}
    >
      {children}
    </ItineraryContext.Provider>
  );
}

export function useItinerary() {
  const context = useContext(ItineraryContext);
  if (!context)
    throw new Error("useItinerary must be used within an ItineraryProvider");
  return context;
}
