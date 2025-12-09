import { PlanCardGrid } from "@/components/plan-card-grid"

export default function VisitedPage() {
    return (
        <div className="flex flex-1 flex-col gap-4">
            <h1 className="text-xl font-semibold tracking-tight">Explore</h1>
            <PlanCardGrid />
        </div>
    )
}
