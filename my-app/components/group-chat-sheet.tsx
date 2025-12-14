"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Boxes } from "lucide-react";
import { WishSidebar } from "./wish-sidebar"; // Ensure this path is correct

interface Group {
  id: number;
  name: string;
  createdAt: string;
}

interface GroupChatSheetProps {
  group: Group | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GroupChatSheet({ group, open, onOpenChange }: GroupChatSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:w-[450px] p-0 border-l flex flex-col h-full">
        <SheetHeader className="px-4 py-3 border-b shrink-0">
          <SheetTitle className="text-base flex items-center gap-2">
            <Boxes className="w-4 h-4 text-primary" />
            {group?.name || "Group Chat"}
          </SheetTitle>
        </SheetHeader>

        {/* Render the sidebar logic here. 
          We only render it if 'group' exists to prevent 
          hooks from running with null IDs.
        */}
        <div className="flex-1 min-h-0 overflow-hidden relative">
          {group && <WishSidebar groupId={group.id} />}
        </div>
      </SheetContent>
    </Sheet>
  );
}