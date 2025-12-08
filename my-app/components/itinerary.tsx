import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ItineraryScrollArea } from "./itinerary-scroll-area";
import Image from "next/image";
import { ItineraryButtonGroup } from "./itinerary-button-group";

export function Itinerary() {
  return (
    <Card className="flex flex-col -space-y-5 p-0 bg-muted/50 h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pt-3 pb-2 pr-3 pl-3">
        <CardTitle className="text-sm">Plan A</CardTitle>
        <div className="[&_button]:h-6 [&_button]:px-2 [&_button]:text-[10px] [&_button]:bg-background [&_button]:text-foreground [&_button]:border [&_button]:border-input [&_button]:shadow-sm [&_button]:hover:bg-accent [&_button]:hover:text-accent-foreground">
          <ItineraryButtonGroup />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col flex-1 min-h-0 pr-3 pl-3 overflow-y-auto">
        <ItineraryScrollArea />
      </CardContent>
      <CardFooter className="pr-3 pl-3 pt-3 pb-4 flex-shrink-0">
        <Image 
          width={800}
          height={500}
          src="/map-placeholder.webp" 
          alt="Photo of something" 
          className="w-full h-auto rounded-md object-cover" 
        />
      </CardFooter>
    </Card>
  );
}