import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import ShellLayout from "@/components/shell-layout"
import { ThemeProvider } from "@/components/theme-provider"
import { UserProvider } from "@/hooks/context/user-context"
import { SupabaseProvider } from "@/hooks/context/supabase-context"
import { Toaster } from "sonner"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "The Odyssey Yelp - AI-Powered Travel Planning",
  description: "Plan your perfect trip with AI. Discover amazing places, create detailed itineraries, and collaborate with friends. Powered by Yelp and Google Gemini.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SupabaseProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <UserProvider>
              {children}
              <Toaster />
            </UserProvider>
          </ThemeProvider>
        </SupabaseProvider>
      </body>
    </html>
  )
}
