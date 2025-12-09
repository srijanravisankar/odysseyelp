import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { ItineraryScrollArea } from "./itinerary-scroll-area";
import { TouringMap } from "@/components/touring-map";
import {
  ButtonGroup,
} from "@/components/ui/button-group"
import { Button } from "../ui/button";
import { Check, CircleCheckBig, Pen, SquarePen, X } from "lucide-react";
import { ChatPagePagination } from "./chat-page-pagination";

export function Itinerary() {
  return (
    <Card className="flex flex-row p-0 bg-muted/50 h-full overflow-hidden">
      <CardContent className="flex flex-col flex-1 min-h-0 pr-3 pl-3 pt-3 pb-3 overflow-y-auto w-50">
        <ItineraryScrollArea />
        <div className="w-full flex justify-end flex-shrink-0 pt-1">
          <ButtonGroup>
            <Button variant="ghost" className="cursor-pointer">
              <CircleCheckBig className="text-green-600" />
              Approve
            </Button>
            <Button variant="ghost" className="cursor-pointer">
              <SquarePen className="text-yellow-600" />
              Modify
            </Button>
          </ButtonGroup>
        </div>
      </CardContent>
      <CardFooter className="p-0 flex-1 pr-3 pl-3 pt-3 pb-3 flex-shrink-0">
        <div className="relative w-full flex-1 h-full overflow-hidden rounded-xl border bg-muted">
          <TouringMap />
        </div>
      </CardFooter>
    </Card>
  );
}