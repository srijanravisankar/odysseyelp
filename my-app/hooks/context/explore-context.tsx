"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"

type SortOption = "newest" | "oldest" | "most-stops"

type ExploreContextType = {
    searchQuery: string
    setSearchQuery: (query: string) => void
    sortBy: SortOption
    setSortBy: (sort: SortOption) => void
    filterTags: string[]
    setFilterTags: (tags: string[]) => void
    debouncedSearch: string
}

const ExploreContext = createContext<ExploreContextType | undefined>(undefined)

export function ExploreProvider({ children }: { children: React.ReactNode }) {
    const searchParams = useSearchParams()

    const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "")
    const [sortBy, setSortBy] = useState<SortOption>((searchParams.get("sort") as SortOption) || "newest")
    const [filterTags, setFilterTags] = useState<string[]>(() => {
        const tagsParam = searchParams.get("tags")
        return tagsParam ? tagsParam.split(",") : []
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
                filterTags,
                setFilterTags,
                debouncedSearch,
            }}
        >
            {children}
        </ExploreContext.Provider>
    )
}

export function useExplore() {
    const context = useContext(ExploreContext)
    if (context === undefined) {
        throw new Error("useExplore must be used within an ExploreProvider")
    }
    return context
}

