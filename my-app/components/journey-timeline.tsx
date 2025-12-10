"use client"

import {
  Timeline,
  TimelineBody,
  TimelineHeader,
  TimelineIcon,
  TimelineItem,
  TimelineSeparator,
} from "@/components/ui/timeline"

import { Beer, Coffee, Utensils, Footprints, Music, MapPin, Ticket, ShoppingBag, Palette, Briefcase, SquarePen, Trash2, ExternalLink, Badge, Store, Star, Phone } from "lucide-react"
import { Button } from "./ui/button"
import Image from "next/image"

import { useItinerary } from "@/components/chat-page/itinerary-context"
import { ItineraryStop } from "@/lib/itinerary-types"
import { Separator } from "@radix-ui/react-separator"

const journeyTimeline = [
  {
    id: "1",
    title: "Birthday bar-hopping",
    address: "Downtown",
    isActive: false,
    icon: <Beer className="h-3 w-3" />,
    ratings: 4.5, // New: Example rating
    hours: "5 p.m.–2 a.m.", // New: Example hours
    phone: "416-555-1201", // New: Example phone number
  },
  {
    id: "2",
    title: "Cozy cafe date + walk",
    address: "Queen St W",
    isActive: false,
    icon: <Coffee className="h-3 w-3" />,
    ratings: 4.8, // New
    hours: "9 a.m.–6 p.m.", // New
    phone: "416-555-1202", // New
  },
  {
    id: "3",
    title: "Kensington Market food crawl",
    address: "Kensington",
    isActive: false,
    icon: <Utensils className="h-3 w-3" />,
    ratings: 4.4, // New
    hours: "11 a.m.–8 p.m.", // New
    phone: "416-555-1203", // New
  },
  {
    id: "4",
    title: "High Park cherry blossoms",
    address: "High Park",
    isActive: false,
    icon: <Footprints className="h-3 w-3" />,
    ratings: 4.7, // New
    hours: "Open 24 hours", // New
    phone: "416-555-1204", // New
  },
  {
    id: "5",
    title: "Late night jazz & drinks",
    address: "Reservoir Lounge",
    isActive: false,
    icon: <Music className="h-3 w-3" />,
    ratings: 4.3, // New
    hours: "8 p.m.–1 a.m.", // New
    phone: "416-555-1205", // New
  },
  {
    id: "6",
    title: "Weekend getaway planning",
    address: "Niagara Falls",
    isActive: false,
    icon: <MapPin className="h-3 w-3" />,
    ratings: 4.6, // New
    hours: "9 a.m.–5 p.m.", // New
    phone: "905-555-1206", // New
  },
  {
    id: "7",
    title: "Last-minute concert tickets",
    address: "Massey Hall",
    isActive: false,
    icon: <Ticket className="h-3 w-3" />,
    ratings: 4.9, // New
    hours: "Box office varies", // New
    phone: "416-555-1207", // New
  },
  {
    id: "8",
    title: "Holiday gift shopping route",
    address: "Eaton Centre",
    isActive: false,
    icon: <ShoppingBag className="h-3 w-3" />,
    ratings: 4.2, // New
    hours: "10 a.m.–9 p.m.", // New
    phone: "416-555-1208", // New
  },
  {
    id: "9",
    title: "Gallery hop and street art",
    address: "West Queen West",
    isActive: false,
    icon: <Palette className="h-3 w-3" />,
    ratings: 4.7, // New
    hours: "11 a.m.–6 p.m.", // New
    phone: "416-555-1209", // New
  },
  {
    id: "10",
    title: "Client dinner presentation Client dinner presentation",
    address: "Financial District",
    isActive: false,
    icon: <Briefcase className="h-3 w-3" />,
    ratings: 4.3, // New
    hours: "11 a.m.–12 a.m.", // New
    phone: "416-555-1210", // New
  },
]

export function JourneyTimeline() {
  const { itineraryData } = useItinerary()

  return (
    <Timeline>
      {itineraryData?.stops?.map((stop: ItineraryStop, index: number) => {
        // Format address: replace newlines with commas
        const formattedAddress = stop.address?.split("\n").join(", ") || "Address unavailable"

        return (
          <TimelineItem key={stop.id || index}>
            <TimelineHeader>
              <TimelineSeparator className="bg-gray-200 w-px" />
              <TimelineIcon 
              // className="bg-primary text-primary-foreground border-primary h-8 w-8 [&_svg]:h-4 [&_svg]:w-4"
              className="h-8 w-8 [&_svg]:h-4 [&_svg]:w-4 border border-primary bg-muted"
              >
                 {/* You can dynamically change this icon based on category if you want */}
                <Store />
              </TimelineIcon>
            </TimelineHeader>
            
            <TimelineBody className="group pl-1 w-full"> 
              <div className="gap-0 flex flex-col w-full">
                
                {/* --- HEADER: Name, Price, Category --- */}
                <div className="flex justify-between items-start gap-0">
                  <div className="flex flex-col gap-1">
                    <h3 
                    // className="text-sm leading-tight text-foreground overflow-hidden text-ellipsis"
                    className="
                      text-sm leading-tight text-foreground
                      overflow-hidden text-ellipsis whitespace-nowrap
                      max-w-[230px]
                    "
                    title={stop.name}
                    >
                      {stop.name}
                    </h3>
                  </div>

                  {/* Edit/Delete Actions (Visible on Hover) */}
                  <div className="flex shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon-sm" className="h-7 w-7">
                      <SquarePen className="h-3 w-3 text-yellow-600" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" className="h-7 w-7">
                      <Trash2 className="h-3 w-3 text-red-400" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" className="h-7 w-7">
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* --- DETAILS: Rating, Address, Phone --- */}
                <div className="grid gap-2 text-sm text-muted-foreground">
                  
                  {/* Rating */}
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-semibold text-foreground">{stop.rating || "N/A"}</span>
                    <span className="text-xs">
                      ({stop.reviewCount || 0} reviews)
                    </span>
                  </div>

                  {/* Address */}
                  <div className="flex items-start gap-1">
                    <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                    <span className="leading-tight">{formattedAddress}</span>
                  </div>

                  {/* Phone */}
                  {stop.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="h-4 w-4 shrink-0" />
                      <a 
                        href={`tel:${stop.phone}`} 
                        className="hover:text-primary hover:underline transition-colors"
                      >
                        {stop.phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </TimelineBody>
          </TimelineItem>
        )
      })}
    </Timeline>
  )
}



// Example result:
/*
{
    "title": "One-Day Seattle Itinerary",
    "summary": "Discover Seattle's best coffee shops, scenic views, and dining experiences in a single day.",
    "date": null,
    "center": {
        "lat": 47.61777397467515,
        "lng": -122.35321090209428
    },
    "stops": [
        {
            "id": "stop-1",
            "name": "Storyville Coffee Company",
            "address": "94 Pike St\nSte 34\nSeattle, WA 98101",
            "url": "https://www.yelp.ca/biz/storyville-coffee-company-seattle-9?adjust_creative=6eaRMnBeuAhtxZmiJyu5tA&utm_campaign=yelp_api_v3&utm_medium=api_v3_public_ai_api_chat_v2&utm_source=6eaRMnBeuAhtxZmiJyu5tA",
            "rating": 4.5,
            "reviewCount": 2535,
            "price": "$$",
            "openStatus": null,
            "phone": "+12067805777",
            "coordinates": {
                "lat": 47.60895949363687,
                "lng": -122.34043157053928
            },
            "category": "Coffee & Tea"
        },
        {
            "id": "stop-2",
            "name": "Anchorhead Coffee - CenturyLink Plaza",
            "address": "1600 7th Ave\nSte 105\nSeattle, WA 98101",
            "url": "https://www.yelp.ca/biz/anchorhead-coffee-centurylink-plaza-seattle?adjust_creative=6eaRMnBeuAhtxZmiJyu5tA&utm_campaign=yelp_api_v3&utm_medium=api_v3_public_ai_api_chat_v2&utm_source=6eaRMnBeuAhtxZmiJyu5tA",
            "rating": 4.5,
            "reviewCount": 1012,
            "price": "$$",
            "openStatus": null,
            "phone": "+12062222222",
            "coordinates": {
                "lat": 47.6133808022766,
                "lng": -122.334691182469
            },
            "category": "Coffee & Tea"
        },
        {
            "id": "stop-3",
            "name": "Waterfall Garden",
            "address": "219 2nd Ave S\nSeattle, WA 98104",
            "url": "https://www.yelp.ca/biz/waterfall-garden-seattle?adjust_creative=6eaRMnBeuAhtxZmiJyu5tA&utm_campaign=yelp_api_v3&utm_medium=api_v3_public_ai_api_chat_v2&utm_source=6eaRMnBeuAhtxZmiJyu5tA",
            "rating": 4.4,
            "reviewCount": 213,
            "price": null,
            "openStatus": null,
            "phone": "+12066246096",
            "coordinates": {
                "lat": 47.6002476387003,
                "lng": -122.332151074236
            },
            "category": "Parks"
        },
        {
            "id": "stop-4",
            "name": "Discovery Park",
            "address": "3801 Discovery Park Blvd\nSeattle, WA 98199",
            "url": "https://www.yelp.ca/biz/discovery-park-seattle?adjust_creative=6eaRMnBeuAhtxZmiJyu5tA&utm_campaign=yelp_api_v3&utm_medium=api_v3_public_ai_api_chat_v2&utm_source=6eaRMnBeuAhtxZmiJyu5tA",
            "rating": 4.6,
            "reviewCount": 487,
            "price": null,
            "openStatus": null,
            "phone": "+12066844075",
            "coordinates": {
                "lat": 47.66133141343713,
                "lng": -122.41714398532145
            },
            "category": "Parks"
        },
        {
            "id": "stop-5",
            "name": "The Pink Door",
            "address": "1919 Post Alley\nSeattle, WA 98101",
            "url": "https://www.yelp.ca/biz/the-pink-door-seattle-4?adjust_creative=6eaRMnBeuAhtxZmiJyu5tA&utm_campaign=yelp_api_v3&utm_medium=api_v3_public_ai_api_chat_v2&utm_source=6eaRMnBeuAhtxZmiJyu5tA",
            "rating": 4.4,
            "reviewCount": 7852,
            "price": "$$$",
            "openStatus": null,
            "phone": "+12064433241",
            "coordinates": {
                "lat": 47.6103652,
                "lng": -122.3425604
            },
            "category": "Italian"
        },
        {
            "id": "stop-6",
            "name": "Six Seven Restaurant",
            "address": "2411 Alaskan Way\nPier 67\nSeattle, WA 98121",
            "url": "https://www.yelp.ca/biz/six-seven-restaurant-seattle-3?adjust_creative=6eaRMnBeuAhtxZmiJyu5tA&utm_campaign=yelp_api_v3&utm_medium=api_v3_public_ai_api_chat_v2&utm_source=6eaRMnBeuAhtxZmiJyu5tA",
            "rating": 4.1,
            "reviewCount": 1392,
            "price": "$$$",
            "openStatus": null,
            "phone": "+12062694575",
            "coordinates": {
                "lat": 47.6123593,
                "lng": -122.3522372
            },
            "category": "New American"
        }
    ]
}
*/