import { T2ASkeleton } from "@/components/ui/T2ASkeleton";

/** Mirrors the dashboard toolbar + grid box-for-box so the swap costs no layout shift. */
export default function Loading() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 md:px-6">
      <div className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <T2ASkeleton className="h-8 w-32" />
          <T2ASkeleton className="h-4 w-8" />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <T2ASkeleton className="h-9 min-w-[200px] flex-1" />
          <T2ASkeleton className="h-9 w-[180px] rounded-md" />
          <T2ASkeleton className="h-5 w-24" />
          <T2ASkeleton className="ml-auto h-9 w-32 rounded-md" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <T2ASkeleton key={i} className="h-[148px] rounded-md" />
        ))}
      </div>
    </main>
  );
}
