"use client";

import React from "react";
import { ArrowUpDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useExplore } from "@/hooks/context/explore-context";

export function ExploreHeaderActions() {
  const { sortBy, setSortBy } = useExplore()

  return (
    <div className="flex items-center justify-end w-full gap-4">
      {/* Sort Dropdown */}
      <div className="flex items-center gap-2">
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-40 h-9">
            <ArrowUpDown className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="most-stops">Most Stops</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

