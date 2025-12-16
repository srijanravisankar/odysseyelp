"use client"

import React, { createContext, useContext, useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"

type SortOption = "newest" | "oldest" | "most-stops"

export type FilterOptions = {
    tags: string[]
    cities: string[]
    priceRanges: string[]
    categories: string[]
    stopCounts: string[]
    dateRange: string | null
}

type ExploreContextType = {
    searchQuery: string
    setSearchQuery: (query: string) => void
    sortBy: SortOption
    setSortBy: (sort: SortOption) => void
    filters: FilterOptions
    setFilters: (filters: FilterOptions) => void
    debouncedSearch: string
}

const ExploreContext = createContext<ExploreContextType | undefined>(undefined)

function ExploreProviderContent({ children }: { children: React.ReactNode }) {
    const searchParams = useSearchParams()

    const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "")
    const [sortBy, setSortBy] = useState<SortOption>((searchParams.get("sort") as SortOption) || "newest")
    const [filters, setFilters] = useState<FilterOptions>(() => {
        const tagsParam = searchParams.get("tags")
        const citiesParam = searchParams.get("cities")
        const pricesParam = searchParams.get("prices")
        const categoriesParam = searchParams.get("categories")
        const stopsParam = searchParams.get("stops")
        const dateParam = searchParams.get("date")

        return {
            tags: tagsParam ? tagsParam.split(",") : [],
            cities: citiesParam ? citiesParam.split(",") : [],
            priceRanges: pricesParam ? pricesParam.split(",") : [],
            categories: categoriesParam ? categoriesParam.split(",") : [],
            stopCounts: stopsParam ? stopsParam.split(",") : [],
            dateRange: dateParam || null,
        }
    })
    const [debouncedSearch, setDebouncedSearch] = useState(searchQuery)

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery)
        }, 300)
        return () => clearTimeout(timer)
    }, [searchQuery])

    return (
        <ExploreContext.Provider
            value={{
                searchQuery,
                setSearchQuery,
                sortBy,
                setSortBy,
                filters,
                setFilters,
                debouncedSearch,
            }}
        >
            {children}
        </ExploreContext.Provider>
    )
}

export function ExploreProvider({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={<div>Loading explore...</div>}>
            <ExploreProviderContent>{children}</ExploreProviderContent>
        </Suspense>
    )
}

export function useExplore() {
    const context = useContext(ExploreContext)
    if (context === undefined) {
        throw new Error("useExplore must be used within an ExploreProvider")
    }
    return context
}