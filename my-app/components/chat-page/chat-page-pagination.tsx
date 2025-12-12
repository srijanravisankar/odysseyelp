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
    <Pagination>
      <PaginationContent className="gap-2">
        <PaginationItem>
          <PaginationPrevious href="#" className="h-7 w-7 p-0 text-sm" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" className="h-7 w-7 p-0 text-xs">1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" isActive className="h-7 w-7 p-0 text-sm">
            2
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" className="h-7 w-7 p-0 text-sm">3</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis className="h-7 w-7 p-0" />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#" className="h-7 w-7 p-0 text-sm" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}