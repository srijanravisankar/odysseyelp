import {
  Timeline,
  TimelineBody,
  TimelineHeader,
  TimelineIcon,
  TimelineItem,
  TimelineSeparator,
} from "@/components/ui/timeline"

import { Beer, Coffee, Utensils, Footprints, Music, MapPin, Ticket, ShoppingBag, Palette, Briefcase, SquarePen, Trash2, ExternalLink } from "lucide-react"
import { Button } from "./ui/button"
import Image from "next/image"

// const journeyTimeline = [
//   {
//     id: "1",
//     title: "Birthday bar-hopping",
//     address: "Downtown",
//     isActive: false,
//     icon: <Beer className="h-3 w-3" />,
//   },
//   {
//     id: "2",
//     title: "Cozy cafe date + walk",
//     address: "Queen St W",
//     isActive: false,
//     icon: <Coffee className="h-3 w-3" />,
//   },
//   {
//     id: "3",
//     title: "Kensington Market food crawl",
//     address: "Kensington",
//     isActive: false,
//     icon: <Utensils className="h-3 w-3" />,
//   },
//   {
//     id: "4",
//     title: "High Park cherry blossoms",
//     address: "High Park",
//     isActive: false,
//     icon: <Footprints className="h-3 w-3" />,
//   },
//   {
//     id: "5",
//     title: "Late night jazz & drinks",
//     address: "Reservoir Lounge",
//     isActive: false,
//     icon: <Music className="h-3 w-3" />,
//   },
//   {
//     id: "6",
//     title: "Weekend getaway planning",
//     address: "Niagara Falls",
//     isActive: false,
//     icon: <MapPin className="h-3 w-3" />,
//   },
//   {
//     id: "7",
//     title: "Last-minute concert tickets",
//     address: "Massey Hall",
//     isActive: false,
//     icon: <Ticket className="h-3 w-3" />,
//   },
//   {
//     id: "8",
//     title: "Holiday gift shopping route",
//     address: "Eaton Centre",
//     isActive: false,
//     icon: <ShoppingBag className="h-3 w-3" />,
//   },
//   {
//     id: "9",
//     title: "Gallery hop and street art",
//     address: "West Queen West",
//     isActive: false,
//     icon: <Palette className="h-3 w-3" />,
//   },
//   {
//     id: "10",
//     title: "Client dinner presentation",
//     address: "Financial District",
//     isActive: false,
//     icon: <Briefcase className="h-3 w-3" />,
//   },
// ]
``
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
    hours: "11 a.m.–6 p.m.", // New
    phone: "416-555-1209", // New
  },
  {
    id: "10",
    title: "Client dinner presentation Client dinner presentation",
    address: "Financial District",
    isActive: false,
    icon: <Briefcase className="h-3 w-3" />,
    ratings: 4.3, // New
    hours: "11 a.m.–12 a.m.", // New
    phone: "416-555-1210", // New
  },
]

export function JourneyTimeline() {
  return (
    <Timeline>
      {journeyTimeline.map((item) => (
        <TimelineItem key={item.id}>
          <TimelineHeader>
            <TimelineSeparator className="bg-gray-300 w-[1px]" />
            <TimelineIcon className={`
              h-8 w-8 [&_svg]:h-4 [&_svg]:w-4 border-1 border-primary
              ${item.isActive ? "bg-primary text-primary-foreground" : "bg-muted"}
            `}>
              {item.icon}
            </TimelineIcon>
          </TimelineHeader>
          <TimelineBody className="group pl-1"> {/* 1. ADD 'group' for hover effects */}
            {/* 2. Add Flex container to align content and buttons horizontally */}
            <div className="flex w-full items-start justify-between">

              {/* LEFT SIDE: Text Content (needs to be wrapped) */}
              <div className="flex flex-col gap-1 pr-4">
                <h3 className="flex items-center gap-1 font-dark text-md leading-none">
                  <span>{item.title}</span>
                  <ExternalLink className="h-3.5 w-3.5 pl-0.5 text-muted-foreground/50 hover:text-primary transition-colors" />
                </h3>
                <p>
                  <span className="text-xs text-muted-foreground">Address: </span>
                  <span className="text-xs">{item.address}</span>
                </p>
                <p className="-mt-2">
                  <span className="text-xs text-muted-foreground">Hours: </span>
                  <span className="text-xs pr-3">{item.hours}</span>
                  <span className="text-xs text-muted-foreground">Phone: </span>
                  <span className="text-xs">{item.phone}</span>
                </p>
              </div>

              {/* RIGHT SIDE: Button Group */}
              <div className="flex shrink-0 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 p-0"
                >
                  <SquarePen className="text-yellow-600" /> {/* Example Edit Icon */}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 p-0 text-destructive/80 hover:text-destructive"
                >
                  <Trash2 className="text-red-400" /> {/* Example Delete Icon */}
                </Button>
              </div>
            </div>
          </TimelineBody>
        </TimelineItem>
      ))}
    </Timeline>
  )
}