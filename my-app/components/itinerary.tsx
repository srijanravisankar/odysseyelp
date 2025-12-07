import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ItineraryScrollArea } from "./itinerary-scroll-area";
import Image from "next/image";

export function Itinerary() {
  return (
  <Card className="-space-y-6 p-0 bg-muted/50">
    <CardHeader className="pt-3">
			<CardTitle className="text-sm">Plan A</CardTitle>
    </CardHeader>
    <CardContent className="pr-3 pl-3">
      <ItineraryScrollArea />
    </CardContent>
    <CardFooter className="pr-3 pl-3 pt-3 pb-4">
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