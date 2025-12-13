import ShellLayout from "@/components/shell-layout";
import { ChatProvider } from "@/hooks/context/session-context";
import { ItineraryProvider } from "@/components/chat-page/itinerary-context";

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