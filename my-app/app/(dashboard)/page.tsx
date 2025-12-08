import { AppSidebar } from "@/components/app-sidebar"
import { InputWithButton } from "@/components/input-with-button"
import { Itinerary } from "@/components/itinerary"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

// export default function Page() {
//   return (
//     <SidebarProvider
//       style={
//         {
//           "--sidebar-width": "350px",
//         } as React.CSSProperties
//       }
//     >
//       <AppSidebar />
//       <div className="flex flex-1 flex-col gap-0 p-3">
//         <SidebarInset className="rounded-xl border border-border bg-card/50">
//           <header className="flex h-16 shrink-0 items-center gap-2">
//             <div className="flex flex-1 items-center gap-2 px-4">
//               <SidebarTrigger className="-ml-1" />
//               <Separator
//                 orientation="vertical"
//                 className="mr-2 data-[orientation=vertical]:h-4"
//               />
//               <InputWithButton />
//             </div>
//           </header>
//           <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
//             <div className="grid auto-rows-min gap-6 md:grid-cols-3 mx-auto">
//               <Itinerary />
//               <Itinerary />
//               <Itinerary />
//             </div>
//           </div>
//         </SidebarInset>
//       </div>
//     </SidebarProvider>
//   )
// }


export default function Page() {
    return (
        <div className="grid auto-rows-min gap-6 md:grid-cols-3 mx-auto">
            <Itinerary />
            <Itinerary />
            <Itinerary />
        </div>
    )
}

