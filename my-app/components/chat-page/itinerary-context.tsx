// components/itinerary-context.tsx
"use client"

import React, { createContext, useContext, useState } from "react"

// Define the shape of your data
type ItineraryContextType = {
  itineraryData: any; // Replace 'any' with your actual data type later
  setItineraryData: (data: any) => void;
}

const ItineraryContext = createContext<ItineraryContextType | undefined>(undefined)

export function ItineraryProvider({ children }: { children: React.ReactNode }) {
  const [itineraryData, setItineraryData] = useState<any>(null)

  return (
    <ItineraryContext.Provider value={{ itineraryData, setItineraryData }}>
      {children}
    </ItineraryContext.Provider>
  )
}

// Custom hook to make using the context easier
export function useItinerary() {
  const context = useContext(ItineraryContext)
  if (!context) {
    throw new Error("useItinerary must be used within an ItineraryProvider")
  }
  return context
}