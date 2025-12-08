import { SidebarGroupContent } from "../ui/sidebar";

export function TouringSidebarContent() {
  return (
    <SidebarGroupContent className="scrollbar-hide px-0 px-4 py-2">
      <div className="flex flex-col gap-4 text-sm text-muted-foreground">
        <div className="border rounded-md p-2">Map Filters...</div>
        <div className="border rounded-md p-2">Radius...</div>
      </div>
    </SidebarGroupContent>
  );
}