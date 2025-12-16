"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ItineraryScrollArea } from "./itinerary-scroll-area";
import { TouringMap } from "@/components/touring-map";
import { ButtonGroup } from "@/components/ui/button-group";
import { Button } from "../ui/button";
import { CircleCheckBig, SquarePen, Map, CalendarDays } from "lucide-react";
import {
  PlannerCalendar,
  type CalendarEvent,
} from "@/components/planner-calendar";

import { useItinerary } from '@/hooks/context/itinerary-context'
import { EmptyItinerariesPage } from "./empty-itineraries-page";

import { mapItineraryToCalendarEvents } from "@/lib/schedule-parser";
import { useUser } from "@/hooks/context/user-context";
import { useChat } from "@/hooks/context/session-context";

export function Itinerary() {
  const { itineraryData, setItineraryData, itineraries, loadingItineraries, itinerariesError } = useItinerary();

  const [viewMode, setViewMode] = useState<"map" | "calendar">("map");

  // Calendar events state (for now, just a simple example event)
  // Later you can derive this from itineraryData.
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);

  const { user } = useUser();
  const { active } = useChat();

  useEffect(() => {
    if (itineraryData?.stops) {
      // Get the start date from itinerary or default to today
      const baseDate = itineraryData.stops.date 
        ? new Date(itineraryData.stops.date) 
        : new Date();

      const events = mapItineraryToCalendarEvents(
        itineraryData.stops.stops,
        baseDate
      );
      
      setCalendarEvents(events);
      console.log("📅 Calendar events updated:", events);
    }
  }, [user, active, itineraryData]);

  useEffect(() => {
    if (itineraries && itineraries.length > 0) {
      // Only set if we haven't selected one yet OR if the current one doesn't match the new list
      // (This prevents overwriting if the user manually selected a different one)
      const currentExistsInList = itineraries.find((i: any) => i.id === itineraryData?.id);
      
      if (!itineraryData || !currentExistsInList) {
        setItineraryData(itineraries[0]);
      }
    } else if (itineraries && itineraries.length === 0) {
        // If no itineraries exist for this chat, clear the view
        setItineraryData(null);
    }
  }, [itineraries, itineraryData, setItineraryData, active]);


  function handleItineraryAdd(): void {
    throw new Error("Function not implemented.");
  }

  if (loadingItineraries) return <div>Loading itineraries...</div>
  if (itinerariesError) return <div>Error: {itinerariesError}</div>
  // if (itineraries.length === 0) return <div>No itineraries found</div>
  // else return <pre>{JSON.stringify(itineraries[0].stops, null, 2)}</pre>

  // console.log("ItineraryData in Itinerary component:", itineraryData);
  return (
    <Card className="flex flex-row p-0 bg-muted/50 h-full overflow-hidden">
      <CardContent className="flex flex-col flex-1 min-h-0 pr-2 pl-2 pt-2 pb-2 overflow-y-auto w-50">
        {itineraries.length === 0 ? <EmptyItinerariesPage /> : <ItineraryScrollArea />}
        {/* <ItineraryScrollArea /> */}
        <div className="w-full flex justify-end shrink-0 pt-1">
          <ButtonGroup>

            <Button
              variant="ghost"
              className="hover:bg-gray-300 cursor-pointer"
              onClick={handleItineraryAdd}
            >
              <CircleCheckBig className="text-green-600 h-3 w-3" />
              Add to My Space
            </Button>

            <Button
              variant="ghost"
              className="hover:bg-gray-300 cursor-pointer"
            >
              <SquarePen className="text-yellow-600 h-3 w-3" />
              Modify
            </Button>
          </ButtonGroup>
        </div>
      </CardContent>

      <CardFooter className="flex-1 pr-2 pl-2 pt-2 pb-2 shrink-0">
        <div className="flex h-full w-full flex-col gap-1">
          {/* Top row: Map / Calendar toggle */}

          {/* Main pane: map OR calendar */}
          <div className="relative flex-1 overflow-hidden rounded-lg border bg-muted">
            {viewMode === "map" ? (
              <TouringMap />
              // <EmptyItinerariesPage />
            ) : (
              <PlannerCalendar
                events={calendarEvents}
                onEventsChange={setCalendarEvents}
                initialMonth={
                  itineraryData?.stops.date 
                    ? new Date(itineraryData.stops.date )
                    : undefined
                }
              />
            )}
          </div>
          <div className="flex items-end justify-end">
            <ButtonGroup>
              <Button
                variant="ghost"
                className="hover:bg-gray-300 cursor-pointer"
                onClick={() => setViewMode("map")}
              >
                <Map className="text-red-600 h-2 w-2" />
                Map View
              </Button>
              <Button
                variant="ghost"
                className="hover:bg-gray-300 cursor-pointer"
                onClick={() => setViewMode("calendar")}
              >
                <CalendarDays className="text-blue-600 h-2 w-2" />
                Calendar View
              </Button>
            </ButtonGroup>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
