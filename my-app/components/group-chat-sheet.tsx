"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Boxes, Check, CheckCheck, Copy } from "lucide-react";
import { WishSidebar } from "./wish-sidebar"; // Ensure this path is correct

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";
import { toast } from "sonner";

interface Group {
  id: number;
  name: string;
  createdAt: string;
  secretCode: string;
}

interface GroupChatSheetProps {
  group: Group | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GroupChatSheet({ group, open, onOpenChange }: GroupChatSheetProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyCode = async () => {
    if (!group?.secretCode) return; // ✅ Use prop directly
    
    try {
      await navigator.clipboard.writeText(group.secretCode);
      setIsCopied(true);
      toast.success("Secret code copied!");
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy code");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:w-[450px] p-0 border-l flex flex-col h-full rounded-l-2xl">
        <SheetHeader className="px-4 py-3 border-b shrink-0">
          <SheetTitle className="text-lg flex items-center gap-2 wrap-normal">
            <Boxes className="w-4 h-4 text-primary" />
            {group?.name || "Group Chat"}
            {group?.secretCode && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm" 
                      className="ml-1 h-6 px-1 gap-1 text-muted-foreground hover:text-foreground bg-muted cursor-pointer"
                      onClick={handleCopyCode}
                    >
                      {isCopied ? (
                        <CheckCheck className="h-2 w-2" />
                      ) : (
                        <Copy className="h-2 w-2 text-2xl" />
                      )}
                      <span className="text-[10px]">Secret Code</span>
                    </Button>
                  </TooltipTrigger>
                </Tooltip>
              </TooltipProvider>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 min-h-0 overflow-hidden relative">
          {group && <WishSidebar group={group}  />}
        </div>
      </SheetContent>
    </Sheet>
  );
}