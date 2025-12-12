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
import { ItineraryProvider } from "@/hooks/context/itinerary-context";

export default function ShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // 1. Identify pages that need the extra wide sidebar (not home page anymore since we hide the right sidebar there)
  const isWideSidebar = pathname.startsWith("/touring");

  // 2. Identify if we're on the home page (hide internal header and right sidebar)
  const isHomePage = pathname === "/";

  // 3. Set the width.
  // Home page uses narrow sidebar since right panel is hidden
  // Touring uses wide sidebar for the map content
  const sidebarWidth = isWideSidebar
    ? "550px"
    : isHomePage
    ? "calc(var(--sidebar-width-icon) + 16px)"
    : "350px";

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
            {/* Header - hidden on home page */}
            {!isHomePage && <ShellHeader />}

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
