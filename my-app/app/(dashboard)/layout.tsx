import ShellLayout from "@/components/shell-layout";

// pr check
export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ShellLayout>{children}</ShellLayout>
  );
}