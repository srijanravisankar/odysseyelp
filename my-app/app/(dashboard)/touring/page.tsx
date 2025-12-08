// app/touring/page.tsx
import Image from "next/image"

export default function Page() {
    return (
        <div className="flex flex-1 flex-col gap-4">
            <h1 className="text-xl font-semibold tracking-tight">
                Touring
            </h1>

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
