"use client";

import React, { useState } from "react";
import type { DateRange } from "react-day-picker";

import {
  FormInput as Form,
  Send,
  Calendar as CalendarIcon,
  FormInput,
  NotebookPen,
  Filter,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { useItinerary } from "@/components/chat-page/itinerary-context";

// ---------------- Date-range picker (uses shadcn Calendar) -------------------

function formatDate(date?: Date) {
  if (!date) return "";
  return date.toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function SurveyDateRangePicker(props: {
  value: DateRange | undefined;
  onChange: (value: DateRange | undefined) => void;
}) {
  const { value, onChange } = props;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value?.from && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value?.from ? (
            value.to ? (
              <>
                {formatDate(value.from)} – {formatDate(value.to)}
              </>
            ) : (
              formatDate(value.from)
            )
          ) : (
            <span>Select dates</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          numberOfMonths={2}
          selected={value}
          onSelect={onChange}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

// ---------------- Types for the structured survey object --------------------

type TripType = "solo" | "friends" | "family" | "date" | "work";
type NoiseLevel = "chill" | "balanced" | "energetic";
type CrowdLevel = "less_crowded" | "average" | "busy";
type IndoorOutdoor = "indoor" | "outdoor" | "mix";
type AlcoholPref = "no_alcohol" | "okay_with_alcohol" | "must_have_alcohol";

export type SurveyContext = {
  trip: {
    type: TripType;
    vibe: string[];
    occasion: string;
    people: number;
  };
  location: {
    area: string;
    dateRange: { start?: string; end?: string };
    timesOfDay: string[];
  };
  budget: {
    priceLevel: "$" | "$$" | "$$$" | "$$$$";
    perPersonPerDayRange: string;
    transport: string;
    maxTravelMinutes: number;
  };
  food: {
    dietary: string[];
    cuisines: string[];
    alcoholPreference: AlcoholPref;
  };
  preferences: {
    noise: NoiseLevel;
    crowd: CrowdLevel;
    indoorOutdoor: IndoorOutdoor;
    kidFriendly: boolean;
  };
  qualityFilters: {
    minRating: number;
    minReviewCount: number;
    mustTakeReservations: boolean;
  };
  avoid: {
    tags: string[];
    notes: string;
  };
};

// toggle helper for chips
function toggleInArray(
  value: string,
  arr: string[],
  setArr: (v: string[]) => void
) {
  if (arr.includes(value)) {
    setArr(arr.filter((v) => v !== value));
  } else {
    setArr([...arr, value]);
  }
}

// ---------------- Main header component used on /chat -----------------------

export function ChatSurveyHeader() {
  const [dialogOpen, setDialogOpen] = useState(false);

  // search query (right side)
  const [query, setQuery] = useState("");

  // last-saved survey context (so we can pair it with query on send)
  const [savedSurvey, setSavedSurvey] = useState<SurveyContext | null>(null);

  // Trip
  const [tripType, setTripType] = useState<TripType>("date");
  const [tripVibe, setTripVibe] = useState<string[]>(["cozy", "food-focused"]);
  const [tripOccasion, setTripOccasion] = useState("anniversary");
  const [tripPeople, setTripPeople] = useState(2);

  // Location
  const [area, setArea] = useState("Downtown Toronto");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [timesOfDay, setTimesOfDay] = useState<string[]>(["evening"]);

  // Budget
  const [priceLevel, setPriceLevel] = useState<"$" | "$$" | "$$$" | "$$$$">(
    "$$"
  );
  const [perPersonRange, setPerPersonRange] = useState("50-100");
  const [transport, setTransport] = useState("walking");
  const [maxMinutes, setMaxMinutes] = useState(15);

  // Food
  const [dietary, setDietary] = useState<string[]>(["halal", "gluten-free"]);
  const [cuisines, setCuisines] = useState("Middle Eastern, Asian");
  const [alcoholPreference, setAlcoholPreference] =
    useState<AlcoholPref>("no_alcohol");

  // Preferences
  const [noise, setNoise] = useState<NoiseLevel>("chill");
  const [crowd, setCrowd] = useState<CrowdLevel>("less_crowded");
  const [indoorOutdoor, setIndoorOutdoor] = useState<IndoorOutdoor>("mix");
  const [kidFriendly, setKidFriendly] = useState(false);

  // Quality filters
  const [minRating, setMinRating] = useState(4.0);
  const [minReviews, setMinReviews] = useState(50);
  const [mustTakeReservations, setMustTakeReservations] = useState(true);

  // Avoid
  const [avoidTags, setAvoidTags] = useState("nightclubs, tourist_traps");
  const [avoidNotes, setAvoidNotes] = useState("no rooftop bars");

  // ---- helper: build survey context from current state -----------------------

  const buildSurveyContext = (): SurveyContext => {
    const toISODate = (d?: Date) =>
      d ? d.toISOString().slice(0, 10) : undefined;

    return {
      trip: {
        type: tripType,
        vibe: tripVibe,
        occasion: tripOccasion,
        people: tripPeople || 1,
      },
      location: {
        area,
        dateRange: {
          start: toISODate(dateRange?.from),
          end: toISODate(dateRange?.to),
        },
        timesOfDay,
      },
      budget: {
        priceLevel,
        perPersonPerDayRange: perPersonRange,
        transport,
        maxTravelMinutes: maxMinutes || 0,
      },
      food: {
        dietary,
        cuisines: cuisines
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean),
        alcoholPreference,
      },
      preferences: {
        noise,
        crowd,
        indoorOutdoor,
        kidFriendly,
      },
      qualityFilters: {
        minRating,
        minReviewCount: minReviews,
        mustTakeReservations,
      },
      avoid: {
        tags: avoidTags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        notes: avoidNotes,
      },
    };
  };

  // ---- Save survey inside the dialog --------------------------------------

  const handleSaveSurvey = () => {
    const surveyContext = buildSurveyContext();

    try {
      localStorage.setItem("ranger-yelp-survey", JSON.stringify(surveyContext));
      setSavedSurvey(surveyContext);
      console.log("Saved surveyContext", surveyContext);
    } catch (e) {
      console.error("Failed to save survey context", e);
    }

    setDialogOpen(false);
  };

  // ---- When user presses send on the search bar ---------------------------

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setItineraryData } = useItinerary();

  async function handleSend(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); // prevent the form from reloading the page

    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);

    // Example:
    setItineraryData({
      title: "One-Day Seattle Itinerary",
      summary:
        "Discover Seattle's best coffee shops, scenic views, and dining experiences in a single day.",
      date: null,
      center: {
        lat: 47.61777397467515,
        lng: -122.35321090209428,
      },
      stops: [
        {
          id: "stop-1",
          name: "Storyville Coffee Company",
          address: "94 Pike St\nSte 34\nSeattle, WA 98101",
          url: "https://www.yelp.ca/biz/storyville-coffee-company-seattle-9?adjust_creative=6eaRMnBeuAhtxZmiJyu5tA&utm_campaign=yelp_api_v3&utm_medium=api_v3_public_ai_api_chat_v2&utm_source=6eaRMnBeuAhtxZmiJyu5tA",
          rating: 4.5,
          reviewCount: 2535,
          price: "$$",
          openStatus: null,
          phone: "+12067805777",
          coordinates: {
            lat: 47.60895949363687,
            lng: -122.34043157053928,
          },
          category: "Coffee & Tea",
        },
        {
          id: "stop-2",
          name: "Anchorhead Coffee - CenturyLink Plaza",
          address: "1600 7th Ave\nSte 105\nSeattle, WA 98101",
          url: "https://www.yelp.ca/biz/anchorhead-coffee-centurylink-plaza-seattle?adjust_creative=6eaRMnBeuAhtxZmiJyu5tA&utm_campaign=yelp_api_v3&utm_medium=api_v3_public_ai_api_chat_v2&utm_source=6eaRMnBeuAhtxZmiJyu5tA",
          rating: 4.5,
          reviewCount: 1012,
          price: "$$",
          openStatus: null,
          phone: "+12062222222",
          coordinates: {
            lat: 47.6133808022766,
            lng: -122.334691182469,
          },
          category: "Coffee & Tea",
        },
        {
          id: "stop-3",
          name: "Waterfall Garden",
          address: "219 2nd Ave S\nSeattle, WA 98104",
          url: "https://www.yelp.ca/biz/waterfall-garden-seattle?adjust_creative=6eaRMnBeuAhtxZmiJyu5tA&utm_campaign=yelp_api_v3&utm_medium=api_v3_public_ai_api_chat_v2&utm_source=6eaRMnBeuAhtxZmiJyu5tA",
          rating: 4.4,
          reviewCount: 213,
          price: null,
          openStatus: null,
          phone: "+12066246096",
          coordinates: {
            lat: 47.6002476387003,
            lng: -122.332151074236,
          },
          category: "Parks",
        },
        {
          id: "stop-4",
          name: "Discovery Park",
          address: "3801 Discovery Park Blvd\nSeattle, WA 98199",
          url: "https://www.yelp.ca/biz/discovery-park-seattle?adjust_creative=6eaRMnBeuAhtxZmiJyu5tA&utm_campaign=yelp_api_v3&utm_medium=api_v3_public_ai_api_chat_v2&utm_source=6eaRMnBeuAhtxZmiJyu5tA",
          rating: 4.6,
          reviewCount: 487,
          price: null,
          openStatus: null,
          phone: "+12066844075",
          coordinates: {
            lat: 47.66133141343713,
            lng: -122.41714398532145,
          },
          category: "Parks",
        },
        {
          id: "stop-5",
          name: "The Pink Door",
          address: "1919 Post Alley\nSeattle, WA 98101",
          url: "https://www.yelp.ca/biz/the-pink-door-seattle-4?adjust_creative=6eaRMnBeuAhtxZmiJyu5tA&utm_campaign=yelp_api_v3&utm_medium=api_v3_public_ai_api_chat_v2&utm_source=6eaRMnBeuAhtxZmiJyu5tA",
          rating: 4.4,
          reviewCount: 7852,
          price: "$$$",
          openStatus: null,
          phone: "+12064433241",
          coordinates: {
            lat: 47.6103652,
            lng: -122.3425604,
          },
          category: "Italian",
        },
        {
          id: "stop-6",
          name: "Six Seven Restaurant",
          address: "2411 Alaskan Way\nPier 67\nSeattle, WA 98121",
          url: "https://www.yelp.ca/biz/six-seven-restaurant-seattle-3?adjust_creative=6eaRMnBeuAhtxZmiJyu5tA&utm_campaign=yelp_api_v3&utm_medium=api_v3_public_ai_api_chat_v2&utm_source=6eaRMnBeuAhtxZmiJyu5tA",
          rating: 4.1,
          reviewCount: 1392,
          price: "$$$",
          openStatus: null,
          phone: "+12062694575",
          coordinates: {
            lat: 47.6123593,
            lng: -122.3522372,
          },
          category: "New American",
        },
      ],
    });
    return;

    try {
      // ❗ Only include survey if user explicitly saved it
      const payload =
        savedSurvey != null
          ? {
              query: query.trim(),
              survey: savedSurvey,
            }
          : {
              query: query.trim(),
            };

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Error from API:", data);
        // later: show toast
        return;
      }

      console.log("Composed prompt:", data.composedPrompt);
      console.log("Yelp AI response:", data.yelp);
      console.log("Itinerary:", data.itinerary);

      if (data.itinerary) {
        console.log("Setting global itinerary data...");
        setItineraryData(data.itinerary);
      }
    } catch (err) {
      console.error("Network error", err);
    } finally {
      setIsLoading(false);
    }
  }

  // --------------------------- RENDER --------------------------------------

  return (
    <div className="flex w-full items-center gap-3 max-w-4xl mx-auto">
      {/* LEFT: survey dialog trigger */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            className="flex items-center gap-0 rounded-full -mr-2 cursor-pointer"
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Filter className="text-xl" />
              </TooltipTrigger>
              <TooltipContent>Trip Variant</TooltipContent>
            </Tooltip>
            <span className="inline sm:hidden">Trip survey</span>
          </Button>
        </DialogTrigger>

        <DialogContent
          className={cn(
            "max-w-3xl w-[min(100%-2rem,900px)] max-h-[80vh] overflow-y-auto",
            "rounded-2xl border border-border/60 bg-background/80",
            "backdrop-blur-xl shadow-2xl space-y-6"
          )}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Form className="h-4 w-4" />
              Trip survey (optional)
            </DialogTitle>
            <DialogDescription>
              Add a bit of context and we&apos;ll use this later to shape a much
              better Yelp AI itinerary for you.
            </DialogDescription>
          </DialogHeader>

          {/* Trip basics */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold">Trip basics</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs">Trip type</Label>
                <div className="flex flex-wrap gap-2">
                  {["solo", "friends", "family", "date", "work"].map((t) => (
                    <Button
                      key={t}
                      type="button"
                      size="sm"
                      variant={tripType === t ? "default" : "outline"}
                      className="rounded-full text-xs"
                      onClick={() => setTripType(t as TripType)}
                    >
                      {t}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Vibe</Label>
                <div className="flex flex-wrap gap-2">
                  {[
                    "cozy",
                    "food-focused",
                    "adventurous",
                    "romantic",
                    "chill",
                  ].map((v) => (
                    <Button
                      key={v}
                      type="button"
                      size="sm"
                      variant={tripVibe.includes(v) ? "default" : "outline"}
                      className="rounded-full text-xs"
                      onClick={() => toggleInArray(v, tripVibe, setTripVibe)}
                    >
                      {v}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs">Occasion</Label>
                <Input
                  value={tripOccasion}
                  onChange={(e) => setTripOccasion(e.target.value)}
                  placeholder="anniversary, birthday, first date..."
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Number of people</Label>
                <Input
                  type="number"
                  min={1}
                  value={tripPeople}
                  onChange={(e) =>
                    setTripPeople(
                      Number.isNaN(parseInt(e.target.value))
                        ? 1
                        : parseInt(e.target.value)
                    )
                  }
                />
              </div>
            </div>
          </section>

          {/* Location & dates */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold">Location &amp; dates</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs">Area / neighborhood</Label>
                <Input
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="Downtown Toronto, Central Park, etc."
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Date range</Label>
                <SurveyDateRangePicker
                  value={dateRange}
                  onChange={setDateRange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Times of day</Label>
              <div className="flex flex-wrap gap-2">
                {["morning", "afternoon", "evening", "late night"].map((t) => (
                  <Button
                    key={t}
                    type="button"
                    size="sm"
                    variant={timesOfDay.includes(t) ? "default" : "outline"}
                    className="rounded-full text-xs"
                    onClick={() => toggleInArray(t, timesOfDay, setTimesOfDay)}
                  >
                    {t}
                  </Button>
                ))}
              </div>
            </div>
          </section>

          {/* Budget & travel */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold">Budget &amp; travel</h3>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-2">
                <Label className="text-xs">Price level</Label>
                <div className="flex flex-wrap gap-2">
                  {["$", "$$", "$$$", "$$$$"].map((p) => (
                    <Button
                      key={p}
                      type="button"
                      size="sm"
                      variant={priceLevel === p ? "default" : "outline"}
                      className="rounded-full text-xs"
                      onClick={() =>
                        setPriceLevel(p as "$" | "$$" | "$$$" | "$$$$")
                      }
                    >
                      {p}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Per person per day</Label>
                <Input
                  value={perPersonRange}
                  onChange={(e) => setPerPersonRange(e.target.value)}
                  placeholder="e.g. 50-100"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Max travel time (mins)</Label>
                <Input
                  type="number"
                  min={0}
                  value={maxMinutes}
                  onChange={(e) =>
                    setMaxMinutes(
                      Number.isNaN(parseInt(e.target.value))
                        ? 0
                        : parseInt(e.target.value)
                    )
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Transport</Label>
              <div className="flex flex-wrap gap-2">
                {["walking", "public transit", "car", "bike"].map((t) => (
                  <Button
                    key={t}
                    type="button"
                    size="sm"
                    variant={transport === t ? "default" : "outline"}
                    className="rounded-full text-xs"
                    onClick={() => setTransport(t)}
                  >
                    {t}
                  </Button>
                ))}
              </div>
            </div>
          </section>

          {/* Food & dietary */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold">Food &amp; dietary</h3>
            <div className="space-y-2">
              <Label className="text-xs">Dietary needs</Label>
              <div className="flex flex-wrap gap-2">
                {["halal", "kosher", "vegan", "vegetarian", "gluten-free"].map(
                  (d) => (
                    <Button
                      key={d}
                      type="button"
                      size="sm"
                      variant={dietary.includes(d) ? "default" : "outline"}
                      className="rounded-full text-xs"
                      onClick={() => toggleInArray(d, dietary, setDietary)}
                    >
                      {d}
                    </Button>
                  )
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Preferred cuisines</Label>
              <Input
                value={cuisines}
                onChange={(e) => setCuisines(e.target.value)}
                placeholder="e.g. Middle Eastern, Asian"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Alcohol preference</Label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "no_alcohol", label: "No alcohol" },
                  {
                    value: "okay_with_alcohol",
                    label: "Okay with alcohol",
                  },
                  {
                    value: "must_have_alcohol",
                    label: "Must have alcohol",
                  },
                ].map((opt) => (
                  <Button
                    key={opt.value}
                    type="button"
                    size="sm"
                    variant={
                      alcoholPreference === opt.value ? "default" : "outline"
                    }
                    className="rounded-full text-xs"
                    onClick={() =>
                      setAlcoholPreference(opt.value as AlcoholPref)
                    }
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </div>
          </section>

          {/* Vibe preferences */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold">Vibe preferences</h3>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-2">
                <Label className="text-xs">Noise</Label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "chill", label: "Chill" },
                    { value: "balanced", label: "Balanced" },
                    { value: "energetic", label: "Energetic" },
                  ].map((opt) => (
                    <Button
                      key={opt.value}
                      type="button"
                      size="sm"
                      variant={noise === opt.value ? "default" : "outline"}
                      className="rounded-full text-xs"
                      onClick={() => setNoise(opt.value as NoiseLevel)}
                    >
                      {opt.label}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Crowd</Label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "less_crowded", label: "Less crowded" },
                    { value: "average", label: "Average" },
                    { value: "busy", label: "Busy" },
                  ].map((opt) => (
                    <Button
                      key={opt.value}
                      type="button"
                      size="sm"
                      variant={crowd === opt.value ? "default" : "outline"}
                      className="rounded-full text-xs"
                      onClick={() => setCrowd(opt.value as CrowdLevel)}
                    >
                      {opt.label}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Indoor / outdoor</Label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "indoor", label: "Indoor" },
                    { value: "outdoor", label: "Outdoor" },
                    { value: "mix", label: "Mix" },
                  ].map((opt) => (
                    <Button
                      key={opt.value}
                      type="button"
                      size="sm"
                      variant={
                        indoorOutdoor === opt.value ? "default" : "outline"
                      }
                      className="rounded-full text-xs"
                      onClick={() =>
                        setIndoorOutdoor(opt.value as IndoorOutdoor)
                      }
                    >
                      {opt.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-xs">Kid friendly</Label>
                <p className="text-[10px] text-muted-foreground">
                  Include places that work well with kids.
                </p>
              </div>
              <Switch checked={kidFriendly} onCheckedChange={setKidFriendly} />
            </div>
          </section>

          {/* Quality filters */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold">Quality filters</h3>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-2">
                <Label className="text-xs">Min rating</Label>
                <Input
                  type="number"
                  min={1}
                  max={5}
                  step={0.5}
                  value={minRating}
                  onChange={(e) =>
                    setMinRating(
                      Number.isNaN(parseFloat(e.target.value))
                        ? 0
                        : parseFloat(e.target.value)
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Min review count</Label>
                <Input
                  type="number"
                  min={0}
                  value={minReviews}
                  onChange={(e) =>
                    setMinReviews(
                      Number.isNaN(parseInt(e.target.value))
                        ? 0
                        : parseInt(e.target.value)
                    )
                  }
                />
              </div>
              <div className="flex items-center justify-between space-y-0">
                <div className="space-y-0.5">
                  <Label className="text-xs">Must take reservations</Label>
                  <p className="text-[10px] text-muted-foreground">
                    Only suggest places that accept reservations.
                  </p>
                </div>
                <Switch
                  checked={mustTakeReservations}
                  onCheckedChange={setMustTakeReservations}
                />
              </div>
            </div>
          </section>

          {/* Avoid */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold">Avoid</h3>
            <div className="space-y-2">
              <Label className="text-xs">Avoid tags</Label>
              <Input
                value={avoidTags}
                onChange={(e) => setAvoidTags(e.target.value)}
                placeholder="nightclubs, tourist_traps, etc."
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Anything to avoid?</Label>
              <Input
                value={avoidNotes}
                onChange={(e) => setAvoidNotes(e.target.value)}
                placeholder="e.g. no rooftop bars"
              />
            </div>
          </section>

          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveSurvey}>
              Save survey
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* RIGHT: search bar + send (uses savedSurvey when sending) */}
      <form onSubmit={handleSend} className="flex flex-1 items-center gap-3">
        <Input
          type="text"
          placeholder="What do you want to explore!?"
          className="w-full rounded-full"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={isLoading}
        />
        <Button
          type="submit"
          variant="default"
          size="icon-sm"
          className="rounded-full cursor-pointer"
          disabled={isLoading}
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
