import { cn } from "@/lib/cn";

type LoaderSize = "sm" | "md";

interface T2ALoaderProps {
  size?: LoaderSize;
  className?: string;
}

const sizeClasses: Record<LoaderSize, string> = {
  sm: "h-3 w-1",
  md: "h-5 w-1.5",
};

export function T2ALoader({ size = "md", className }: T2ALoaderProps) {
  return (
    <div className={cn("flex items-center justify-center gap-1", className)}>
      {[0, 0.25, 0.5].map((delay, i) => (
        <span
          key={i}
          className={cn("inline-block rounded-full bg-black", sizeClasses[size])}
          style={{
            animation: "t2a-loader 0.75s ease-in-out infinite alternate",
            animationDelay: `${delay}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes t2a-loader {
          from { transform: scaleY(1); opacity: 0.6; }
          to   { transform: scaleY(1.5); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
