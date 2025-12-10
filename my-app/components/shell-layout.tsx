// "use client";

// import React from "react";

// import { AppSidebar } from "@/components/app-sidebar";
// import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
// import { ShellHeader } from "@/components/shell-header";
// import { ItineraryProvider } from "@/components/chat-page/itinerary-context";

// export default function ShellLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <ItineraryProvider>
//       <SidebarProvider
//         style={
//           {
//             "--sidebar-width": "350px",
//           } as React.CSSProperties
//         }
//       >
//         <AppSidebar />

//         <div className="flex flex-1 flex-col gap-0 p-3">
//           <SidebarInset className="rounded-xl border border-border bg-card/50">
//             {/* Header */}
//             <ShellHeader />

//             {/* Content */}
//             <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
//               {children}
//             </div>
//           </SidebarInset>
//         </div>
//       </SidebarProvider>
//     </ItineraryProvider>
//   );
// }

"use client";

import React from "react";
import { usePathname } from "next/navigation";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { ShellHeader } from "@/components/shell-header";
import { ItineraryProvider } from "@/components/chat-page/itinerary-context";

export default function ShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // 1. Identify pages that need the extra wide sidebar
  const isWideSidebar = pathname === "/" || pathname.startsWith("/touring");

  // 2. Set the width.
  // We tried 450px and it was too small. Let's try 550px.
  // You can increase this number (e.g. "600px") if it's still cutting off.
  const sidebarWidth = isWideSidebar ? "550px" : "350px";

  return (
    <ItineraryProvider>
      <SidebarProvider
        style={
          {
            "--sidebar-width": sidebarWidth,
            transition: "width 0.3s ease-in-out", // Added transition for smoothness
          } as React.CSSProperties
        }
      >
        <AppSidebar />

        <div className="flex flex-1 flex-col gap-0 p-3">
          <SidebarInset className="rounded-xl border border-border bg-card/50">
            {/* Header */}
            <ShellHeader />

            {/* Content */}
            <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
              {children}
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </ItineraryProvider>
  );
}
