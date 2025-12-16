"use client"

import { Itinerary } from "@/components/chat-page/itinerary"

import { useItinerary } from "@/hooks/context/itinerary-context";
import { HamsterLoader } from "@/components/ui/hamster-loader";

// pr check
export default function Page() {
    const { loadingItineraries, isBuildingItinerary } = useItinerary();
    return (
        <div className="grid h-full w-full gap-4 md:grid-rows-1">
            <div className="relative flex h-full w-full">
                <div className="flex-1">
                    <Itinerary />
                </div>
                {(loadingItineraries || isBuildingItinerary) && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/80 backdrop-blur">
                        <HamsterLoader />
                    </div>
                )}
            </div>
        </div>
    )
}