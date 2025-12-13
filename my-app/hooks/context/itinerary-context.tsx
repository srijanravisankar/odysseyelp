"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useChat } from "@/hooks/context/session-context";
import { useUser } from "@/hooks/context/user-context";

export interface Itinerary {
  id: number;
  created_at: string;
  user_id: string;
  title: string;
  prompt: string;
  stops: any;
  session_id: number;
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
  routeGeoJSON: any;
  setRouteGeoJSON: (json: any) => void;

  removeStop: (stopId: string) => void;

  // 🔑 NEW: Fetched itineraries from Supabase
  itineraries: Itinerary[];
  loadingItineraries: boolean;
  itinerariesError: string | null;
};

const ItineraryContext = createContext<ItineraryContextType | undefined>(
  undefined
);

export function ItineraryProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { active } = useChat();
  const { user } = useUser();

  const [itineraryData, setItineraryData] = useState<any>(null);
  const [selectedStopIds, setSelectedStopIds] = useState<string[]>([]);
  const [appTheme, setAppTheme] = useState<"light" | "dark" | "system">(
    "system"
  );
  const [routeGeoJSON, setRouteGeoJSON] = useState<any>(null);

  // 🔑 NEW: Itineraries fetched from database
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [loadingItineraries, setLoadingItineraries] = useState(false);
  const [itinerariesError, setItinerariesError] = useState<string | null>(null);

  const removeStop = (stopId: string) => {
    if (!itineraryData?.stops) return;

    setItineraryData({
      ...itineraryData,
      stops: itineraryData.stops.filter((stop: any) => {
        const id = stop.id ?? String(itineraryData.stops.indexOf(stop));
        return id !== stopId;
      }),
    });

    // Also remove from selected stops if it was selected
    setSelectedStopIds((prev) => prev.filter((id) => id !== stopId));
  };

  // 🔑 NEW: Fetch itineraries whenever active session or user changes
  useEffect(() => {
    const fetchItineraries = async () => {
      if (!active || !user?.email) {
        setItineraries([]);
        setItineraryData(null);
        // ensure loading flag is false when there's no active session/user
        setLoadingItineraries(false);
        return;
      }

      setLoadingItineraries(true);
      setItinerariesError(null);

      try {
        const { data: authData } = await supabase.auth.getUser();
        if (!authData.user) {
          setItinerariesError("User not authenticated");
          return;
        }

        const { data, error: queryError } = await supabase
          .from("itineraries")
          .select("*")
          .eq("user_id", authData.user.id)
          .eq("session_id", active)
          .order("created_at", { ascending: false });

        if (queryError) {
          setItinerariesError(queryError.message);
          console.error("Error fetching itineraries:", queryError);
          return;
        }

        const fetchedItineraries = data || [];
        setItineraries(fetchedItineraries);

        // 🔑 IMPORTANT: Set the first itinerary as itineraryData
        if (fetchedItineraries.length > 0) {
          setItineraryData(fetchedItineraries[0]);
        } else {
          setItineraryData(null);
        }
      } catch (err: any) {
        setItinerariesError(err.message || "Failed to fetch itineraries");
        console.error("Fetch itineraries error:", err);
      } finally {
        setLoadingItineraries(false);
      }
    };

    fetchItineraries();
  }, [active, user?.email, supabase]);

  return (
    <ItineraryContext.Provider
      value={{
        itineraryData,
        setItineraryData,
        selectedStopIds,
        setSelectedStopIds,
        appTheme,
        setAppTheme,
        routeGeoJSON,
        setRouteGeoJSON,
        removeStop,
        itineraries,
        loadingItineraries,
        itinerariesError,
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