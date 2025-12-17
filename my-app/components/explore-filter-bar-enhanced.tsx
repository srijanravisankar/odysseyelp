"use client"
import { useState, useEffect } from "react"
import { X, Filter, Calendar, Hash, ArrowUpDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSupabase } from "@/hooks/context/supabase-context"
import { FilterOptions, useExplore } from "@/hooks/context/explore-context"

type ExploreFilterBarEnhancedProps = {
    filters: FilterOptions
    onFiltersChange: (filters: FilterOptions) => void
}

export function ExploreFilterBarEnhanced({ filters, onFiltersChange }: ExploreFilterBarEnhancedProps) {
    const supabase = useSupabase()
    const { sortBy, setSortBy } = useExplore()
    const [availableFilters, setAvailableFilters] = useState({
        tags: [] as { value: string; count: number }[],
        noTagsCount: 0,
    })
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const fetchFilterOptions = async () => {
            setLoading(true)
            try {
                const { data, error } = await supabase
                    .from("itineraries")
                    .select("tags, stops")
                    .eq("published", true)

                if (error) {
                    console.error("Error fetching filter options:", error)
                    return
                }

                const tagCount: Record<string, number> = {}
                let noTagsCount = 0

                data?.forEach((itinerary: { tags?: string[]; stops?: any }) => {
                    // Count tags
                    if (!itinerary.tags || itinerary.tags.length === 0) {
                        noTagsCount++
                    } else {
                        itinerary.tags.forEach((tag: string) => {
                            tagCount[tag] = (tagCount[tag] || 0) + 1
                        })
                    }
                })

                setAvailableFilters({
                    tags: Object.entries(tagCount)
                        .map(([value, count]) => ({ value, count }))
                        .sort((a, b) => b.count - a.count),
                    noTagsCount,
                })
            } catch (err) {
                console.error("Failed to fetch filter options:", err)
            } finally {
                setLoading(false)
            }
        }

        fetchFilterOptions()
    }, [supabase])

    const handleFilterToggle = (filterType: keyof FilterOptions, value: string) => {
        const currentValues = filters[filterType] as string[]
        const newValues = currentValues.includes(value)
            ? currentValues.filter(v => v !== value)
            : [...currentValues, value]
        onFiltersChange({ ...filters, [filterType]: newValues })
    }

    const handleDateRangeChange = (range: string | null) => {
        onFiltersChange({ ...filters, dateRange: range })
    }

    const handleClearAll = () => {
        onFiltersChange({
            tags: [],
            dateRange: null,
        })
    }

    const activeFiltersCount =
        filters.tags.length +
        (filters.dateRange ? 1 : 0)

    return (
        <div className="flex items-start gap-2 flex-wrap">
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" size="lg" className="gap-2 h-9">
                        <Filter className="h-3.5 w-3.5" />
                        Filters
                        {activeFiltersCount > 0 && (
                            <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                                {activeFiltersCount}
                            </Badge>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-96 p-0" align="start">
                    <div className="p-3 border-b">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">Filters</p>
                            {activeFiltersCount > 0 && (
                                <Button variant="ghost" size="sm" onClick={handleClearAll} className="h-7 px-2 text-xs">
                                    Clear all
                                </Button>
                            )}
                        </div>
                    </div>
                    <Tabs defaultValue="tags" className="w-full">
                        <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
                            <TabsTrigger value="tags" className="gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                                <Hash className="h-3.5 w-3.5" />
                                Tags
                            </TabsTrigger>
                            <TabsTrigger value="date" className="gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                                <Calendar className="h-3.5 w-3.5" />
                                Posted
                            </TabsTrigger>
                        </TabsList>

                        {/* Tags Tab */}
                        <TabsContent value="tags" className="mt-0">
                            <ScrollArea className="h-[300px]">
                                <div className="p-3 space-y-1">
                                    {loading ? (
                                        <p className="text-sm text-muted-foreground text-center py-4">Loading...</p>
                                    ) : (
                                        <>
                                            {/* None option for itineraries without tags */}
                                            {availableFilters.noTagsCount > 0 && (
                                                <button
                                                    onClick={() => handleFilterToggle('tags', 'none')}
                                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
                                                        filters.tags.includes('none')
                                                            ? "bg-primary text-primary-foreground"
                                                            : "hover:bg-accent"
                                                    }`}
                                                >
                                                    <span className="italic text-muted-foreground">None</span>
                                                    <Badge variant="outline" className="ml-2 text-xs">{availableFilters.noTagsCount}</Badge>
                                                </button>
                                            )}

                                            {availableFilters.tags.length === 0 && availableFilters.noTagsCount === 0 ? (
                                                <p className="text-sm text-muted-foreground text-center py-4">No tags available</p>
                                            ) : (
                                                availableFilters.tags.map(({ value, count }) => (
                                                    <button
                                                        key={value}
                                                        onClick={() => handleFilterToggle('tags', value)}
                                                        className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
                                                            filters.tags.includes(value)
                                                                ? "bg-primary text-primary-foreground"
                                                                : "hover:bg-accent"
                                                        }`}
                                                    >
                                                        <span>{value}</span>
                                                        <Badge variant="outline" className="ml-2 text-xs">{count}</Badge>
                                                    </button>
                                                ))
                                            )}
                                        </>
                                    )}
                                </div>
                            </ScrollArea>
                        </TabsContent>

                        {/* Date Posted Tab */}
                        <TabsContent value="date" className="mt-0">
                            <div className="p-3 space-y-1">
                                {['today', 'week', 'month', 'all'].map((range) => (
                                    <button
                                        key={range}
                                        onClick={() => handleDateRangeChange(range === 'all' ? null : range)}
                                        className={`w-full flex items-center px-3 py-2 rounded-md text-sm transition-colors ${
                                            filters.dateRange === range || (range === 'all' && !filters.dateRange)
                                                ? "bg-primary text-primary-foreground"
                                                : "hover:bg-accent"
                                        }`}
                                    >
                                        <span>
                                            {range === 'today' && 'Today'}
                                            {range === 'week' && 'Last 7 days'}
                                            {range === 'month' && 'Last 30 days'}
                                            {range === 'all' && 'All time'}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </TabsContent>
                    </Tabs>
                </PopoverContent>
            </Popover>

            {/* Sort Dropdown */}
            <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-45 h-8">
                    <ArrowUpDown className="h-3.5 w-3.5 mr-2" />
                    <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="most-stops">Most Stops</SelectItem>
                    <SelectItem value="fewest-stops">Fewest Stops</SelectItem>
                </SelectContent>
            </Select>

            {/* Active Filter Badges */}
            <div className="flex flex-wrap gap-2">
                {filters.tags.map((tag) => (
                    <Badge key={`tag-${tag}`} variant="secondary" className="gap-1 pr-1 pl-2">
                        <Hash className="h-3 w-3" />
                        {tag === 'none' ? <span className="italic">None</span> : tag}
                        <button onClick={() => handleFilterToggle('tags', tag)} className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5">
                            <X className="h-3 w-3" />
                        </button>
                    </Badge>
                ))}
                {filters.dateRange && (
                    <Badge variant="secondary" className="gap-1 pr-1 pl-2">
                        <Calendar className="h-3 w-3" />
                        {filters.dateRange === 'today' && 'Today'}
                        {filters.dateRange === 'week' && 'Last 7 days'}
                        {filters.dateRange === 'month' && 'Last 30 days'}
                        <button onClick={() => handleDateRangeChange(null)} className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5">
                            <X className="h-3 w-3" />
                        </button>
                    </Badge>
                )}
            </div>
        </div>
    )
}

