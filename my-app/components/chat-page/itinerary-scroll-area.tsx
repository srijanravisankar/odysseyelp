import { ScrollArea } from "@/components/ui/scroll-area"
import { JourneyTimeline } from "../journey-timeline"

export function ItineraryScrollArea() {
  return (
    <ScrollArea className="h-120 overflow-y-auto w-full rounded-md border bg-muted/50 p-1">
    {/* <ScrollArea className="flex-1 overflow-y-auto w-full rounded-md border bg-muted/50"> */}
      <div className="p-3">
        <JourneyTimeline />
      </div>
    </ScrollArea>
  )
}
