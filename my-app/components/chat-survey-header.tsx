"use client";

import React, { useState } from "react";
import type { DateRange } from "react-day-picker";

import {
  Send,
  Calendar as CalendarIcon,
  Filter,
  ChevronLeft,
  ChevronRight,
  Check,
  MapPin,
  Users,
  Utensils,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { useSaveItinerary } from "@/hooks/use-save-itinerary";
import { useChat } from "@/hooks/context/session-context";
import { toast } from "sonner";

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

export type SurveyContext = {
  location: {
    area: string;
    dateRange: { start?: string; end?: string };
  };
  trip: {
    type: TripType;
    people: number;
  };
  budget: {
    priceLevel: "$" | "$$" | "$$$" | "$$$$";
  };
  food: {
    dietary: string[];
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
  { id: 1, title: "Where & When", description: "Location and dates", icon: MapPin },
  { id: 2, title: "Who & Budget", description: "Trip details", icon: Users },
  { id: 3, title: "Food", description: "Dietary needs", icon: Utensils },
] as const;

const TOTAL_STEPS = SURVEY_STEPS.length;

export function ChatSurveyHeader() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // search query (right side)
  const [query, setQuery] = useState("");

  // last-saved survey context (so we can pair it with query on send)
  const [savedSurvey, setSavedSurvey] = useState<SurveyContext | null>(null);

  // Location
  const [area, setArea] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  // Trip
  const [tripType, setTripType] = useState<TripType>("solo");
  const [tripPeople, setTripPeople] = useState(1);

  // Budget
  const [priceLevel, setPriceLevel] = useState<"$" | "$$" | "$$$" | "$$$$">("$$");

  // Food
  const [dietary, setDietary] = useState<string[]>([]);

  const {active, setActive} = useChat();

  // ---- helper: build survey context from current state -----------------------

  const buildSurveyContext = (): SurveyContext => {
    const toISODate = (d?: Date) =>
      d ? d.toISOString().slice(0, 10) : undefined;

    return {
      location: {
        area,
        dateRange: {
          start: toISODate(dateRange?.from),
          end: toISODate(dateRange?.to),
        },
      },
      trip: {
        type: tripType,
        people: tripPeople || 1,
      },
      budget: {
        priceLevel,
      },
      food: {
        dietary,
      },
    };
  };

  // ---- Save survey inside the dialog --------------------------------------

  const handleSaveSurvey = () => {
    const surveyContext = buildSurveyContext();

    try {
      localStorage.setItem("the-odyssey-yelp-survey", JSON.stringify(surveyContext));
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
      localStorage.setItem("the-odyssey-yelp-survey", JSON.stringify(surveyContext));
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
  const { itineraryData, setItineraryData, setIsBuildingItinerary } = useItinerary();
  const { save: saveItinerary } = useSaveItinerary();

  async function handleSend(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); // prevent the form from reloading the page

    // if (!active) {
    //   console.log("Enter a session")
    //   return;
    // }

    if (!query.trim()) return;

    setIsLoading(true);
    setIsBuildingItinerary(true);
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

      if (data.message && data.message === "RETURN") {
        console.log("Received RETURN message from API, not building itinerary.");
        toast.error("Invalid query. Failed to plan trip.");
        return
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
          const result = await saveItinerary(data.itinerary, query, true);
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
      setIsBuildingItinerary(false);
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      // Step 1: Where & When
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Where are you exploring? <span className="text-red-500">*</span>
              </Label>
              <Input
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g. Downtown Toronto, Manhattan, Paris"
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">When? (Optional)</Label>
              <SurveyDateRangePicker
                value={dateRange}
                onChange={setDateRange}
              />
            </div>
          </div>
        );

      // Step 2: Who & Budget
      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Who&apos;s traveling?</Label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "solo", label: "✈️ Solo", icon: "✈️" },
                  { value: "date", label: "💑 Date", icon: "💑" },
                  { value: "friends", label: "👥 Friends", icon: "👥" },
                  { value: "family", label: "👨‍👩‍👧 Family", icon: "👨‍👩‍👧" },
                  { value: "work", label: "💼 Work", icon: "💼" },
                ].map((opt) => (
                  <Button
                    key={opt.value}
                    type="button"
                    size="sm"
                    variant={tripType === opt.value ? "default" : "outline"}
                    className="rounded-full"
                    onClick={() => setTripType(opt.value as TripType)}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
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

            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Budget per person
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
              <p className="text-xs text-muted-foreground">
                $ = Budget-friendly, $$ = Moderate, $$$ = Upscale, $$$$ = Luxury
              </p>
            </div>
          </div>
        );

      // Step 3: Food
      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Any dietary requirements? (Optional)
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

            {/* Summary preview */}
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-2">
              <p className="text-sm font-medium text-primary">
                Almost there! 🎉
              </p>
              <p className="text-xs text-muted-foreground">
                Your preferences will help us create the perfect itinerary for you.
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
          disabled={isLoading || query.trim() === ""}
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
