import { ScrollArea } from "@/components/ui/scroll-area"
import { JourneyTimeline } from "./journey-timeline"

export function ItineraryScrollArea() {
  return (
    // <ScrollArea className="h-50vh overflow-y-auto w-full rounded-md border bg-muted/50 p-1">
    <ScrollArea className="h-[calc(100dvh-165px)] overflow-y-auto w-full rounded-md border bg-muted/50 p-1">
      <div className="p-2">
          <JourneyTimeline />
      </div>
    </ScrollArea>
  )
}
