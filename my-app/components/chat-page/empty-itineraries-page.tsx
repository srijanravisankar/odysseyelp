import Image from "next/image";

export function EmptyItinerariesPage() {
  return (
    <div className="bg-muted relative hidden md:block h-[calc(100dvh-210px)] w-full rounded-2xl overflow-hidden">
      <img
        src="/empty-page.jpg"
        alt="Image"
        className="absolute inset-0 h-full w-full object-cover"
      />
    </div>
  );
}