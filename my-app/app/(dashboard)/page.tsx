import { Itinerary } from "@/components/itinerary"

export default function Page() {
    return (
        <div className="grid h-full w-full gap-6 md:grid-cols-3 md:grid-rows-1">
            <Itinerary />
            <Itinerary />
            <Itinerary />
        </div>
    )
}

