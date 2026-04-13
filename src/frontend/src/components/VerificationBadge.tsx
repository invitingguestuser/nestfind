import { cn } from "@/lib/utils";
import { ShieldCheck } from "lucide-react";

interface VerificationBadgeProps {
  verifiedAt?: bigint;
  source?: string;
  className?: string;
  compact?: boolean;
}

function formatFreshness(verifiedAt: bigint): string {
  const ms = Number(verifiedAt) / 1_000_000;
  const now = Date.now();
  const diffDays = Math.floor((now - ms) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return new Date(ms).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

export function VerificationBadge({
  verifiedAt,
  source,
  className,
  compact = false,
}: VerificationBadgeProps) {
  if (!verifiedAt) return null;

  return (
    <span
      data-ocid="verification-badge"
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-accent/15 px-2 py-0.5 text-accent",
        compact ? "text-xs" : "text-xs font-medium",
        className,
      )}
    >
      <ShieldCheck className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
      {!compact && (
        <span className="flex items-center gap-1">
          <span>Verified</span>
          {source && (
            <>
              <span className="opacity-60">·</span>
              <span className="opacity-80 truncate max-w-[80px]">{source}</span>
            </>
          )}
          <span className="opacity-60">·</span>
          <span>{formatFreshness(verifiedAt)}</span>
        </span>
      )}
      {compact && <span>Verified</span>}
    </span>
  );
}
