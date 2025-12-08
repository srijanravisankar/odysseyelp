"use client"

import {
  Binoculars,
  Heart,
  Share,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"

export function ItineraryButtonGroup() {

  return (
    <ButtonGroup className="ml-auto bg-muted/80">
      <Button className="rounded cursor-pointer"><Share /></Button>
      <Button className="rounded cursor-pointer"><Heart /></Button>
      <Button className="rounded cursor-pointer"><Binoculars /></Button>
    </ButtonGroup>
  )
}
