"use client"

import { ChatPagePagination } from "@/components/chat-page/chat-page-pagination"
import { Itinerary } from "@/components/chat-page/itinerary"

import { useItinerary } from "@/hooks/context/itinerary-context";
import { Spinner } from "@/components/ui/spinner";

// pr check
export default function Page() {
  const { loadingItineraries } = useItinerary();
  return (
    <div className="grid h-full w-full gap-4 md:grid-rows-1">
      {/* {loadingItineraries ?
        <div className="flex items-center justify-center h-full w-full">
          <Spinner />
        </div>
        :
        <>
          <Itinerary />
          <ChatPagePagination />
        </>
      } */}
    </div>
  )
}