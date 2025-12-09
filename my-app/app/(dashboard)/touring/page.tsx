// app/touring/page.tsx
import Image from "next/image"
import {TouringMap} from "@/components/touring-map";

export default function Page() {
    return (
        <div className="flex flex-1 flex-col gap-4">
            <h1 className="text-xl font-semibold tracking-tight">
                Touring
            </h1>
            <div className="relative w-full flex-1 min-h-[400px] overflow-hidden rounded-xl border bg-muted">
                <TouringMap />
            </div>
        </div>
    )
}
