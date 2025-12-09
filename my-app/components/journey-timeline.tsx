import {
  Timeline,
  TimelineBody,
  TimelineHeader,
  TimelineIcon,
  TimelineItem,
  TimelineSeparator,
} from "@/components/ui/timeline"

import { Beer, Coffee, Utensils, Footprints, Music, MapPin, Ticket, ShoppingBag, Palette, Briefcase } from "lucide-react"

const journeyTimeline = [
  {
    id: "1",
    title: "Birthday bar-hopping",
    subtitle: "Downtown · 3 stops",
    createdAt: "2 hours ago",
    isActive: false,
    icon: <Beer className="h-3 w-3" />, 
  },
  {
    id: "2",
    title: "Cozy cafe date + walk",
    subtitle: "Queen St W · 2 stops",
    createdAt: "Yesterday",
    isActive: false,
    icon: <Coffee className="h-3 w-3" />,
  },
  {
    id: "3",
    title: "Kensington Market food crawl",
    subtitle: "Kensington · 5 stops",
    createdAt: "3 days ago",
    isActive: false,
    icon: <Utensils className="h-3 w-3" />,
  },
  {
    id: "4",
    title: "High Park cherry blossoms",
    subtitle: "High Park · 1 stop",
    createdAt: "1 week ago",
    isActive: false,
    icon: <Footprints className="h-3 w-3" />,
  },
  {
    id: "5",
    title: "Late night jazz & drinks",
    subtitle: "Reservoir Lounge · 1 stop",
    createdAt: "2 weeks ago",
    isActive: false,
    icon: <Music className="h-3 w-3" />,
  },
  {
    id: "6",
    title: "Weekend getaway planning",
    subtitle: "Niagara Falls · 3 days",
    createdAt: "3 weeks ago",
    isActive: false,
    icon: <MapPin className="h-3 w-3" />,
  },
  {
    id: "7",
    title: "Last-minute concert tickets",
    subtitle: "Massey Hall · 1 stop",
    createdAt: "1 month ago",
    isActive: false,
    icon: <Ticket className="h-3 w-3" />,
  },
  {
    id: "8",
    title: "Holiday gift shopping route",
    subtitle: "Eaton Centre · 4 stops",
    createdAt: "1 month ago",
    isActive: false,
    icon: <ShoppingBag className="h-3 w-3" />,
  },
  {
    id: "9",
    title: "Gallery hop and street art",
    subtitle: "West Queen West · 2 stops",
    createdAt: "2 months ago",
    isActive: false,
    icon: <Palette className="h-3 w-3" />,
  },
  {
    id: "10",
    title: "Client dinner presentation",
    subtitle: "Financial District · 1 stop",
    createdAt: "3 months ago",
    isActive: false,
    icon: <Briefcase className="h-3 w-3" />,
  },
]

export function JourneyTimeline() {
  return (
    <Timeline>
      {journeyTimeline.map((item) => (
        <TimelineItem key={item.id}>
          <TimelineHeader>
            <TimelineSeparator />
            <TimelineIcon className="bg-primary text-primary-foreground">
              {item.icon}
            </TimelineIcon>
          </TimelineHeader>
          <TimelineBody>
            <div className="flex flex-col gap-1">
              <h3 className="font-medium text-sm leading-none">{item.title}</h3>
              <p className="text-xs text-muted-foreground">{item.subtitle}</p>
              <p className="text-[10px] text-muted-foreground/60">{item.createdAt}</p>
            </div>
          </TimelineBody>
        </TimelineItem>
      ))}
    </Timeline>
  )
}