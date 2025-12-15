"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { ExploreProvider, useExplore } from "@/hooks/context/explore-context"
import { ExploreGrid } from "@/components/explore-grid"
import { ExploreFilterBar } from "@/components/explore-filter-bar"

function ExploreContent() {
    const router = useRouter()
    const { searchQuery, sortBy, filterTags, setFilterTags, debouncedSearch } = useExplore()

    // Update URL params when state changes
    useEffect(() => {
        const params = new URLSearchParams()
        if (searchQuery) params.set("search", searchQuery)
        if (sortBy !== "newest") params.set("sort", sortBy)
        if (filterTags.length > 0) params.set("tags", filterTags.join(","))

        const newUrl = params.toString() ? `/explore?${params.toString()}` : "/explore"
        router.replace(newUrl, { scroll: false })
    }, [searchQuery, sortBy, filterTags, router])

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

            {/* Filter Bar */}
            <ExploreFilterBar
                selectedTags={filterTags}
                onTagsChange={setFilterTags}
            />

            {/* Itineraries Grid */}
            <ExploreGrid
                searchQuery={debouncedSearch}
                sortBy={sortBy}
                filterTags={filterTags}
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

