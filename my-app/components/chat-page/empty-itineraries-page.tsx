import Image from "next/image";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "../ui/empty";
import { CircleOff, Icon, PiIcon } from "lucide-react";
import { Button } from "../ui/button";

export function EmptyItinerariesPage() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="default">
          <CircleOff />
        </EmptyMedia>
        <EmptyTitle>No data</EmptyTitle>
        <EmptyDescription>No Itineraies Generated</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

