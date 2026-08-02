import { T2ASkeleton } from "@/components/ui/T2ASkeleton";

/** Mirrors the agent form stack so the swap costs no layout shift. */
export default function Loading() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-3 px-4 py-6 md:px-6">
      <T2ASkeleton className="h-[62px]" />
      <T2ASkeleton className="h-[118px]" />
      <T2ASkeleton className="h-[44px]" />
      <T2ASkeleton className="h-[118px]" />
      <T2ASkeleton className="h-[118px]" />
      <T2ASkeleton className="h-[52px]" />
      <T2ASkeleton className="h-[52px]" />
    </main>
  );
}
