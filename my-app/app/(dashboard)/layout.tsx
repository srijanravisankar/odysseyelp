import ShellLayout from "@/components/shell-layout";
import { ChatProvider } from "@/hooks/context/session-context";

// pr check
export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ChatProvider>
      <ShellLayout>{children}</ShellLayout>
    </ChatProvider>
  );
}