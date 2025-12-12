import { SidebarGroupContent } from "../ui/sidebar";
import {JourneyTimeline} from "@/components/journey-timeline";

export function TouringSidebarContent() {
  return (
    <SidebarGroupContent className="flex flex-col gap-3 p-4 text-sm">
      <JourneyTimeline />
    </SidebarGroupContent>
  );
}