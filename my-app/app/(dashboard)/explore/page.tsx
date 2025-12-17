"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { ExploreProvider, useExplore } from "@/hooks/context/explore-context"
import { ExploreGrid } from "@/components/explore-grid"
import { ExploreFilterBarEnhanced } from "@/components/explore-filter-bar-enhanced"

function ExploreContent() {
    const router = useRouter()
    const { sortBy, filters, setFilters } = useExplore()

    // Update URL params when state changes
    useEffect(() => {
        const params = new URLSearchParams()
        if (sortBy !== "newest") params.set("sort", sortBy)
        if (filters.tags.length > 0) params.set("tags", filters.tags.join(","))
        if (filters.dateRange) params.set("date", filters.dateRange)

        const newUrl = params.toString() ? `/explore?${params.toString()}` : "/explore"
        router.replace(newUrl, { scroll: false })
    }, [sortBy, filters, router])

    return (
        <div className="flex flex-1 flex-col gap-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold tracking-tight">Explore</h1>
                    <p className="text-sm text-muted-foreground">
                        Discover itineraries shared by the community
                    </p>
                </div>
            </div>

            {/* Enhanced Filter Bar */}
            <ExploreFilterBarEnhanced
                filters={filters}
                onFiltersChange={setFilters}
            />

            {/* Itineraries Grid */}
            <ExploreGrid
                sortBy={sortBy}
                filters={filters}
            />
        </div>
    )
}

export default function ExplorePage() {
    return (
        <ExploreProvider>
            <ExploreContent />
        </ExploreProvider>
    )
}