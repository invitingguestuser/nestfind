import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, CheckCircle2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { FlagAction, FlagStatus } from "../backend";
import {
  useFlaggedContent,
  useReviewFlaggedContent,
} from "../hooks/useAdminStats";
import type { FlaggedContent } from "../types";

const STATUS_BADGE: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "outline" | "destructive";
  }
> = {
  pending: { label: "Pending", variant: "outline" },
  reviewed: { label: "Reviewed", variant: "secondary" },
  removed: { label: "Removed", variant: "destructive" },
};

function ModerationSkeleton() {
  return (
    <div className="space-y-3">
      {["m1", "m2", "m3", "m4", "m5"].map((k) => (
        <div
          key={k}
          className="flex items-start gap-4 p-4 border border-border rounded-lg"
        >
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-64" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-8 w-28" />
        </div>
      ))}
    </div>
  );
}

function FlagRow({ item }: { item: FlaggedContent }) {
  const { mutate, isPending } = useReviewFlaggedContent();
  const badge = STATUS_BADGE[item.status] ?? STATUS_BADGE.pending;

  const handleAction = (action: FlagAction) => {
    mutate(
      { flagId: item.id, action },
      {
        onSuccess: () =>
          toast.success(
            action === FlagAction.dismiss
              ? "Content kept — flag dismissed"
              : "Content removed",
          ),
        onError: () => toast.error("Action failed"),
      },
    );
  };

  const contentTypeLabel =
    item.contentType === "property" ? "Property" : "Blog Post";
  const isPending_ = item.status === FlagStatus.pending;

  return (
    <div
      className="flex flex-col sm:flex-row items-start gap-4 p-4 bg-card rounded-lg border border-border hover:border-primary/30 transition-colors"
      data-ocid={`flag-row-${item.id}`}
    >
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {contentTypeLabel}
          </span>
          <span className="text-xs text-muted-foreground">
            ID #{item.contentId.toString()}
          </span>
        </div>
        <p className="text-sm font-medium text-foreground">
          Reason: {item.reason}
        </p>
        <p className="text-xs text-muted-foreground">
          Reported{" "}
          {new Date(Number(item.createdAt) / 1_000_000).toLocaleDateString()}
        </p>
      </div>

      <div className="flex items-center gap-3 sm:flex-col sm:items-end lg:flex-row lg:items-center flex-shrink-0">
        <Badge variant={badge.variant}>{badge.label}</Badge>

        {isPending_ && (
          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 text-xs border-primary/40 text-primary hover:bg-primary/5"
              onClick={() => handleAction(FlagAction.dismiss)}
              disabled={isPending}
              data-ocid="dismiss-flag-btn"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Keep
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 text-xs border-destructive/40 text-destructive hover:bg-destructive/5"
              onClick={() => handleAction(FlagAction.remove)}
              disabled={isPending}
              data-ocid="remove-content-btn"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminModerationPage() {
  const { data: flags, isLoading } = useFlaggedContent();

  const pending = flags?.filter((f) => f.status === FlagStatus.pending) ?? [];
  const reviewed = flags?.filter((f) => f.status !== FlagStatus.pending) ?? [];

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          Moderation
        </h1>
        <p className="text-muted-foreground mt-1">
          Review and act on flagged content
        </p>
      </div>

      {isLoading ? (
        <ModerationSkeleton />
      ) : !flags || flags.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 h-16 w-16 rounded-full bg-muted flex items-center justify-center">
            <AlertTriangle className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="font-medium text-foreground">No flagged content</p>
          <p className="text-sm text-muted-foreground mt-1">
            Everything looks clean — no flags to review right now.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {pending.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-base font-semibold text-foreground">
                  Needs Review
                </h2>
                <Badge className="bg-primary text-primary-foreground">
                  {pending.length}
                </Badge>
              </div>
              <div className="space-y-3" data-ocid="pending-flags">
                {pending.map((item) => (
                  <FlagRow key={String(item.id)} item={item} />
                ))}
              </div>
            </section>
          )}

          {reviewed.length > 0 && (
            <section>
              <h2 className="text-base font-semibold text-foreground mb-4">
                Reviewed
              </h2>
              <div className="space-y-3" data-ocid="reviewed-flags">
                {reviewed.map((item) => (
                  <FlagRow key={String(item.id)} item={item} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
