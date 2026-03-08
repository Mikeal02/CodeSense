import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ShimmerSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circle" | "card" | "code" | "stat" | "bar" | "avatar" | "badge";
  width?: string | number;
  height?: string | number;
  lines?: number;
  animate?: boolean;
}

const ShimmerSkeleton = ({
  className,
  variant = "text",
  width,
  height,
  lines = 1,
  animate = true,
  ...props
}: ShimmerSkeletonProps) => {
  const shimmerClass = "relative overflow-hidden bg-muted/40 after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-foreground/[0.04] after:to-transparent after:animate-shimmer after:bg-[length:200%_100%]";

  if (variant === "circle") {
    return (
      <div
        className={cn(shimmerClass, "rounded-full", className)}
        style={{ width: width || 40, height: height || 40 }}
        {...props}
      />
    );
  }

  if (variant === "avatar") {
    return (
      <div className={cn("flex items-center gap-3", className)} {...props}>
        <div className={cn(shimmerClass, "rounded-full w-10 h-10 flex-shrink-0")} />
        <div className="flex-1 space-y-2">
          <div className={cn(shimmerClass, "rounded-md h-3.5 w-3/4")} />
          <div className={cn(shimmerClass, "rounded-md h-3 w-1/2")} />
        </div>
      </div>
    );
  }

  if (variant === "badge") {
    return (
      <div
        className={cn(shimmerClass, "rounded-full h-5", className)}
        style={{ width: width || 64 }}
        {...props}
      />
    );
  }

  if (variant === "stat") {
    return (
      <div className={cn("rounded-xl border border-border/30 bg-card/30 p-4 space-y-3", className)} {...props}>
        <div className="flex items-center gap-2">
          <div className={cn(shimmerClass, "rounded-md w-4 h-4")} />
          <div className={cn(shimmerClass, "rounded-md h-3 w-16")} />
        </div>
        <div className={cn(shimmerClass, "rounded-md h-7 w-20")} />
        <div className={cn(shimmerClass, "rounded-full h-1.5 w-full")} />
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div className={cn("rounded-2xl border border-border/30 bg-card/30 p-5 space-y-4", className)} {...props}>
        <div className="flex items-center gap-3">
          <div className={cn(shimmerClass, "rounded-lg w-10 h-10 flex-shrink-0")} />
          <div className="flex-1 space-y-2">
            <div className={cn(shimmerClass, "rounded-md h-4 w-3/4")} />
            <div className={cn(shimmerClass, "rounded-md h-3 w-1/2")} />
          </div>
        </div>
        <div className="space-y-2">
          <div className={cn(shimmerClass, "rounded-md h-3 w-full")} />
          <div className={cn(shimmerClass, "rounded-md h-3 w-5/6")} />
          <div className={cn(shimmerClass, "rounded-md h-3 w-2/3")} />
        </div>
        <div className="flex gap-2">
          <div className={cn(shimmerClass, "rounded-full h-6 w-16")} />
          <div className={cn(shimmerClass, "rounded-full h-6 w-20")} />
        </div>
      </div>
    );
  }

  if (variant === "code") {
    return (
      <div className={cn("rounded-xl border border-border/30 bg-[hsl(var(--background))]/80 overflow-hidden", className)} {...props}>
        {/* Code header */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/20 bg-muted/20">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-destructive/30" />
            <div className="w-2.5 h-2.5 rounded-full bg-warning/30" />
            <div className="w-2.5 h-2.5 rounded-full bg-success/30" />
          </div>
          <div className={cn(shimmerClass, "rounded-md h-3 w-24 ml-2")} />
        </div>
        {/* Code lines */}
        <div className="p-4 space-y-2.5 font-mono">
          {Array.from({ length: lines || 8 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className={cn(shimmerClass, "rounded h-3.5 w-6 flex-shrink-0 opacity-40")} />
              <div
                className={cn(shimmerClass, "rounded h-3.5")}
                style={{ width: `${30 + Math.sin(i * 1.5) * 30 + Math.random() * 20}%`, animationDelay: `${i * 0.05}s` }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === "bar") {
    return (
      <div
        className={cn(shimmerClass, "rounded-full", className)}
        style={{ width: width || "100%", height: height || 8 }}
        {...props}
      />
    );
  }

  // Default: text lines
  return (
    <div className={cn("space-y-2.5", className)} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(shimmerClass, "rounded-md")}
          style={{
            width: i === lines - 1 && lines > 1 ? "60%" : width || "100%",
            height: height || 14,
            animationDelay: `${i * 0.08}s`,
          }}
        />
      ))}
    </div>
  );
};

// Composite skeleton layouts
export const ChatSkeleton = () => (
  <div className="space-y-5 p-6">
    {[false, true, false].map((isUser, i) => (
      <div key={i} className={cn("flex gap-3", isUser && "flex-row-reverse")}>
        <ShimmerSkeleton variant="circle" width={28} height={28} className="flex-shrink-0 mt-1" />
        <div className={cn("max-w-[75%] space-y-2", isUser && "items-end flex flex-col")}>
          <div className="relative overflow-hidden bg-muted/40 after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-foreground/[0.04] after:to-transparent after:animate-shimmer after:bg-[length:200%_100%] rounded-2xl px-4 py-3">
            <ShimmerSkeleton lines={isUser ? 1 : 3} width={isUser ? 180 : 280} />
          </div>
        </div>
      </div>
    ))}
  </div>
);

export const FileTreeSkeleton = () => (
  <div className="p-3 space-y-1">
    <ShimmerSkeleton variant="bar" height={32} className="rounded-lg mb-3" />
    {Array.from({ length: 12 }).map((_, i) => (
      <div key={i} className="flex items-center gap-2" style={{ paddingLeft: `${(i % 4) * 12 + 8}px` }}>
        <ShimmerSkeleton variant="circle" width={14} height={14} />
        <ShimmerSkeleton
          height={12}
          width={`${40 + Math.random() * 40}%`}
          className="rounded"
          style={{ animationDelay: `${i * 0.06}s` } as React.CSSProperties}
        />
      </div>
    ))}
  </div>
);

export const StatsSkeleton = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {Array.from({ length: 4 }).map((_, i) => (
      <ShimmerSkeleton key={i} variant="stat" />
    ))}
  </div>
);

export const FilePreviewSkeleton = () => (
  <div className="flex flex-col h-full">
    <div className="flex items-center justify-between px-4 py-3 border-b border-border/30 bg-secondary/20">
      <div className="flex items-center gap-2">
        <ShimmerSkeleton variant="circle" width={16} height={16} />
        <ShimmerSkeleton height={14} width={160} />
        <ShimmerSkeleton variant="badge" width={48} />
      </div>
      <div className="flex gap-1">
        <ShimmerSkeleton variant="circle" width={28} height={28} className="rounded-md" />
        <ShimmerSkeleton variant="circle" width={28} height={28} className="rounded-md" />
      </div>
    </div>
    <ShimmerSkeleton variant="code" lines={20} className="flex-1 rounded-none border-0" />
  </div>
);

export const AnalyticsSkeleton = () => (
  <div className="space-y-6">
    <StatsSkeleton />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <ShimmerSkeleton variant="card" />
      <ShimmerSkeleton variant="card" />
    </div>
    <ShimmerSkeleton variant="code" lines={6} />
  </div>
);

export const RepoHealthSkeleton = () => (
  <div className="flex items-center gap-4 p-4 rounded-xl border border-border/30 bg-card/30">
    <ShimmerSkeleton variant="circle" width={64} height={64} />
    <div className="flex-1 space-y-2">
      <ShimmerSkeleton height={16} width="60%" />
      <ShimmerSkeleton height={12} width="40%" />
      <ShimmerSkeleton variant="bar" height={6} />
    </div>
  </div>
);

export default ShimmerSkeleton;
