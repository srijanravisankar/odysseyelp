"use client";

import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useItinerary } from "@/hooks/context/itinerary-context";
import { toast } from "sonner";

interface DeletePlaceDialogProps {
  stopId: string;
  placeName: string;
  /** Optional: custom trigger element. Defaults to a small ghost icon button */
  trigger?: React.ReactNode;
}

export function DeletePlaceDialog({
  stopId,
  placeName,
  trigger,
}: DeletePlaceDialogProps) {
  const { removeStop } = useItinerary();

  const handleDelete = () => {
    try {
      removeStop(stopId);
      toast.success(`"${placeName}" removed from itinerary`);
    } catch (error) {
      toast.error("Failed to remove place from itinerary");
      console.error("Error deleting place:", error);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {trigger ?? (
          <Button variant="ghost" size="icon-sm" className="h-6 w-6">
            <Trash2 className="h-3 w-3 text-red-400" />
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove place from itinerary?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove{" "}
            <span className="font-semibold text-foreground">{placeName}</span>{" "}
            from this itinerary? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Remove
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
