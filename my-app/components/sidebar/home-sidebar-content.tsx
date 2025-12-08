import { SidebarContent } from "../ui/sidebar";
import { SidebarUserAccordion } from "../user-accordion";

export function HomeSidebarContent() {
  return (
    <SidebarContent className="scrollbar-hide px-0 px-4 py-2">
      <SidebarUserAccordion />
    </SidebarContent>
  );
}