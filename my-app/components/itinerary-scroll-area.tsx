import { ScrollArea } from "@/components/ui/scroll-area"
import { SidebarUserAccordion } from "./user-accordion"

export function ItineraryScrollArea() {
  return (
    <ScrollArea className="h-125 overflow-y-auto w-full rounded-md border bg-muted/50 pb-auto">
      <div className="p-4">
        <SidebarUserAccordion />
      </div>
    </ScrollArea>
  )
}