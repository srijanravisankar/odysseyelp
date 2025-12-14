"use client"

// import { PlanCard } from "@/components/plan-card"
// import { TouringMap } from "@/components/touring-map"

// const mockPlans = [
//     {
//         id: "1",
//         title: "Birthday bar-hopping in downtown Toronto",
//         createdBy: "Prajith",
//         meta: "3 stops · updated 2h ago",
//         lng: -79.3832,
//         lat: 43.6532,
//         zoom: 11,
//     },
//     {
//         id: "2",
//         title: "Cozy cafe date + sunset walk at the waterfront",
//         createdBy: "You",
//         meta: "2 stops · draft",
//         lng: -79.4,
//         lat: 43.65,
//         zoom: 12,
//     },
// ]

export function PlanCardGrid() {
    return (
        <div className="flex flex-col items-center justify-center h-64 w-full gap-2">
            <p className="text-muted-foreground">No items yet</p>
            <p className="text-sm text-muted-foreground">
                Items will appear here once you add them.
            </p>
        </div>
    )

    // return (
    //     <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
    //         {mockPlans.map((plan) => (
    //             <PlanCard
    //                 key={plan.id}
    //                 title={plan.title}
    //                 createdBy={plan.createdBy}
    //                 meta={plan.meta}
    //                 isLiked={plan.id === "1"}
    //                 isPublished={false}
    //                 onClick={() => console.log("Open plan", plan.id)}
    //                 onToggleLike={() => console.log("Toggle like", plan.id)}
    //                 onTogglePublish={() => console.log("Toggle publish", plan.id)}
    //                 thumbnail={
    //                     <TouringMap
    //                         initialLng={plan.lng}
    //                         initialLat={plan.lat}
    //                         initialZoom={plan.zoom}
    //                     />
    //                 }
    //             />
    //         ))}
    //     </div>
    // )
}
