import { ChatPagePagination } from "@/components/chat-page/chat-page-pagination"
import { Itinerary } from "@/components/chat-page/itinerary"

// pr check
export default function Page() {
    return (
        <div className="grid h-full w-full gap-4 md:grid-rows-1">
            <Itinerary />
            <ChatPagePagination />
        </div>
    )
}