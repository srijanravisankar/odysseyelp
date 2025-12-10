import { SidebarGroupContent } from "../ui/sidebar";
import {JourneyTimeline} from "@/components/journey-timeline";

export function TouringSidebarContent() {
  return (
    <SidebarGroupContent className="scrollbar-hide px-0 px-4 py-2">
      <JourneyTimeline />
    </SidebarGroupContent>
  );
}