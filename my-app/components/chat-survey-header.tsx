"use client"

import React, { useState } from "react"
import type { DateRange } from "react-day-picker"

// 👇 alias FormInput to Form so you can use <Form />
import { FormInput as Form, Send, Calendar as CalendarIcon } from "lucide-react"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

// ---------------- Date-range picker (uses shadcn Calendar) -------------------

function formatDate(date?: Date) {
    if (!date) return ""
    return date.toLocaleDateString("en-CA", {
        year: "numeric",
        month: "short",
        day: "numeric",
    })
}

function SurveyDateRangePicker(props: {
    value: DateRange | undefined
    onChange: (value: DateRange | undefined) => void
}) {
    const { value, onChange } = props

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
    )
}

// ---------------- Types for the structured survey object --------------------

type TripType = "solo" | "friends" | "family" | "date" | "work"
type NoiseLevel = "chill" | "balanced" | "energetic"
type CrowdLevel = "less_crowded" | "average" | "busy"
type IndoorOutdoor = "indoor" | "outdoor" | "mix"
type AlcoholPref = "no_alcohol" | "okay_with_alcohol" | "must_have_alcohol"

type SurveyContext = {
    trip: {
        type: TripType
        vibe: string[]
        occasion: string
        people: number
    }
    location: {
        area: string
        dateRange: { start?: string; end?: string }
        timesOfDay: string[]
    }
    budget: {
        priceLevel: "$" | "$$" | "$$$" | "$$$$"
        perPersonPerDayRange: string
        transport: string
        maxTravelMinutes: number
    }
    food: {
        dietary: string[]
        cuisines: string[]
        alcoholPreference: AlcoholPref
    }
    preferences: {
        noise: NoiseLevel
        crowd: CrowdLevel
        indoorOutdoor: IndoorOutdoor
        kidFriendly: boolean
    }
    qualityFilters: {
        minRating: number
        minReviewCount: number
        mustTakeReservations: boolean
    }
    avoid: {
        tags: string[]
        notes: string
    }
}

// toggle helper for chips
function toggleInArray(value: string, arr: string[], setArr: (v: string[]) => void) {
    if (arr.includes(value)) {
        setArr(arr.filter((v) => v !== value))
    } else {
        setArr([...arr, value])
    }
}

// ---------------- Main header component used on /chat -----------------------

export function ChatSurveyHeader() {
    const [dialogOpen, setDialogOpen] = useState(false)

    // search query (right side)
    const [query, setQuery] = useState("")

    // last-saved survey context (so we can pair it with query on send)
    const [savedSurvey, setSavedSurvey] = useState<SurveyContext | null>(null)

    // Trip
    const [tripType, setTripType] = useState<TripType>("date")
    const [tripVibe, setTripVibe] = useState<string[]>(["cozy", "food-focused"])
    const [tripOccasion, setTripOccasion] = useState("anniversary")
    const [tripPeople, setTripPeople] = useState(2)

    // Location
    const [area, setArea] = useState("Downtown Toronto")
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
    const [timesOfDay, setTimesOfDay] = useState<string[]>(["evening"])

    // Budget
    const [priceLevel, setPriceLevel] = useState<"$" | "$$" | "$$$" | "$$$$">("$$")
    const [perPersonRange, setPerPersonRange] = useState("50-100")
    const [transport, setTransport] = useState("walking")
    const [maxMinutes, setMaxMinutes] = useState(15)

    // Food
    const [dietary, setDietary] = useState<string[]>(["halal", "gluten-free"])
    const [cuisines, setCuisines] = useState("Middle Eastern, Asian")
    const [alcoholPreference, setAlcoholPreference] =
        useState<AlcoholPref>("no_alcohol")

    // Preferences
    const [noise, setNoise] = useState<NoiseLevel>("chill")
    const [crowd, setCrowd] = useState<CrowdLevel>("less_crowded")
    const [indoorOutdoor, setIndoorOutdoor] = useState<IndoorOutdoor>("mix")
    const [kidFriendly, setKidFriendly] = useState(false)

    // Quality filters
    const [minRating, setMinRating] = useState(4.0)
    const [minReviews, setMinReviews] = useState(50)
    const [mustTakeReservations, setMustTakeReservations] = useState(true)

    // Avoid
    const [avoidTags, setAvoidTags] = useState("nightclubs, tourist_traps")
    const [avoidNotes, setAvoidNotes] = useState("no rooftop bars")

    // ---- Save survey inside the dialog --------------------------------------

    const handleSaveSurvey = () => {
        const toISODate = (d?: Date) => (d ? d.toISOString().slice(0, 10) : undefined)

        const surveyContext: SurveyContext = {
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
        }

        try {
            localStorage.setItem("ranger-yelp-survey", JSON.stringify(surveyContext))
            setSavedSurvey(surveyContext)
            console.log("Saved surveyContext", surveyContext)
        } catch (e) {
            console.error("Failed to save survey context", e)
        }

        setDialogOpen(false)
    }

    // ---- When user presses send on the search bar ---------------------------

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault()

        const payload = {
            query: query.trim(),
            survey: savedSurvey, // can be null if they never saved the survey
        }

        try {
            localStorage.setItem("ranger-yelp-last-request", JSON.stringify(payload))
            console.log("Saved last request payload", payload)
        } catch (err) {
            console.error("Failed to save last request payload", err)
        }

        // you can clear query if you want
        // setQuery("")
    }

    // --------------------------- RENDER --------------------------------------

    return (
        <div className="flex w-full items-center gap-3 max-w-4xl mx-auto">
            {/* LEFT: survey dialog trigger */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                    <Button
                        type="button"
                        variant="outline"
                        className="flex items-center gap-2 rounded-full px-3 py-1 text-xs sm:text-sm"
                    >
                        {/* use the aliased Form icon here */}
                        <Form className="h-4 w-4" />
                        <span className="hidden sm:inline">
              Add more info for accurate results
            </span>
                        <span className="inline sm:hidden">Trip survey</span>
                    </Button>
                </DialogTrigger>

                <DialogContent
                    className={cn(
                        // square-ish glassy dialog
                        "max-w-3xl w-[min(100%-2rem,900px)] max-h-[80vh] overflow-y-auto scrollbar-hide",
                        "rounded-2xl border border-border/60 bg-background/80",
                        "backdrop-blur-xl shadow-2xl"
                    )}
                >
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {/* and here */}
                            <Form className="h-4 w-4" />
                            Trip survey (optional)
                        </DialogTitle>
                        <DialogDescription>
                            Add a bit of context and we&apos;ll use this later to shape a much
                            better Yelp AI itinerary for you.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="mt-1 space-y-6 text-sm">
                        {/* Trip basics */}
                        <section className="space-y-3">
                            <h3 className="text-xs font-semibold uppercase text-muted-foreground">
                                Trip basics
                            </h3>

                            {/* Trip type */}
                            <div className="space-y-1">
                                <Label className="text-xs">Trip type</Label>
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        { value: "solo", label: "Solo" },
                                        { value: "friends", label: "Friends" },
                                        { value: "family", label: "Family" },
                                        { value: "date", label: "Date" },
                                        { value: "work", label: "Work" },
                                    ].map((opt) => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setTripType(opt.value as TripType)}
                                            className={cn(
                                                "rounded-full border px-3 py-1 text-xs",
                                                tripType === opt.value
                                                    ? "bg-primary text-primary-foreground border-primary"
                                                    : "bg-background hover:bg-muted"
                                            )}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Trip vibe */}
                            <div className="space-y-1">
                                <Label className="text-xs">Trip vibe (pick a few)</Label>
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        "cozy",
                                        "food-focused",
                                        "nightlife",
                                        "touristy",
                                        "nature",
                                        "romantic",
                                    ].map((tag) => (
                                        <button
                                            key={tag}
                                            type="button"
                                            onClick={() => toggleInArray(tag, tripVibe, setTripVibe)}
                                            className={cn(
                                                "rounded-full border px-3 py-1 text-xs capitalize",
                                                tripVibe.includes(tag)
                                                    ? "bg-primary/10 border-primary text-primary"
                                                    : "bg-background hover:bg-muted"
                                            )}
                                        >
                                            {tag.replace("-", " ")}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Occasion + people */}
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div className="space-y-1">
                                    <Label className="text-xs">Occasion</Label>
                                    <Input
                                        placeholder="anniversary, birthday, just for fun..."
                                        value={tripOccasion}
                                        onChange={(e) => setTripOccasion(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Number of people</Label>
                                    <Input
                                        type="number"
                                        min={1}
                                        value={tripPeople}
                                        onChange={(e) =>
                                            setTripPeople(Number(e.target.value) || 1)
                                        }
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Location & dates */}
                        <section className="space-y-3">
                            <h3 className="text-xs font-semibold uppercase text-muted-foreground">
                                Location & dates
                            </h3>

                            <div className="space-y-1">
                                <Label className="text-xs">Area</Label>
                                <Input
                                    placeholder="Downtown Toronto, Kensington, etc."
                                    value={area}
                                    onChange={(e) => setArea(e.target.value)}
                                />
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs">Date range</Label>
                                <SurveyDateRangePicker
                                    value={dateRange}
                                    onChange={setDateRange}
                                />
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs">Preferred time of day</Label>
                                <div className="flex flex-wrap gap-2">
                                    {["morning", "afternoon", "evening", "late night"].map(
                                        (t) => (
                                            <button
                                                key={t}
                                                type="button"
                                                onClick={() =>
                                                    toggleInArray(t, timesOfDay, setTimesOfDay)
                                                }
                                                className={cn(
                                                    "rounded-full border px-3 py-1 text-xs capitalize",
                                                    timesOfDay.includes(t)
                                                        ? "bg-primary/10 border-primary text-primary"
                                                        : "bg-background hover:bg-muted"
                                                )}
                                            >
                                                {t}
                                            </button>
                                        )
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* Budget & travel */}
                        <section className="space-y-3">
                            <h3 className="text-xs font-semibold uppercase text-muted-foreground">
                                Budget & travel
                            </h3>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div className="space-y-1">
                                    <Label className="text-xs">Price level</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {["$", "$$", "$$$", "$$$$"].map((p) => (
                                            <button
                                                key={p}
                                                type="button"
                                                onClick={() =>
                                                    setPriceLevel(p as "$" | "$$" | "$$$" | "$$$$")
                                                }
                                                className={cn(
                                                    "rounded-full border px-3 py-1 text-xs",
                                                    priceLevel === p
                                                        ? "bg-primary text-primary-foreground border-primary"
                                                        : "bg-background hover:bg-muted"
                                                )}
                                            >
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-xs">
                                        Budget per person per day (CAD)
                                    </Label>
                                    <Input
                                        placeholder="e.g. 50-100"
                                        value={perPersonRange}
                                        onChange={(e) => setPerPersonRange(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div className="space-y-1">
                                    <Label className="text-xs">Transport</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {["walking", "transit", "driving", "rideshare"].map(
                                            (mode) => (
                                                <button
                                                    key={mode}
                                                    type="button"
                                                    onClick={() => setTransport(mode)}
                                                    className={cn(
                                                        "rounded-full border px-3 py-1 text-xs capitalize",
                                                        transport === mode
                                                            ? "bg-primary/10 border-primary text-primary"
                                                            : "bg-background hover:bg-muted"
                                                    )}
                                                >
                                                    {mode}
                                                </button>
                                            )
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-xs">
                                        Max travel time between stops (mins)
                                    </Label>
                                    <Input
                                        type="number"
                                        min={0}
                                        value={maxMinutes}
                                        onChange={(e) =>
                                            setMaxMinutes(Number(e.target.value) || 0)
                                        }
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Food & dietary */}
                        <section className="space-y-3">
                            <h3 className="text-xs font-semibold uppercase text-muted-foreground">
                                Food & dietary
                            </h3>

                            <div className="space-y-1">
                                <Label className="text-xs">Dietary restrictions</Label>
                                <div className="flex flex-wrap gap-2">
                                    {["halal", "gluten-free", "vegetarian", "vegan"].map(
                                        (tag) => (
                                            <button
                                                key={tag}
                                                type="button"
                                                onClick={() => toggleInArray(tag, dietary, setDietary)}
                                                className={cn(
                                                    "rounded-full border px-3 py-1 text-xs capitalize",
                                                    dietary.includes(tag)
                                                        ? "bg-primary/10 border-primary text-primary"
                                                        : "bg-background hover:bg-muted"
                                                )}
                                            >
                                                {tag}
                                            </button>
                                        )
                                    )}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs">Preferred cuisines</Label>
                                <Input
                                    placeholder="e.g. Middle Eastern, Asian"
                                    value={cuisines}
                                    onChange={(e) => setCuisines(e.target.value)}
                                />
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs">Alcohol preference</Label>
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        { value: "no_alcohol", label: "No alcohol" },
                                        { value: "okay_with_alcohol", label: "Okay with alcohol" },
                                        { value: "must_have_alcohol", label: "Must have alcohol" },
                                    ].map((opt) => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() =>
                                                setAlcoholPreference(opt.value as AlcoholPref)
                                            }
                                            className={cn(
                                                "rounded-full border px-3 py-1 text-xs",
                                                alcoholPreference === opt.value
                                                    ? "bg-primary/10 border-primary text-primary"
                                                    : "bg-background hover:bg-muted"
                                            )}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* Vibe preferences */}
                        <section className="space-y-3">
                            <h3 className="text-xs font-semibold uppercase text-muted-foreground">
                                Vibe preferences
                            </h3>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div className="space-y-1">
                                    <Label className="text-xs">Noise level</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {[
                                            { value: "chill", label: "Chill" },
                                            { value: "balanced", label: "Balanced" },
                                            { value: "energetic", label: "Energetic" },
                                        ].map((opt) => (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() => setNoise(opt.value as NoiseLevel)}
                                                className={cn(
                                                    "rounded-full border px-3 py-1 text-xs",
                                                    noise === opt.value
                                                        ? "bg-primary/10 border-primary text-primary"
                                                        : "bg-background hover:bg-muted"
                                                )}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-xs">Crowd level</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {[
                                            { value: "less_crowded", label: "Less crowded" },
                                            { value: "average", label: "Average" },
                                            { value: "busy", label: "Busy" },
                                        ].map((opt) => (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() => setCrowd(opt.value as CrowdLevel)}
                                                className={cn(
                                                    "rounded-full border px-3 py-1 text-xs",
                                                    crowd === opt.value
                                                        ? "bg-primary/10 border-primary text-primary"
                                                        : "bg-background hover:bg-muted"
                                                )}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs">Indoor vs outdoor</Label>
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        { value: "indoor", label: "Mostly indoor" },
                                        { value: "outdoor", label: "Mostly outdoor" },
                                        { value: "mix", label: "Mix" },
                                    ].map((opt) => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() =>
                                                setIndoorOutdoor(opt.value as IndoorOutdoor)
                                            }
                                            className={cn(
                                                "rounded-full border px-3 py-1 text-xs",
                                                indoorOutdoor === opt.value
                                                    ? "bg-primary/10 border-primary text-primary"
                                                    : "bg-background hover:bg-muted"
                                            )}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <Label className="text-xs">
                                    Show only kid-friendly options
                                </Label>
                                <Switch
                                    checked={kidFriendly}
                                    onCheckedChange={(checked) => setKidFriendly(checked)}
                                />
                            </div>
                        </section>

                        {/* Quality filters */}
                        <section className="space-y-3">
                            <h3 className="text-xs font-semibold uppercase text-muted-foreground">
                                Quality filters
                            </h3>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                <div className="space-y-1">
                                    <Label className="text-xs">Min rating</Label>
                                    <Input
                                        type="number"
                                        step="0.1"
                                        min={0}
                                        max={5}
                                        value={minRating}
                                        onChange={(e) =>
                                            setMinRating(Number(e.target.value) || 0)
                                        }
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-xs">Min review count</Label>
                                    <Input
                                        type="number"
                                        min={0}
                                        value={minReviews}
                                        onChange={(e) =>
                                            setMinReviews(Number(e.target.value) || 0)
                                        }
                                    />
                                </div>

                                <div className="flex items-center justify-between space-y-0">
                                    <Label className="text-xs">Must take reservations</Label>
                                    <Switch
                                        checked={mustTakeReservations}
                                        onCheckedChange={(checked) =>
                                            setMustTakeReservations(checked)
                                        }
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Avoid */}
                        <section className="space-y-3">
                            <h3 className="text-xs font-semibold uppercase text-muted-foreground">
                                Avoid
                            </h3>

                            <div className="space-y-1">
                                <Label className="text-xs">Avoid tags</Label>
                                <Input
                                    placeholder="nightclubs, tourist_traps, ..."
                                    value={avoidTags}
                                    onChange={(e) => setAvoidTags(e.target.value)}
                                />
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs">Notes</Label>
                                <textarea
                                    rows={2}
                                    className="w-full rounded-md border bg-background/80 px-3 py-2 text-sm"
                                    placeholder="no rooftop bars, no long lineups..."
                                    value={avoidNotes}
                                    onChange={(e) => setAvoidNotes(e.target.value)}
                                />
                            </div>
                        </section>
                    </div>

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
            <form
                onSubmit={handleSend}
                className="flex flex-1 items-center gap-3"
            >
                <Input
                    type="text"
                    placeholder="What do you want to explore!?"
                    className="w-full rounded-full"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <Button
                    type="submit"
                    variant="default"
                    size="icon-sm"
                    className="rounded-full cursor-pointer"
                >
                    <Send className="h-4 w-4" />
                </Button>
            </form>
        </div>
    )
}
