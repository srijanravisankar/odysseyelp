"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type CalendarEvent = {
  id: string;
  title: string;
  date: Date; // single-day events
};

type PlannerCalendarProps = {
  /**
   * Events to display on the calendar.
   * You can store them in parent state and pass down.
   */
  events: CalendarEvent[];
  /**
   * Called whenever an event is moved to another day.
   * Use this to sync back to your DB / parent component.
   */
  onEventsChange?: (events: CalendarEvent[]) => void;
  /**
   * Optional initial month to show (defaults to today’s month).
   */
  initialMonth?: Date;
};

export function PlannerCalendar({
  events,
  onEventsChange,
  initialMonth,
}: PlannerCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(() =>
    startOfMonth(initialMonth ?? new Date())
  );

  // Internal copy of events so the calendar can update immediately
  const [internalEvents, setInternalEvents] = useState<CalendarEvent[]>(events);

  // Keep internal events in sync if parent passes new ones
  useEffect(() => {
    setInternalEvents(events);
  }, [events]);

  const today = new Date();

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => startOfMonth(subMonths(prev, 1)));
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => startOfMonth(addMonths(prev, 1)));
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentMonth(startOfMonth(now));
  };

  const monthLabel = format(currentMonth, "MMMM yyyy");

  // Build a 6x7 grid of dates covering the visible calendar
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 }); // Sunday
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 });

    const tempDays: Date[] = [];
    let day = start;
    while (day <= end) {
      tempDays.push(day);
      day = addDays(day, 1);
    }
    return tempDays;
  }, [currentMonth]);

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
    // <div className="flex h-full w-full flex-col rounded-xl border bg-background">
    <div className="absolute inset-0 h-full w-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-3 py-2">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={handlePrevMonth}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={handleNextMonth}
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

        <div className="text-sm font-semibold">{monthLabel}</div>
      </div>

      {/* Weekday row */}
      <div className="grid grid-cols-7 border-b bg-muted/50 text-xs text-muted-foreground">
        {weekdayLabels.map((label) => (
          <div
            key={label}
            className="flex items-center justify-center py-1.5 font-medium"
          >
            {label}
          </div>
        ))}
      </div>

      {/* Month grid */}
      <div className="grid flex-1 grid-cols-7 text-xs">
        {days.map((day) => {
          const dayEvents = internalEvents.filter((event) =>
            isSameDay(event.date, day)
          );

          const isCurrentMonthDay = isSameMonth(day, currentMonth);
          const isTodayDay = isSameDay(day, today);

          const handleDragOver: React.DragEventHandler<HTMLDivElement> = (
            e
          ) => {
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
                "min-h-[5.5rem] border-r border-b p-1 flex flex-col gap-1 overflow-hidden",
                "bg-background",
                !isCurrentMonthDay && "bg-muted/40 text-muted-foreground"
              )}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              {/* Date bubble */}
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                    isTodayDay
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground"
                  )}
                >
                  {day.getDate()}
                </span>
              </div>

              {/* Events list for this day */}
              <div className="flex flex-1 flex-col gap-1 overflow-hidden">
                {dayEvents.map((event) => (
                  <button
                    key={event.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/plain", event.id);
                      e.dataTransfer.effectAllowed = "move";
                    }}
                    className={cn(
                      "w-full truncate rounded-md border px-2 py-0.5 text-left text-[11px] leading-tight",
                      "bg-primary/5 text-foreground hover:bg-primary/10"
                    )}
                  >
                    {event.title}
                  </button>
                ))}
                {dayEvents.length === 0 && (
                  <div className="flex-1" aria-hidden="true" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
