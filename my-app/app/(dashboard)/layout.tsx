import ShellLayout from "@/components/shell-layout";
import { ChatProvider } from "@/hooks/context/session-context";
import { ItineraryProvider } from "@/hooks/context/itinerary-context";
import { SupabaseProvider } from "@/hooks/context/supabase-context";
import { GroupProvider } from "@/hooks/context/group-context";

// pr check
export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ChatProvider>
      <GroupProvider>
        <ItineraryProvider>
          <ShellLayout>{children}</ShellLayout>
        </ItineraryProvider>
      </GroupProvider>
    </ChatProvider>
  );
}