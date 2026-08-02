import { cn } from "@/lib/cn";

type LoaderSize = "sm" | "md";

interface T2ALoaderProps {
  size?: LoaderSize;
  className?: string;
  label?: string;
}

const sizeClasses: Record<LoaderSize, string> = {
  sm: "h-3 w-1",
  md: "h-5 w-1.5",
};

export function T2ALoader({
  size = "md",
  className,
  label = "Loading",
}: T2ALoaderProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn("inline-flex items-center justify-center gap-1", className)}
    >
      {[0, 0.25, 0.5].map((delay, i) => (
        <span
          key={i}
          aria-hidden
          className={cn(
            "inline-block rounded-full bg-accent",
            "animate-[t2a-loader_0.75s_ease-in-out_infinite_alternate]",
            sizeClasses[size]
          )}
          style={{ animationDelay: `${delay}s` }}
        />
      ))}
    </span>
  );
}
