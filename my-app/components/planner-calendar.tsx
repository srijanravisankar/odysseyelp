"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addDays,
  addWeeks,
  format,
  isSameDay,
  startOfWeek,
  subWeeks,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type CalendarEvent = {
  id: string;
  title: string;
  date: Date;
  startTime?: string;
  endTime?: string;
  durationMinutes?: number;
};

type PlannerCalendarProps = {
  events: CalendarEvent[];
  onEventsChange?: (events: CalendarEvent[]) => void;
  initialMonth?: Date;
};

export function PlannerCalendar({
  events,
  onEventsChange,
  initialMonth,
}: PlannerCalendarProps) {
  // Start with the week containing the initial date (or today)
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() =>
    startOfWeek(initialMonth ?? new Date(), { weekStartsOn: 0 }) // Sunday
  );

  const [internalEvents, setInternalEvents] = useState<CalendarEvent[]>(events);

  useEffect(() => {
    setInternalEvents(events);
  }, [events]);

  const today = new Date();

  const handlePrevWeek = () => {
    setCurrentWeekStart((prev) => startOfWeek(subWeeks(prev, 1), { weekStartsOn: 0 }));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart((prev) => startOfWeek(addWeeks(prev, 1), { weekStartsOn: 0 }));
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentWeekStart(startOfWeek(now, { weekStartsOn: 0 }));
  };

  // Build array of 7 days in the current week
  const days = useMemo(() => {
    const tempDays: Date[] = [];
    for (let i = 0; i < 7; i++) {
      tempDays.push(addDays(currentWeekStart, i));
    }
    return tempDays;
  }, [currentWeekStart]);

  const weekLabel = `${format(days[0], "MMM d")} - ${format(days[6], "MMM d, yyyy")}`;

  const handleDropOnDate = (targetDate: Date, eventId: string) => {
    setInternalEvents((prev) => {
      const updated = prev.map((event) =>
        event.id === eventId ? { ...event, date: targetDate } : event
      );
      onEventsChange?.(updated);
      return updated;
    });
  };

  const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="absolute inset-0 h-full w-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-3 py-2 shrink-0">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={handlePrevWeek}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={handleNextWeek}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="ml-1"
            onClick={handleToday}
          >
            Today
          </Button>
        </div>

        <div className="text-sm font-semibold">{weekLabel}</div>
      </div>

      {/* Week grid */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {days.map((day, dayIndex) => {
          const dayEvents = internalEvents.filter((event) =>
            isSameDay(event.date, day)
          );

          const isTodayDay = isSameDay(day, today);

          const handleDragOver: React.DragEventHandler<HTMLDivElement> = (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
          };

          const handleDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
            e.preventDefault();
            const eventId = e.dataTransfer.getData("text/plain");
            if (!eventId) return;
            handleDropOnDate(day, eventId);
          };

          return (
            <div
              key={day.toISOString()}
              className={cn(
                "flex flex-col flex-1 border-r min-h-0",
                dayIndex === 6 && "border-r-0" // No border on last day
              )}
            >
              {/* Day header */}
              <div
                className={cn(
                  "flex flex-col items-center justify-center py-2 border-b shrink-0",
                  isTodayDay ? "bg-primary/10" : "bg-muted/50"
                )}
              >
                <span className="text-xs font-medium text-muted-foreground">
                  {weekdayLabels[dayIndex]}
                </span>
                <span
                  className={cn(
                    "inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold",
                    isTodayDay
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground"
                  )}
                >
                  {day.getDate()}
                </span>
              </div>

              {/* Events for the day */}
              <div
                className="flex-1 overflow-y-auto p-1 flex flex-col gap-1"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                {dayEvents.length > 0 ? (
                  dayEvents.map((event) => (
                    <button
                      key={event.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", event.id);
                        e.dataTransfer.effectAllowed = "move";
                      }}
                      className={cn(
                        "w-full rounded-md border px-2 py-1 text-left text-[10px] leading-tight",
                        "bg-primary/5 text-foreground hover:bg-primary/10 transition-colors",
                        "flex flex-col gap-0.5"
                      )}
                    >
                      <div className="font-semibold truncate">{event.title}</div>
                      {event.startTime && (
                        <div className="text-[9px] text-muted-foreground">
                          {event.startTime}
                          {event.endTime && ` - ${event.endTime}`}
                        </div>
                      )}
                    </button>
                  ))
                ) : (
                  <div className="text-center text-xs text-muted-foreground py-2">
                    No events
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}