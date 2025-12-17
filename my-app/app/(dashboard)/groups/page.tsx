"use client"

import { ChatPagePagination } from "@/components/chat-page/chat-page-pagination"
import { Itinerary } from "@/components/chat-page/itinerary"

import { useItinerary } from "@/hooks/context/itinerary-context";
import { HamsterLoader } from "@/components/ui/hamster-loader";

// pr check
export default function Page() {
  const { loadingItineraries, isBuildingItinerary } = useItinerary();
  return (
    <div className="grid h-full w-full gap-4 md:grid-rows-1">
      {loadingItineraries || isBuildingItinerary ?
        <div className="flex items-center justify-center h-full w-full">
          <HamsterLoader />
        </div>
        :
        <>
          <Itinerary />
          <ChatPagePagination />
        </>
      }
    </div>
  )
}