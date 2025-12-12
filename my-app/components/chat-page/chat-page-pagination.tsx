import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export function ChatPagePagination() {
  return (
    <Pagination className="py-2">
      <PaginationContent className="gap-1">
        <PaginationItem>
          <PaginationPrevious href="#" className="h-7 w-7 p-0 text-xs" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" className="h-7 w-7 p-0 text-xs">1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" isActive className="h-7 w-7 p-0 text-xs">
            2
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" className="h-7 w-7 p-0 text-xs">3</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis className="h-7 w-7 p-0" />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#" className="h-7 w-7 p-0 text-xs" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}