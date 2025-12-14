import ShellLayout from "@/components/shell-layout";
import { ChatProvider } from "@/hooks/context/session-context";
import { ItineraryProvider } from "@/hooks/context/itinerary-context";
import { SupabaseProvider } from "@/hooks/context/supabase-context";

// pr check
export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ChatProvider>
      <ItineraryProvider>
        <ShellLayout>{children}</ShellLayout>
      </ItineraryProvider>
    </ChatProvider>
  );
}