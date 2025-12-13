'use client'

import { useState, useEffect } from "react"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { useItinerary } from "@/hooks/context/itinerary-context"
import { it } from "node:test"

export function ChatPagePagination() {
  const { itineraries, setItineraryData } = useItinerary()
  // console.log("Itineraries in Pagination:", itineraries)
  const [currentPage, setCurrentPage] = useState(1)
  
  const itemsPerPage = 1 // 1 itinerary per page
  const totalPages = Math.ceil(itineraries.length / itemsPerPage)

  useEffect(() => {
    if (itineraries.length > 0) {
        setCurrentPage(totalPages)
        const newestItinerary = itineraries[itineraries.length - 1];
        setItineraryData(newestItinerary);
    }
  }, [itineraries, totalPages, setItineraryData])

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)

      // 2. THE FIX: Update the global display data
      // Page 1 = Index 0, Page 2 = Index 1, etc.
      const selectedItinerary = itineraries[page - 1];
      
      if (selectedItinerary) {
          setItineraryData(selectedItinerary);
          console.log("Switched to itinerary:", selectedItinerary.title);
      }
    }
  }

  // Generate page numbers (show max 5 pages or all if less than 5)
  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Show first page
      pages.push(1)
      
      // Show pages around current page
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)
      
      if (start > 2) pages.push("...")
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      
      if (end < totalPages - 1) pages.push("...")
      
      // Show last page
      pages.push(totalPages)
    }
    
    return pages
  }

  if (!itineraries || itineraries.length <= 1) return null;

  return (
    <Pagination>
      <PaginationContent className="gap-2">
        <PaginationItem>
          <PaginationPrevious 
            href="#" 
            className="h-7 w-7 p-0 text-sm"
            onClick={(e) => {
              e.preventDefault()
              handlePageChange(currentPage - 1)
            }}
          />
        </PaginationItem>

        {getPageNumbers().map((page, idx) => (
          page === "..." ? (
            <PaginationItem key={`ellipsis-${idx}`}>
              <PaginationEllipsis className="h-7 w-7 p-0" />
            </PaginationItem>
          ) : (
            <PaginationItem key={page}>
              <PaginationLink 
                href="#" 
                className="h-7 w-7 p-0 text-xs"
                isActive={currentPage === page}
                onClick={(e) => {
                  e.preventDefault()
                  handlePageChange(page as number)
                }}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          )
        ))}

        <PaginationItem>
          <PaginationNext 
            href="#" 
            className="h-7 w-7 p-0 text-sm"
            onClick={(e) => {
              e.preventDefault()
              handlePageChange(currentPage + 1)
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}