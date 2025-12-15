import { AllItinerariesGrid } from "@/components/all-itineraries-grid"

export default function PublishedPage() {
    return (
        <div className="flex flex-1 flex-col gap-4">
            <h1 className="text-xl font-semibold tracking-tight">Published</h1>
            <AllItinerariesGrid filter="published" />
        </div>
    )
}
