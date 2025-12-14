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
  ChevronLeft,
  ChevronRight,
  Check,
  MapPin,
  Users,
  DollarSign,
  Utensils,
  Sparkles,
  ShieldCheck,
  Ban,
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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

import { useItinerary } from "@/hooks/context/itinerary-context";
import { saveItineraryToDatabase } from "@/lib/supabase/itinerary-db";
import { useSaveItinerary } from "@/hooks/use-save-itinerary";

import { useChat } from "@/hooks/context/session-context";
import { createChatSession } from "@/lib/supabase/chat-session-db";
import { useSupabase } from "@/hooks/context/supabase-context";

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

// Step definitions for multi-step form
const SURVEY_STEPS = [
  { id: 1, title: "Trip Basics", description: "Who's traveling?", icon: Users },
  { id: 2, title: "Location", description: "Where & when?", icon: MapPin },
  {
    id: 3,
    title: "Budget",
    description: "Your spending range",
    icon: DollarSign,
  },
  {
    id: 4,
    title: "Food & Dietary",
    description: "Dietary preferences",
    icon: Utensils,
  },
  {
    id: 5,
    title: "Vibe",
    description: "Atmosphere preferences",
    icon: Sparkles,
  },
  { id: 6, title: "Quality", description: "Rating filters", icon: ShieldCheck },
  { id: 7, title: "Avoid", description: "Things to skip", icon: Ban },
] as const;

const TOTAL_STEPS = SURVEY_STEPS.length;

export function ChatSurveyHeader() {
  const supabase = useSupabase();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

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

  const {active, setActive} = useChat();

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
    setCurrentStep(1); // Reset to first step when closing
  };

  // ---- Save and continue to next step ------------------------------------
  const handleSaveAndContinue = () => {
    // Save current progress
    const surveyContext = buildSurveyContext();
    try {
      localStorage.setItem("ranger-yelp-survey", JSON.stringify(surveyContext));
      setSavedSurvey(surveyContext);
    } catch (e) {
      console.error("Failed to save survey context", e);
    }

    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSaveSurvey();
    }
  };

  // ---- Navigation helpers ------------------------------------------------
  const goToNextStep = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      // Don't reset step, so user can continue where they left off
    }
  };

  // ---- When user presses send on the search bar ---------------------------

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { itineraryData, setItineraryData } = useItinerary();
  const { save: saveItinerary } = useSaveItinerary();

  async function handleSend(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); // prevent the form from reloading the page

    // if (!active) {
    //   console.log("Enter a session")
    //   return;
    // }

    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);

    // Example:
    // setItineraryData({
    //   title: "One-Day Seattle Itinerary",
    //   summary:
    //     "Discover Seattle's best coffee shops, scenic views, and dining experiences in a single day.",
    //   date: null,
    //   center: {
    //     lat: 47.61777397467515,
    //     lng: -122.35321090209428,
    //   },
    //   stops: [
    //     {
    //       id: "stop-1",
    //       name: "Storyville Coffee Company",
    //       address: "94 Pike St\nSte 34\nSeattle, WA 98101",
    //       url: "https://www.yelp.ca/biz/storyville-coffee-company-seattle-9?adjust_creative=6eaRMnBeuAhtxZmiJyu5tA&utm_campaign=yelp_api_v3&utm_medium=api_v3_public_ai_api_chat_v2&utm_source=6eaRMnBeuAhtxZmiJyu5tA",
    //       rating: 4.5,
    //       reviewCount: 2535,
    //       price: "$$",
    //       openStatus: null,
    //       phone: "+12067805777",
    //       coordinates: {
    //         lat: 47.60895949363687,
    //         lng: -122.34043157053928,
    //       },
    //       category: "Coffee & Tea",
    //     },
    //     {
    //       id: "stop-2",
    //       name: "Anchorhead Coffee - CenturyLink Plaza",
    //       address: "1600 7th Ave\nSte 105\nSeattle, WA 98101",
    //       url: "https://www.yelp.ca/biz/anchorhead-coffee-centurylink-plaza-seattle?adjust_creative=6eaRMnBeuAhtxZmiJyu5tA&utm_campaign=yelp_api_v3&utm_medium=api_v3_public_ai_api_chat_v2&utm_source=6eaRMnBeuAhtxZmiJyu5tA",
    //       rating: 4.5,
    //       reviewCount: 1012,
    //       price: "$$",
    //       openStatus: null,
    //       phone: "+12062222222",
    //       coordinates: {
    //         lat: 47.6133808022766,
    //         lng: -122.334691182469,
    //       },
    //       category: "Coffee & Tea",
    //     },
    //     {
    //       id: "stop-3",
    //       name: "Waterfall Garden",
    //       address: "219 2nd Ave S\nSeattle, WA 98104",
    //       url: "https://www.yelp.ca/biz/waterfall-garden-seattle?adjust_creative=6eaRMnBeuAhtxZmiJyu5tA&utm_campaign=yelp_api_v3&utm_medium=api_v3_public_ai_api_chat_v2&utm_source=6eaRMnBeuAhtxZmiJyu5tA",
    //       rating: 4.4,
    //       reviewCount: 213,
    //       price: null,
    //       openStatus: null,
    //       phone: "+12066246096",
    //       coordinates: {
    //         lat: 47.6002476387003,
    //         lng: -122.332151074236,
    //       },
    //       category: "Parks",
    //     },
    //     {
    //       id: "stop-4",
    //       name: "Discovery Park",
    //       address: "3801 Discovery Park Blvd\nSeattle, WA 98199",
    //       url: "https://www.yelp.ca/biz/discovery-park-seattle?adjust_creative=6eaRMnBeuAhtxZmiJyu5tA&utm_campaign=yelp_api_v3&utm_medium=api_v3_public_ai_api_chat_v2&utm_source=6eaRMnBeuAhtxZmiJyu5tA",
    //       rating: 4.6,
    //       reviewCount: 487,
    //       price: null,
    //       openStatus: null,
    //       phone: "+12066844075",
    //       coordinates: {
    //         lat: 47.66133141343713,
    //         lng: -122.41714398532145,
    //       },
    //       category: "Parks",
    //     },
    //     {
    //       id: "stop-5",
    //       name: "The Pink Door",
    //       address: "1919 Post Alley\nSeattle, WA 98101",
    //       url: "https://www.yelp.ca/biz/the-pink-door-seattle-4?adjust_creative=6eaRMnBeuAhtxZmiJyu5tA&utm_campaign=yelp_api_v3&utm_medium=api_v3_public_ai_api_chat_v2&utm_source=6eaRMnBeuAhtxZmiJyu5tA",
    //       rating: 4.4,
    //       reviewCount: 7852,
    //       price: "$$$",
    //       openStatus: null,
    //       phone: "+12064433241",
    //       coordinates: {
    //         lat: 47.6103652,
    //         lng: -122.3425604,
    //       },
    //       category: "Italian",
    //     },
    //     {
    //       id: "stop-6",
    //       name: "Six Seven Restaurant",
    //       address: "2411 Alaskan Way\nPier 67\nSeattle, WA 98121",
    //       url: "https://www.yelp.ca/biz/six-seven-restaurant-seattle-3?adjust_creative=6eaRMnBeuAhtxZmiJyu5tA&utm_campaign=yelp_api_v3&utm_medium=api_v3_public_ai_api_chat_v2&utm_source=6eaRMnBeuAhtxZmiJyu5tA",
    //       rating: 4.1,
    //       reviewCount: 1392,
    //       price: "$$$",
    //       openStatus: null,
    //       phone: "+12062694575",
    //       coordinates: {
    //         lat: 47.6123593,
    //         lng: -122.3522372,
    //       },
    //       category: "New American",
    //     },
    //   ],
    // });
    // return;

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
        
        console.log("Saving itinerary data to database...");
        console.log(data.itinerary);
        console.log(query);
        
        try {
          const result = await saveItinerary(data.itinerary, query);
          if (result && result.sessionId) {
            setActive(result.sessionId);
            console.log("✅ Session set to:", result.sessionId);
          } else {
            console.warn("⚠️ No sessionId returned from save");
          }
        } catch (dbErr) {
          console.error("Database save failed:", dbErr);
        }

      }
        
      // const mockItinerary = {
      //     title: "One-Day Seattle Itinerary",
      //     summary:
      //       "Discover Seattle's best coffee shops, scenic views, and dining experiences in a single day.",
      //     date: null,
      //     center: {
      //       lat: 47.61777397467515,
      //       lng: -122.35321090209428,
      //     },
      //     stops: [
      //       {
      //         id: "stop-1",
      //         name: "Storyville Coffee Company",
      //         address: "94 Pike St\nSte 34\nSeattle, WA 98101",
      //         url: "https://www.yelp.ca/biz/storyville-coffee-company-seattle-9?adjust_creative=6eaRMnBeuAhtxZmiJyu5tA&utm_campaign=yelp_api_v3&utm_medium=api_v3_public_ai_api_chat_v2&utm_source=6eaRMnBeuAhtxZmiJyu5tA",
      //         rating: 4.5,
      //         reviewCount: 2535,
      //         price: "$$",
      //         openStatus: null,
      //         phone: "+12067805777",
      //         coordinates: {
      //           lat: 47.60895949363687,
      //           lng: -122.34043157053928,
      //         },
      //         category: "Coffee & Tea",
      //       },
      //       {
      //         id: "stop-2",
      //         name: "Anchorhead Coffee - CenturyLink Plaza",
      //         address: "1600 7th Ave\nSte 105\nSeattle, WA 98101",
      //         url: "https://www.yelp.ca/biz/anchorhead-coffee-centurylink-plaza-seattle?adjust_creative=6eaRMnBeuAhtxZmiJyu5tA&utm_campaign=yelp_api_v3&utm_medium=api_v3_public_ai_api_chat_v2&utm_source=6eaRMnBeuAhtxZmiJyu5tA",
      //         rating: 4.5,
      //         reviewCount: 1012,
      //         price: "$$",
      //         openStatus: null,
      //         phone: "+12062222222",
      //         coordinates: {
      //           lat: 47.6133808022766,
      //           lng: -122.334691182469,
      //         },
      //         category: "Coffee & Tea",
      //       },
      //       {
      //         id: "stop-3",
      //         name: "Waterfall Garden",
      //         address: "219 2nd Ave S\nSeattle, WA 98104",
      //         url: "https://www.yelp.ca/biz/waterfall-garden-seattle?adjust_creative=6eaRMnBeuAhtxZmiJyu5tA&utm_campaign=yelp_api_v3&utm_medium=api_v3_public_ai_api_chat_v2&utm_source=6eaRMnBeuAhtxZmiJyu5tA",
      //         rating: 4.4,
      //         reviewCount: 213,
      //         price: null,
      //         openStatus: null,
      //         phone: "+12066246096",
      //         coordinates: {
      //           lat: 47.6002476387003,
      //           lng: -122.332151074236,
      //         },
      //         category: "Parks",
      //       },
      //       {
      //         id: "stop-4",
      //         name: "Discovery Park",
      //         address: "3801 Discovery Park Blvd\nSeattle, WA 98199",
      //         url: "https://www.yelp.ca/biz/discovery-park-seattle?adjust_creative=6eaRMnBeuAhtxZmiJyu5tA&utm_campaign=yelp_api_v3&utm_medium=api_v3_public_ai_api_chat_v2&utm_source=6eaRMnBeuAhtxZmiJyu5tA",
      //         rating: 4.6,
      //         reviewCount: 487,
      //         price: null,
      //         openStatus: null,
      //         phone: "+12066844075",
      //         coordinates: {
      //           lat: 47.66133141343713,
      //           lng: -122.41714398532145,
      //         },
      //         category: "Parks",
      //       },
      //       {
      //         id: "stop-5",
      //         name: "The Pink Door",
      //         address: "1919 Post Alley\nSeattle, WA 98101",
      //         url: "https://www.yelp.ca/biz/the-pink-door-seattle-4?adjust_creative=6eaRMnBeuAhtxZmiJyu5tA&utm_campaign=yelp_api_v3&utm_medium=api_v3_public_ai_api_chat_v2&utm_source=6eaRMnBeuAhtxZmiJyu5tA",
      //         rating: 4.4,
      //         reviewCount: 7852,
      //         price: "$$$",
      //         openStatus: null,
      //         phone: "+12064433241",
      //         coordinates: {
      //           lat: 47.6103652,
      //           lng: -122.3425604,
      //         },
      //         category: "Italian",
      //       },
      //       {
      //         id: "stop-6",
      //         name: "Six Seven Restaurant",
      //         address: "2411 Alaskan Way\nPier 67\nSeattle, WA 98121",
      //         url: "https://www.yelp.ca/biz/six-seven-restaurant-seattle-3?adjust_creative=6eaRMnBeuAhtxZmiJyu5tA&utm_campaign=yelp_api_v3&utm_medium=api_v3_public_ai_api_chat_v2&utm_source=6eaRMnBeuAhtxZmiJyu5tA",
      //         rating: 4.1,
      //         reviewCount: 1392,
      //         price: "$$$",
      //         openStatus: null,
      //         phone: "+12062694575",
      //         coordinates: {
      //           lat: 47.6123593,
      //           lng: -122.3522372,
      //         },
      //         category: "New American",
      //       },
      //     ],
      //   }

      // if (true) {
      //   console.log("Setting global itinerary data...");
      //   setItineraryData(mockItinerary);

      //   console.log("Saving itinerary data to database...");
      //   // await saveItinerary(data.itinerary, query);
      //   await saveItinerary(mockItinerary, query);
      // }
    } catch (err) {
      console.error("Network error", err);
    } finally {
      setIsLoading(false);
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Who&apos;s going on this trip?
              </Label>
              <div className="flex flex-wrap gap-2">
                {["solo", "friends", "family", "date", "work"].map((t) => (
                  <Button
                    key={t}
                    type="button"
                    size="sm"
                    variant={tripType === t ? "default" : "outline"}
                    className="rounded-full capitalize"
                    onClick={() => setTripType(t as TripType)}
                  >
                    {t}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">
                What vibe are you looking for?
              </Label>
              <div className="flex flex-wrap gap-2">
                {[
                  "cozy",
                  "food-focused",
                  "adventurous",
                  "romantic",
                  "chill",
                  "lively",
                  "cultural",
                ].map((v) => (
                  <Button
                    key={v}
                    type="button"
                    size="sm"
                    variant={tripVibe.includes(v) ? "default" : "outline"}
                    className="rounded-full capitalize"
                    onClick={() => toggleInArray(v, tripVibe, setTripVibe)}
                  >
                    {v}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Special occasion?</Label>
                <Input
                  value={tripOccasion}
                  onChange={(e) => setTripOccasion(e.target.value)}
                  placeholder="anniversary, birthday, first date..."
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Number of people</Label>
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
                  className="h-10"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Where are you exploring?
              </Label>
              <Input
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="Downtown Toronto, Central Park, etc."
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">When?</Label>
              <SurveyDateRangePicker
                value={dateRange}
                onChange={setDateRange}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">What time of day?</Label>
              <div className="flex flex-wrap gap-2">
                {["morning", "afternoon", "evening", "late night"].map((t) => (
                  <Button
                    key={t}
                    type="button"
                    size="sm"
                    variant={timesOfDay.includes(t) ? "default" : "outline"}
                    className="rounded-full capitalize"
                    onClick={() => toggleInArray(t, timesOfDay, setTimesOfDay)}
                  >
                    {t}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Price range preference
              </Label>
              <div className="flex flex-wrap gap-2">
                {["$", "$$", "$$$", "$$$$"].map((p) => (
                  <Button
                    key={p}
                    type="button"
                    size="sm"
                    variant={priceLevel === p ? "default" : "outline"}
                    className="rounded-full min-w-12"
                    onClick={() =>
                      setPriceLevel(p as "$" | "$$" | "$$$" | "$$$$")
                    }
                  >
                    {p}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Budget per person per day
                </Label>
                <Input
                  value={perPersonRange}
                  onChange={(e) => setPerPersonRange(e.target.value)}
                  placeholder="e.g. 50-100"
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Max travel time (minutes)
                </Label>
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
                  className="h-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">
                How will you get around?
              </Label>
              <div className="flex flex-wrap gap-2">
                {["walking", "public transit", "car", "bike"].map((t) => (
                  <Button
                    key={t}
                    type="button"
                    size="sm"
                    variant={transport === t ? "default" : "outline"}
                    className="rounded-full capitalize"
                    onClick={() => setTransport(t)}
                  >
                    {t}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Any dietary requirements?
              </Label>
              <div className="flex flex-wrap gap-2">
                {[
                  "halal",
                  "kosher",
                  "vegan",
                  "vegetarian",
                  "gluten-free",
                  "dairy-free",
                  "nut-free",
                ].map((d) => (
                  <Button
                    key={d}
                    type="button"
                    size="sm"
                    variant={dietary.includes(d) ? "default" : "outline"}
                    className="rounded-full capitalize"
                    onClick={() => toggleInArray(d, dietary, setDietary)}
                  >
                    {d}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Cuisine preferences</Label>
              <Input
                value={cuisines}
                onChange={(e) => setCuisines(e.target.value)}
                placeholder="e.g. Middle Eastern, Asian, Italian"
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Alcohol preference</Label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "no_alcohol", label: "No alcohol" },
                  { value: "okay_with_alcohol", label: "Okay with alcohol" },
                  { value: "must_have_alcohol", label: "Must have drinks 🍷" },
                ].map((opt) => (
                  <Button
                    key={opt.value}
                    type="button"
                    size="sm"
                    variant={
                      alcoholPreference === opt.value ? "default" : "outline"
                    }
                    className="rounded-full"
                    onClick={() =>
                      setAlcoholPreference(opt.value as AlcoholPref)
                    }
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Noise level</Label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "chill", label: "🧘 Chill & quiet" },
                  { value: "balanced", label: "⚖️ Balanced" },
                  { value: "energetic", label: "🎉 Energetic" },
                ].map((opt) => (
                  <Button
                    key={opt.value}
                    type="button"
                    size="sm"
                    variant={noise === opt.value ? "default" : "outline"}
                    className="rounded-full"
                    onClick={() => setNoise(opt.value as NoiseLevel)}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Crowd preference</Label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "less_crowded", label: "Less crowded" },
                  { value: "average", label: "Average" },
                  { value: "busy", label: "Don't mind busy" },
                ].map((opt) => (
                  <Button
                    key={opt.value}
                    type="button"
                    size="sm"
                    variant={crowd === opt.value ? "default" : "outline"}
                    className="rounded-full"
                    onClick={() => setCrowd(opt.value as CrowdLevel)}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Indoor or outdoor?</Label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "indoor", label: "🏠 Indoor" },
                  { value: "outdoor", label: "🌳 Outdoor" },
                  { value: "mix", label: "🔄 Mix of both" },
                ].map((opt) => (
                  <Button
                    key={opt.value}
                    type="button"
                    size="sm"
                    variant={
                      indoorOutdoor === opt.value ? "default" : "outline"
                    }
                    className="rounded-full"
                    onClick={() => setIndoorOutdoor(opt.value as IndoorOutdoor)}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Kid friendly</Label>
                <p className="text-xs text-muted-foreground">
                  Include places suitable for children
                </p>
              </div>
              <Switch checked={kidFriendly} onCheckedChange={setKidFriendly} />
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Minimum rating</Label>
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
                  className="h-10"
                />
                <p className="text-xs text-muted-foreground">
                  Only show places rated {minRating}+ stars
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Minimum reviews</Label>
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
                  className="h-10"
                />
                <p className="text-xs text-muted-foreground">
                  At least {minReviews} reviews
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">
                  Reservations required
                </Label>
                <p className="text-xs text-muted-foreground">
                  Only show places that take reservations
                </p>
              </div>
              <Switch
                checked={mustTakeReservations}
                onCheckedChange={setMustTakeReservations}
              />
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Types of places to avoid
              </Label>
              <Input
                value={avoidTags}
                onChange={(e) => setAvoidTags(e.target.value)}
                placeholder="e.g. nightclubs, tourist traps, fast food"
                className="h-10"
              />
              <p className="text-xs text-muted-foreground">
                Separate with commas
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Anything else to avoid?
              </Label>
              <Input
                value={avoidNotes}
                onChange={(e) => setAvoidNotes(e.target.value)}
                placeholder="e.g. no rooftop bars, avoid chain restaurants"
                className="h-10"
              />
            </div>

            {/* Summary preview */}
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-2">
              <p className="text-sm font-medium text-primary">
                Survey Complete! 🎉
              </p>
              <p className="text-xs text-muted-foreground">
                Your preferences will be used to personalize your itinerary
                recommendations. You can always come back and update these
                settings.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const currentStepData = SURVEY_STEPS.find((s) => s.id === currentStep)!;
  const StepIcon = currentStepData.icon;
  const progressPercentage = (currentStep / TOTAL_STEPS) * 100;

  return (
    <div className="flex w-full items-center gap-3 max-w-4xl mx-auto">
      {/* LEFT: survey dialog trigger */}
      <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "flex items-center gap-2 rounded-full -mr-2 cursor-pointer",
              savedSurvey && "text-primary"
            )}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative">
                  <Filter className="h-5 w-5" />
                  {savedSurvey && (
                    <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary" />
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {savedSurvey
                  ? "Survey saved - Click to edit"
                  : "Add trip preferences"}
              </TooltipContent>
            </Tooltip>
            <span className="hidden sm:inline text-sm">
              {savedSurvey ? "Survey ✓" : "Filters"}
            </span>
          </Button>
        </DialogTrigger>

        <DialogContent
          className={cn(
            "max-w-lg w-[min(100%-2rem,520px)] p-0 gap-0",
            "rounded-2xl border border-border/60 bg-background/95",
            "backdrop-blur-xl shadow-2xl overflow-hidden"
          )}
        >
          {/* Header with progress */}
          <div className="px-6 pt-6 pb-4 border-b bg-muted/30">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <StepIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-base font-semibold">
                    {currentStepData.title}
                  </DialogTitle>
                  <DialogDescription className="text-xs">
                    {currentStepData.description}
                  </DialogDescription>
                </div>
              </div>
              <Badge variant="secondary" className="text-xs">
                {currentStep} / {TOTAL_STEPS}
              </Badge>
            </div>

            {/* Progress bar */}
            <Progress value={progressPercentage} className="h-1.5" />

            {/* Step indicators */}
            <div className="flex justify-between mt-3">
              {SURVEY_STEPS.map((step) => {
                const Icon = step.icon;
                const isActive = step.id === currentStep;
                const isCompleted = step.id < currentStep;
                return (
                  <button
                    key={step.id}
                    onClick={() => setCurrentStep(step.id)}
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full transition-all",
                      isActive &&
                        "bg-primary text-primary-foreground scale-110",
                      isCompleted && "bg-primary/20 text-primary",
                      !isActive &&
                        !isCompleted &&
                        "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step content */}
          <div className="px-6 py-6 min-h-80">{renderStepContent()}</div>

          {/* Footer with navigation */}
          <div className="px-6 py-4 border-t bg-muted/30 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={goToPrevStep}
                  className="gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSaveSurvey}
              >
                Save & Close
              </Button>

              {currentStep < TOTAL_STEPS ? (
                <Button
                  type="button"
                  size="sm"
                  onClick={goToNextStep}
                  className="gap-1"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSaveSurvey}
                  className="gap-1"
                >
                  <Check className="h-4 w-4" />
                  Complete
                </Button>
              )}
            </div>
          </div>
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
