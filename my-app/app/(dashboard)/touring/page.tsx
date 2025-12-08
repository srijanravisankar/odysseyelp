// app/touring/page.tsx
import Image from "next/image"
import {Button} from "@/components/ui/button";
import {CornerUpLeft, CornerUpRight} from "lucide-react";

export default function Page() {
    return (
        <div className="flex flex-1 flex-col gap-4">
            <h1 className="text-xl font-semibold tracking-tight">
                Touring
            </h1>

            <div className="mt-4 flex justify-center gap-4">
                {/* Left: Cancel (red) */}
                <Button
                    variant="destructive"
                    className="flex items-center gap-2"
                >
                    <CornerUpLeft className="w-4 h-4" />
                    <span>Cancel this tour</span>
                </Button>

                {/* Right: Approve (green) */}
                <Button
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                >
                    <span>Approve</span>
                    <CornerUpRight className="w-4 h-4" />
                </Button>
            </div>

            {/* Map container */}
            <div className="relative w-full flex-1 min-h-[400px] overflow-hidden rounded-xl border bg-muted">
                <Image
                    src="/temp_map_image.png"  // file: public/temp_map_image.png
                    alt="Temporary map preview"
                    fill
                    className="object-cover"
                    priority
                />
            </div>
        </div>
    )
}
