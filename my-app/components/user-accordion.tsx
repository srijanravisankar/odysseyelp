"use client"

import * as React from "react"
import { Star, Calendar as CalendarIcon, Trash2 } from "lucide-react"

import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

// TEMP: mock journey stops.
// Later you can replace this with data from Yelp AI API.
const journeyStops = [
    {
        id: "point-a",
        pointLabel: "Point A",
        name: "Tsuki Ramen Bar",
        address: "123 Queen St W, Toronto, ON",
        rating: 4.5,
        reviewCount: 231,
        price: "$$",
        openStatus: "Open now · Closes at 10:00 PM",
    },
    {
        id: "point-b",
        pointLabel: "Point B",
        name: "Neon Night Cafe",
        address: "456 King St W, Toronto, ON",
        rating: 4.2,
        reviewCount: 98,
        price: "$$",
        openStatus: "Opens at 6:00 PM",
    },
]

type JourneyStop = (typeof journeyStops)[number]

function JourneyStopAccordionItem({ stop }: { stop: JourneyStop }) {
    const [date, setDate] = React.useState<Date | undefined>()

    const filledStars = Math.max(0, Math.min(5, Math.round(stop.rating)))

    return (
        <AccordionItem value={stop.id}>
            {/* Trigger (collapsed) */}
            <AccordionTrigger>
                <div className="flex w-full items-center justify-between gap-2">
                    <div className="flex flex-col text-left">
            <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
              {stop.pointLabel}
            </span>
                        <span className="text-sm font-medium text-foreground">
              {stop.name}
            </span>
                    </div>
                </div>
            </AccordionTrigger>

            {/* Content (expanded) */}
            <AccordionContent>
                <div className="space-y-3 text-xs text-muted-foreground">
                    {/* 1. Address */}
                    <div>
                        <span className="font-medium text-foreground">Address: </span>
                        <span>{stop.address}</span>
                    </div>

                    {/* 2. Stars + numeric rating + review count */}
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                    key={i}
                                    className={cn(
                                        "h-3.5 w-3.5",
                                        i < filledStars
                                            ? "text-yellow-400 fill-yellow-400"
                                            : "text-muted-foreground"
                                    )}
                                />
                            ))}
                        </div>
                        <span>
              {stop.rating.toFixed(1)}{" "}
                            <span className="text-[11px] text-muted-foreground">
                ({stop.reviewCount} reviews)
              </span>
            </span>
                    </div>

                    {/* 3. Price level */}
                    <div>
                        <span className="font-medium text-foreground">Price: </span>
                        <span>{stop.price}</span>
                    </div>

                    {/* 4. Store open time */}
                    <div>
                        <span className="font-medium text-foreground">Hours: </span>
                        <span>{stop.openStatus}</span>
                    </div>

                    {/* 5. Date picker */}
                    <div className="flex flex-col gap-1">
                        <span className="font-medium text-foreground">Planned date</span>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !date && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date ? date.toLocaleDateString() : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* 6. Delete button */}
                    <div className="pt-2 flex justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="border-destructive text-destructive hover:bg-destructive/10"
                            onClick={() => {
                                // later: wire this to actually remove the stop from your state
                                console.log("Delete stop", stop.id)
                            }}
                        >
                            <Trash2 className="mr-1 h-3.5 w-3.5" />
                            Delete stop
                        </Button>
                    </div>
                </div>
            </AccordionContent>
        </AccordionItem>
    )
}

export function SidebarUserAccordion() {
    return (
        <Accordion type="single" collapsible className="w-full">
            {journeyStops.map((stop) => (
                <JourneyStopAccordionItem key={stop.id} stop={stop} />
            ))}
        </Accordion>
    )
}
