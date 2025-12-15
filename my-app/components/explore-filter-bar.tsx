"use client"
import { useState, useEffect } from "react"
import { X, Filter } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useSupabase } from "@/hooks/context/supabase-context"
type ExploreFilterBarProps = {
    selectedTags: string[]
    onTagsChange: (tags: string[]) => void
}
export function ExploreFilterBar({ selectedTags, onTagsChange }: ExploreFilterBarProps) {
    const supabase = useSupabase()
    const [availableTags, setAvailableTags] = useState<{ tag: string; count: number }[]>([])
    const [loading, setLoading] = useState(false)
    useEffect(() => {
        const fetchTags = async () => {
            setLoading(true)
            try {
                const { data, error } = await supabase
                    .from("itineraries")
                    .select("tags")
                    .eq("published", true)
                if (error) {
                    console.error("Error fetching tags:", error)
                    return
                }
                // Aggregate all tags and count frequency
                const tagCount: Record<string, number> = {}
                data?.forEach((itinerary: { tags?: string[] }) => {
                    itinerary.tags?.forEach((tag: string) => {
                        tagCount[tag] = (tagCount[tag] || 0) + 1
                    })
                })
                // Convert to array and sort by frequency
                const sortedTags = Object.entries(tagCount)
                    .map(([tag, count]) => ({ tag, count }))
                    .sort((a, b) => b.count - a.count)
                setAvailableTags(sortedTags)
            } catch (err) {
                console.error("Failed to fetch tags:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchTags()
    }, [supabase])
    const handleTagClick = (tag: string) => {
        if (selectedTags.includes(tag)) {
            onTagsChange(selectedTags.filter(t => t !== tag))
        } else {
            onTagsChange([...selectedTags, tag])
        }
    }
    const handleClearAll = () => {
        onTagsChange([])
    }
    return (
        <div className="flex items-center gap-2 flex-wrap">
            {/* Filter Button */}
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 h-8"
                    >
                        <Filter className="h-3.5 w-3.5" />
                        Filter by tags
                        {selectedTags.length > 0 && (
                            <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                                {selectedTags.length}
                            </Badge>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="start">
                    <div className="p-3 border-b">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">Filter by tags</p>
                            {selectedTags.length > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleClearAll}
                                    className="h-7 px-2 text-xs"
                                >
                                    Clear all
                                </Button>
                            )}
                        </div>
                    </div>
                    <ScrollArea className="h-[300px]">
                        <div className="p-3 space-y-1">
                            {loading ? (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    Loading tags...
                                </p>
                            ) : availableTags.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    No tags available
                                </p>
                            ) : (
                                availableTags.map(({ tag, count }) => (
                                    <button
                                        key={tag}
                                        onClick={() => handleTagClick(tag)}
                                        className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
                                            selectedTags.includes(tag)
                                                ? "bg-primary text-primary-foreground"
                                                : "hover:bg-accent"
                                        }`}
                                    >
                                        <span>{tag}</span>
                                        <Badge variant="outline" className="ml-2 text-xs">
                                            {count}
                                        </Badge>
                                    </button>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </PopoverContent>
            </Popover>
            {/* Selected Tags */}
            {selectedTags.map((tag) => (
                <Badge
                    key={tag}
                    variant="secondary"
                    className="gap-1 pr-1 pl-2"
                >
                    {tag}
                    <button
                        onClick={() => handleTagClick(tag)}
                        className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5"
                    >
                        <X className="h-3 w-3" />
                    </button>
                </Badge>
            ))}
        </div>
    )
}
