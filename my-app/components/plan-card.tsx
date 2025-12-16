"use client"

import React, { useState } from "react"
import { Earth, Heart, Hash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type PlanCardProps = {
  /** Main title of the plan */
  title: string
  /** Name of the creator (e.g. "Prajith", "Alex & Sam", etc.) */
  createdBy: string
  /** Optional extra info like "2h ago · 3 stops" */
  meta?: string
  /** Whether the user has liked this plan */
  isLiked?: boolean
  /** Whether the plan is published / shared */
  isPublished?: boolean
  /** Called when the user clicks the whole card (open details) */
  onClick?: () => void
  /** Called when user toggles like */
  onToggleLike?: () => void
  /** Called when user toggles publish, with optional tags */
  onTogglePublish?: (tags?: string[]) => void
  /** Thumbnail area (e.g. <TouringMap />). If not passed, a gradient placeholder is shown. */
  thumbnail?: React.ReactNode
  /** Optional className override */
  className?: string
  /** Hide action buttons (heart and globe icons) */
  hideActions?: boolean
}

export function PlanCard({
  title,
  createdBy,
  meta,
  isLiked = false,
  isPublished = false,
  onClick,
  onToggleLike,
  onTogglePublish,
  thumbnail,
  className,
  hideActions = false,
}: PlanCardProps) {
  const [publishDialogOpen, setPublishDialogOpen] = useState(false)
  const [tagsDialogOpen, setTagsDialogOpen] = useState(false)
  const [tagsInput, setTagsInput] = useState("")

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === "Enter") onClick?.()
        }}
        className={cn(
          "group flex flex-col overflow-hidden rounded-2xl border bg-card/80 shadow-sm transition " +
          "hover:border-primary/60 hover:shadow-lg cursor-pointer",
          className
        )}
      >
        {/* Thumbnail / Map area */}
        <div className="relative aspect-video w-full overflow-hidden">
          {thumbnail ? (
            <div className="h-full w-full">{thumbnail}</div>
            // <div className="h-full w-full">Thumbnail</div>
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700" />
          )}

          {/* Subtle top gradient + label */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-black/40 opacity-80" />

          <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2 text-[10px] font-medium text-white/90">
            <span className="rounded-full bg-black/40 px-2 py-0.5 backdrop-blur">
              Map preview
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col gap-2 px-3 pb-3 pt-2">
          {/* Title */}
          <div className="min-h-[2.3rem]">
            <h3 className="line-clamp-2 text-sm font-semibold leading-snug">
              {title}
            </h3>
          </div>

          {/* Footer row */}
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            {/* Left side: creator + meta */}
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <div className="flex min-w-0 items-center gap-1">
                <span className="truncate">
                  Created by <span className="font-medium text-foreground">{createdBy}</span>
                </span>
              </div>

              {meta && (
                <span className="truncate text-[10px]">
                  {meta}
                </span>
              )}
            </div>

            {/* Right side: actions */}
            {!hideActions && (
              <div className="flex items-center gap-1">
                {/* Like */}
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className={cn(
                    "h-7 w-7 p-0 transition",
                    isLiked
                      ? "text-red-500 hover:text-red-500 hover:bg-red-500/10"
                      : "hover:text-red-500"
                  )}
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleLike?.()
                  }}
                >
                  <Heart
                    className={cn(
                      "h-4 w-4",
                      isLiked ? "fill-red-500" : "fill-none"
                    )}
                  />
                </Button>

                {/* Publish */}
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className={cn(
                    "h-7 w-7 p-0 transition",
                    isPublished
                      ? "text-emerald-500 hover:text-emerald-500 hover:bg-emerald-500/10"
                      : "hover:text-emerald-500"
                  )}
                  onClick={(e) => {
                    e.stopPropagation()
                    setPublishDialogOpen(true)
                  }}
                >
                  <Earth className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Publish Confirmation Dialog */}
      <AlertDialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isPublished ? "Unpublish Itinerary?" : "Publish Itinerary?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isPublished
                ? "This will remove your itinerary from the public explore page. Others will no longer be able to see it."
                : "This will share your itinerary on the public explore page. Others will be able to see and save it."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setPublishDialogOpen(false)
                if (isPublished) {
                  // Unpublishing - just call onTogglePublish directly
                  onTogglePublish?.()
                } else {
                  // Publishing - show tags dialog
                  setTagsDialogOpen(true)
                }
              }}
              className={isPublished ? "" : "bg-emerald-600 hover:bg-emerald-700"}
            >
              Yes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Tags Input Dialog */}
      <AlertDialog open={tagsDialogOpen} onOpenChange={setTagsDialogOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Hash className="h-5 w-5 text-emerald-500" />
              Add Tags (Optional)
            </AlertDialogTitle>
            <AlertDialogDescription>
              Add hashtags to help others discover your itinerary. Separate multiple tags with commas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="tags-input" className="text-sm font-medium">
              Tags
            </Label>
            <Input
              id="tags-input"
              placeholder="e.g. #nightlife, #toronto, #foodie"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Example: #nightlife, #toronto, #datenight
            </p>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              // Skip tags but still publish
              onTogglePublish?.([])
              setTagsInput("")
            }}>
              Skip
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                // Parse tags from input
                const tags = tagsInput
                  .split(",")
                  .map(tag => tag.trim())
                  .filter(tag => tag.length > 0)
                  .map(tag => tag.startsWith("#") ? tag : `#${tag}`)

                onTogglePublish?.(tags)
                setTagsInput("")
                setTagsDialogOpen(false)
              }}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Publish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
