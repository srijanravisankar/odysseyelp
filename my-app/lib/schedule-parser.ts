import { parse, set } from "date-fns";

// Define the shape of your API response stop
type ItineraryStop = {
  id: string;
  name: string;
  schedule: {
    start: string; // "09:00 AM"
    end: string;
    durationMinutes: number;
  } | null;
};

export function mapItineraryToCalendarEvents(
  stops: ItineraryStop[],
  baseDate: Date
): any[] {
  if (!stops) return [];

  // Sort stops by time first (optional but good for display)
  // We can just rely on the order provided by Gemini usually

  return stops.map((stop) => {
    // 1. Parse the time string "09:00 AM"
    // We use the baseDate to establish the day, month, and year
    let eventDate = baseDate;
    let timeLabel = "";

    if (stop.schedule?.start) {
      try {
        // Parse "09:00 AM" against the reference date
        const parsedTime = parse(stop.schedule.start, "hh:mm aa", baseDate);
        
        // Check if valid
        if (!isNaN(parsedTime.getTime())) {
          eventDate = parsedTime;
          // Create a short label for the UI, e.g. "9a" or "9:00"
          timeLabel = stop.schedule.start.replace(" AM", "a").replace(" PM", "p").toLowerCase();
        }
      } catch (e) {
        console.error("Failed to parse time:", stop.schedule.start);
      }
    }

    // 2. Return the format PlannerCalendar expects
    return {
      id: stop.id,
      title: timeLabel ? `${timeLabel} ${stop.name}` : stop.name, // "9:00a Jardin St James"
      date: eventDate,
    };
  });
}