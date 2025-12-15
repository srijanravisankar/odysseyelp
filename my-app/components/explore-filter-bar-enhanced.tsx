"use client"
import { useState, useEffect } from "react"
import { X, Filter, DollarSign, Layers, Calendar, Hash } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSupabase } from "@/hooks/context/supabase-context"
import { FilterOptions } from "@/hooks/context/explore-context"
type ExploreFilterBarEnhancedProps = {
    filters: FilterOptions
    onFiltersChange: (filters: FilterOptions) => void
}
export function ExploreFilterBarEnhanced({ filters, onFiltersChange }: ExploreFilterBarEnhancedProps) {
    const supabase = useSupabase()
    const [availableFilters, setAvailableFilters] = useState({
        tags: [] as { value: string; count: number }[],
        categories: [] as { value: string; count: number }[],
        priceRanges: [] as { value: string; count: number }[],
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
                const categoryCount: Record<string, number> = {}
                const priceCount: Record<string, number> = {}

                data?.forEach((itinerary: { tags?: string[]; stops?: any }) => {
                    itinerary.tags?.forEach((tag: string) => {
                        tagCount[tag] = (tagCount[tag] || 0) + 1
                    })

                    if (itinerary.stops?.stops) {
                        itinerary.stops.stops.forEach((stop: any) => {
                            if (stop.category) {
                                categoryCount[stop.category] = (categoryCount[stop.category] || 0) + 1
                            }

                            if (stop.price) {
                                priceCount[stop.price] = (priceCount[stop.price] || 0) + 1
                            }
                        })
                    }
                })

                setAvailableFilters({
                    tags: Object.entries(tagCount)
                        .map(([value, count]) => ({ value, count }))
                        .sort((a, b) => b.count - a.count),
                    categories: Object.entries(categoryCount)
                        .map(([value, count]) => ({ value, count }))
                        .sort((a, b) => b.count - a.count),
                    priceRanges: Object.entries(priceCount)
                        .map(([value, count]) => ({ value, count }))
                        .sort((a, b) => {
                            const order = ['€', '€€', '€€€', '€€€€']
                            return order.indexOf(a.value) - order.indexOf(b.value)
                        }),
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
            cities: [],
            priceRanges: [],
            categories: [],
            stopCounts: [],
            dateRange: null,
        })
    }
    const activeFiltersCount = 
        filters.tags.length + 
        filters.priceRanges.length +
        filters.categories.length + 
        (filters.dateRange ? 1 : 0)
    return (
        <div className="flex items-start gap-2 flex-wrap">
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2 h-8">
                        <Filter className="h-3.5 w-3.5" />
                        All Filters
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
                            <TabsTrigger value="category" className="gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                                <Layers className="h-3.5 w-3.5" />
                                Categories
                            </TabsTrigger>
                            <TabsTrigger value="more" className="gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                                More
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="tags" className="mt-0">
                            <ScrollArea className="h-[300px]">
                                <div className="p-3 space-y-1">
                                    {loading ? (
                                        <p className="text-sm text-muted-foreground text-center py-4">Loading...</p>
                                    ) : availableFilters.tags.length === 0 ? (
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
                                </div>
                            </ScrollArea>
                        </TabsContent>
                        <TabsContent value="category" className="mt-0">
                            <ScrollArea className="h-[300px]">
                                <div className="p-3 space-y-1">
                                    {loading ? (
                                        <p className="text-sm text-muted-foreground text-center py-4">Loading...</p>
                                    ) : availableFilters.categories.length === 0 ? (
                                        <p className="text-sm text-muted-foreground text-center py-4">No categories available</p>
                                    ) : (
                                        availableFilters.categories.map(({ value, count }) => (
                                            <button
                                                key={value}
                                                onClick={() => handleFilterToggle('categories', value)}
                                                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
                                                    filters.categories.includes(value)
                                                        ? "bg-primary text-primary-foreground"
                                                        : "hover:bg-accent"
                                                }`}
                                            >
                                                <span>{value}</span>
                                                <Badge variant="outline" className="ml-2 text-xs">{count}</Badge>
                                            </button>
                                        ))
                                    )}
                                </div>
                            </ScrollArea>
                        </TabsContent>
                        <TabsContent value="more" className="mt-0">
                            <ScrollArea className="h-[300px]">
                                <div className="p-3 space-y-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                                            <h4 className="text-sm font-medium">Price Range</h4>
                                        </div>
                                        <div className="space-y-1">
                                            {availableFilters.priceRanges.map(({ value, count }) => (
                                                <button
                                                    key={value}
                                                    onClick={() => handleFilterToggle('priceRanges', value)}
                                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
                                                        filters.priceRanges.includes(value)
                                                            ? "bg-primary text-primary-foreground"
                                                            : "hover:bg-accent"
                                                    }`}
                                                >
                                                    <span>{value}</span>
                                                    <Badge variant="outline" className="ml-2 text-xs">{count}</Badge>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <Separator />

                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <h4 className="text-sm font-medium">Posted</h4>
                                        </div>
                                        <div className="space-y-1">
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
                                    </div>
                                </div>
                            </ScrollArea>
                        </TabsContent>
                    </Tabs>
                </PopoverContent>
            </Popover>
            <div className="flex flex-wrap gap-2">
                {filters.tags.map((tag) => (
                    <Badge key={`tag-${tag}`} variant="secondary" className="gap-1 pr-1 pl-2">
                        <Hash className="h-3 w-3" />
                        {tag}
                        <button onClick={() => handleFilterToggle('tags', tag)} className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5">
                            <X className="h-3 w-3" />
                        </button>
                    </Badge>
                ))}
                {filters.categories.map((category) => (
                    <Badge key={`cat-${category}`} variant="secondary" className="gap-1 pr-1 pl-2">
                        <Layers className="h-3 w-3" />
                        {category}
                        <button onClick={() => handleFilterToggle('categories', category)} className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5">
                            <X className="h-3 w-3" />
                        </button>
                    </Badge>
                ))}
                {filters.priceRanges.map((price) => (
                    <Badge key={`price-${price}`} variant="secondary" className="gap-1 pr-1 pl-2">
                        <DollarSign className="h-3 w-3" />
                        {price}
                        <button onClick={() => handleFilterToggle('priceRanges', price)} className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5">
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
