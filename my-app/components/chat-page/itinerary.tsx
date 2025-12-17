"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ItineraryScrollArea } from "./itinerary-scroll-area";
import { TouringMap } from "@/components/touring-map";
import { ButtonGroup } from "@/components/ui/button-group";
import { Button } from "../ui/button";
import { CircleCheckBig, SquarePen, Map, CalendarDays, Heart, Earth, MapPin } from "lucide-react";
import {
  PlannerCalendar,
  type CalendarEvent,
} from "@/components/planner-calendar";

import { useItinerary } from '@/hooks/context/itinerary-context'
import { EmptyItinerariesPage } from "./empty-itineraries-page";

import { mapItineraryToCalendarEvents } from "@/lib/schedule-parser";
import { useUser } from "@/hooks/context/user-context";
import { useChat } from "@/hooks/context/session-context";
import { cn } from "@/lib/utils";
import { it } from "node:test";

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

  const locationName = itineraryData?.stops?.location;

  // console.log("ItineraryData in Itinerary component:", itineraryData);
  return (
    <Card className="flex flex-row p-0 bg-muted/50 h-full overflow-hidden">
      <CardContent className="flex flex-col flex-1 min-h-0 pr-2 pl-2 pt-2 pb-2 overflow-y-auto w-50">
        {itineraries.length === 0 ? <EmptyItinerariesPage /> : <ItineraryScrollArea />}

        <div className={cn("w-full flex justify-between items-center shrink-0 pt-2 px-1", itineraries.length === 0 ? "invisible" : "")}>
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
             {locationName ? (
               <>
                <Button className="flex items-center gap-2 rounded-full text-xs h-6 w-auto" variant="outline" size="sm">
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-200 opacity-25"></span>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-50"></span>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span>{locationName}</span>
                </Button>
               </>
             ) : (
              <>
                <Button className="flex items-center gap-2 rounded-full text-xs h-6 w-auto" variant="outline" size="sm">
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gray-200 opacity-25"></span>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gray-300 opacity-50"></span>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gray-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-gray-500"></span>
                  </span>
                  <span>Location not detected</span>
                </Button>
              </>
             )}
          </div>

          {/* <div className={cn("flex items-center gap-1", itineraries.length === 0 ? "invisible" : "")}>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className={cn(
                "h-7 w-7 p-0 transition",
                // isLiked
                //   ? "text-red-500 hover:text-red-500 hover:bg-red-500/10"
                //   : "hover:text-red-500"
              )}
              onClick={(e) => {
                e.stopPropagation()
                // onToggleLike?.()
              }}
            >
              <Heart
                className={cn(
                  "h-4 w-4",
                  // isLiked ? "fill-red-500" : "fill-none"
                )}
              />
            </Button>

            <Button
              type="button"
              size="icon"
              variant="ghost"
              className={cn(
                "h-7 w-7 p-0 transition",
                // isPublished
                //   ? "text-emerald-500 hover:text-emerald-500 hover:bg-emerald-500/10"
                //   : "hover:text-emerald-500"
              )}
              onClick={(e) => {
                e.stopPropagation()
                // setPublishDialogOpen(true)
              }}
            >
              <Earth className="h-4 w-4" />
            </Button>
          </div> */}
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
