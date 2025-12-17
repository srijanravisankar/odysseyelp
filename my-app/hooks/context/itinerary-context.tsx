"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useChat } from "@/hooks/context/session-context";
import { useUser } from "@/hooks/context/user-context";
import { useSupabase } from "./supabase-context";
import { useGroup } from "./group-context";
import { usePathname } from "next/navigation";

export interface Itinerary {
  id: number;
  created_at: string;
  user_id: string;
  title: string;
  prompt: string;
  stops: any;
  session_id: number;
  favorites: boolean;
  published: boolean;
  tags: string[];
}

type ItineraryContextType = {
  itineraryData: Itinerary | null;
  setItineraryData: (data: any) => void;
  selectedStopIds: string[];
  setSelectedStopIds: React.Dispatch<React.SetStateAction<string[]>>;
  appTheme: "light" | "dark" | "system";
  setAppTheme: React.Dispatch<
    React.SetStateAction<"light" | "dark" | "system">
  >;

  removeStop: (stopId: string) => void;

  itineraries: Itinerary[];
  loadingItineraries: boolean;
  itinerariesError: string | null;

  refetchItineraries: () => Promise<void>;
  isBuildingItinerary: boolean;
  setIsBuildingItinerary: React.Dispatch<React.SetStateAction<boolean>>;

  routeGeoJSON: any;
  setRouteGeoJSON: (json: any) => void;
};

const ItineraryContext = createContext<ItineraryContextType | undefined>(
  undefined
);

export function ItineraryProvider({ children }: { children: React.ReactNode }) {
  const supabase = useSupabase();
  // ✅ 1. Get Setters to reset selection on page change
  const { active, setActive } = useChat(); 
  const { user } = useUser();
  const { activeGroup, setActiveGroup } = useGroup();

  const pathname = usePathname();

  const [itineraryData, setItineraryData] = useState<any>(null);
  const [selectedStopIds, setSelectedStopIds] = useState<string[]>([]);
  const [appTheme, setAppTheme] = useState<"light" | "dark" | "system">(
    "system"
  );

  const [routeGeoJSON, setRouteGeoJSON] = useState<any>(null);

  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [loadingItineraries, setLoadingItineraries] = useState(false);
  const [itinerariesError, setItinerariesError] = useState<string | null>(null);
  const [isBuildingItinerary, setIsBuildingItinerary] = useState(false);

  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const removeStop = (stopId: string) => {
    if (!itineraryData?.stops?.stops) return;

    setItineraryData({
      ...itineraryData,
      stops: {
        ...itineraryData.stops,
        stops: itineraryData.stops.stops.filter((stop: any) => {
          const id = stop.id ?? String(itineraryData.stops.stops.indexOf(stop));
          return id !== stopId;
        }),
      },
    });

    setSelectedStopIds((prev) => prev.filter((id) => id !== stopId));
  };

  useEffect(() => {
    console.log("Itinerary changed, clearing selectedStopIds");
    setSelectedStopIds([]);
  }, [itineraryData?.id]);

  const refetchItineraries = useCallback(async () => {
    console.log("Manual refetch triggered");
    setRefetchTrigger((prev) => prev + 1);
  }, []);

  // ✅ 2. CLEANUP EFFECT: Runs ONLY when Pathname changes
  // This enforces the "Clean Slate" rule.
  useEffect(() => {
    console.log("🚀 Route changed:", pathname, "-> Wiping Data");

    // 1. Clear Data
    setItineraryData(null);
    setItineraries([]);
    setLoadingItineraries(false);
    
    // 2. Clear Selections (Forces manual re-selection)
    // Using a timeout prevents conflict with the render cycle
    setTimeout(() => {
        if (pathname?.startsWith("/groups")) {
            // Entered groups page -> Deselect any active group
            setActiveGroup(null);
        } else if (pathname?.startsWith("/chat")) {
            // Entered chat page -> Deselect any active session
            if (setActive) setActive(null as any); 
        }
    }, 0);

  }, [pathname, setActiveGroup, setActive]);


  // ✅ 3. FETCH EFFECT: Runs ONLY when Selection Changes (active / activeGroup)
  // Removed 'pathname' from dependency array to prevent auto-fetch on nav
  useEffect(() => {
    const fetchItineraries = async () => {
      // Determine context based on the CURRENT pathname ref
      // (We read pathname, but don't react to it changing)
      const isGroupPage = window.location.pathname.startsWith("/groups");
      const isChatPage = window.location.pathname.startsWith("/chat");

      // Skip if nothing selected
      if (isGroupPage && !activeGroup) return;
      if (isChatPage && !active) return;
      if (!isGroupPage && !isChatPage) return;

      console.log("DEBUG: Fetching Itineraries for selection", {
        active,
        activeGroup: activeGroup?.id,
        pathname: window.location.pathname
      });

      setLoadingItineraries(true);
      setItinerariesError(null);

      try {
        const { data: authData } = await supabase.auth.getUser();
        if (!authData.user) {
          setItinerariesError("User not authenticated");
          return;
        }

        let query = supabase
          .from("itineraries")
          .select("*")
          .order("created_at", { ascending: true });

        // Logic
        if (isGroupPage && activeGroup) {
           query = query.eq("group_id", activeGroup.id).eq("user_id", authData.user.id);
        } else if (isChatPage && active) {
           query = query.eq("session_id", active).eq("user_id", authData.user.id);
        } else {
           // Should be caught by guard clause, but safe fallback
           setLoadingItineraries(false);
           return;
        }

        const { data, error: queryError } = await query;

        if (queryError) {
          setItinerariesError(queryError.message);
          return;
        }

        const fetchedItineraries = data || [];
        setItineraries(fetchedItineraries);

        if (fetchedItineraries.length > 0) {
          setItineraryData(fetchedItineraries[0]);
        } else {
          setItineraryData(null);
        }
      } catch (err: any) {
        setItinerariesError(err.message || "Failed to fetch itineraries");
      } finally {
        setLoadingItineraries(false);
      }
    };

    fetchItineraries();

  }, [active, activeGroup, user?.id, supabase, refetchTrigger]); // 👈 NO pathname here

  return (
    <ItineraryContext.Provider
      value={{
        itineraryData,
        setItineraryData,
        selectedStopIds,
        setSelectedStopIds,
        appTheme,
        setAppTheme,
        removeStop,
        itineraries,
        loadingItineraries,
        itinerariesError,
        refetchItineraries,
        isBuildingItinerary,
        setIsBuildingItinerary,
        routeGeoJSON,
        setRouteGeoJSON,
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