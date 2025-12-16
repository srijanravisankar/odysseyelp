"use client"

import { cn } from "@/lib/utils"

interface HamsterLoaderProps {
  label?: string
  className?: string
}

export function HamsterLoader({
  label = "Building your travel itinerary...",
  className,
}: HamsterLoaderProps) {
  return (
    <div
      className={cn("flex flex-col items-center gap-4 text-center", className)}
      role="status"
      aria-live="polite"
    >
      <div aria-label={label} role="img" className="hamster-wheel">
        <div className="wheel" />
        <div className="hamster">
          <div className="hamster__body">
            <div className="hamster__head">
              <div className="hamster__ear" />
              <div className="hamster__eye" />
              <div className="hamster__nose" />
            </div>
            <div className="hamster__limb hamster__limb--fr" />
            <div className="hamster__limb hamster__limb--fl" />
            <div className="hamster__limb hamster__limb--br" />
            <div className="hamster__limb hamster__limb--bl" />
            <div className="hamster__tail" />
          </div>
        </div>
        <div className="spoke" />
      </div>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  )
}
