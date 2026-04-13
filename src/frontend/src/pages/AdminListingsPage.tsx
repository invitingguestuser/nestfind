import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Home, XCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  useApproveProperty,
  useDeleteProperty,
  useListProperties,
  useRejectProperty,
} from "../hooks/useProperties";
import type { Property, PropertyStatus } from "../types";

type Tab = "all" | PropertyStatus;

const STATUS_BADGE: Record<
  PropertyStatus,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  pending: { label: "Pending", variant: "outline" },
  approved: { label: "Approved", variant: "default" },
  rejected: { label: "Rejected", variant: "destructive" },
  inactive: { label: "Inactive", variant: "secondary" },
};

function ListingSkeleton() {
  return (
    <div className="space-y-2">
      {["s1", "s2", "s3", "s4", "s5"].map((k) => (
        <div
          key={k}
          className="flex items-center gap-4 p-4 border border-border rounded-lg"
        >
          <Skeleton className="h-14 w-20 rounded-md flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-8 w-24" />
        </div>
      ))}
    </div>
  );
}

function ApproveDialog({
  property,
  onClose,
}: {
  property: Property;
  onClose: () => void;
}) {
  const [source, setSource] = useState("");
  const { mutate, isPending } = useApproveProperty();

  const handleApprove = () => {
    mutate(
      { id: property.id, source },
      {
        onSuccess: () => {
          toast.success("Listing approved");
          onClose();
        },
        onError: () => toast.error("Failed to approve listing"),
      },
    );
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Approve Listing</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">
            Approving:{" "}
            <strong className="text-foreground">{property.title}</strong>
          </p>
          <div className="space-y-1.5">
            <Label htmlFor="verif-source">Verification Source</Label>
            <Input
              id="verif-source"
              placeholder="e.g. Land registry, Agent verification"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              data-ocid="approve-source-input"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleApprove}
            disabled={isPending}
            data-ocid="approve-confirm-btn"
          >
            {isPending ? "Approving…" : "Approve"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RejectDialog({
  property,
  onClose,
}: {
  property: Property;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");
  const { mutate, isPending } = useRejectProperty();

  const handleReject = () => {
    if (!reason.trim()) return;
    mutate(
      { id: property.id, reason },
      {
        onSuccess: () => {
          toast.success("Listing rejected");
          onClose();
        },
        onError: () => toast.error("Failed to reject listing"),
      },
    );
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reject Listing</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">
            Rejecting:{" "}
            <strong className="text-foreground">{property.title}</strong>
          </p>
          <div className="space-y-1.5">
            <Label htmlFor="reject-reason">Reason</Label>
            <Textarea
              id="reject-reason"
              placeholder="Explain why this listing is being rejected…"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              data-ocid="reject-reason-input"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleReject}
            disabled={isPending || !reason.trim()}
            data-ocid="reject-confirm-btn"
          >
            {isPending ? "Rejecting…" : "Reject"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ListingRow({ property }: { property: Property }) {
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { mutate: deleteProp } = useDeleteProperty();

  const badge = STATUS_BADGE[property.status];
  const thumb = property.photos[0] ?? null;

  return (
    <>
      <div
        className="flex items-center gap-4 p-4 bg-card rounded-lg border border-border hover:border-primary/30 transition-colors"
        data-ocid={`listing-row-${property.id}`}
      >
        <div className="h-14 w-20 rounded-md overflow-hidden bg-muted flex-shrink-0">
          {thumb ? (
            <img
              src={thumb}
              alt={property.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <Home className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-foreground truncate">
            {property.title}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {property.city} · {property.propertyType} ·{" "}
            <span className="font-medium">
              ${Number(property.price).toLocaleString()}
            </span>
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Submitted{" "}
            {new Date(
              Number(property.createdAt) / 1_000_000,
            ).toLocaleDateString()}
          </p>
        </div>

        <Badge variant={badge.variant} className="flex-shrink-0">
          {badge.label}
        </Badge>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {property.status === "pending" && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 text-xs border-primary/40 text-primary hover:bg-primary/5"
                onClick={() => setApproveOpen(true)}
                data-ocid="approve-btn"
              >
                <CheckCircle2 className="h-3.5 w-3.5" /> Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 text-xs border-destructive/40 text-destructive hover:bg-destructive/5"
                onClick={() => setRejectOpen(true)}
                data-ocid="reject-btn"
              >
                <XCircle className="h-3.5 w-3.5" /> Reject
              </Button>
            </>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="text-xs text-muted-foreground hover:text-destructive"
            onClick={() => setDeleteOpen(true)}
            data-ocid="delete-listing-btn"
          >
            Delete
          </Button>
        </div>
      </div>

      {approveOpen && (
        <ApproveDialog
          property={property}
          onClose={() => setApproveOpen(false)}
        />
      )}
      {rejectOpen && (
        <RejectDialog
          property={property}
          onClose={() => setRejectOpen(false)}
        />
      )}
      {deleteOpen && (
        <AlertDialog open onOpenChange={setDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete listing?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete "{property.title}". This action
                cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  deleteProp(property.id, {
                    onSuccess: () => toast.success("Listing deleted"),
                    onError: () => toast.error("Failed to delete listing"),
                  });
                  setDeleteOpen(false);
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}

export default function AdminListingsPage() {
  const [tab, setTab] = useState<Tab>("all");
  const { data: page, isLoading } = useListProperties(1n, 50n);

  const items = useMemo(() => {
    if (!page?.items) return [];
    if (tab === "all") return page.items;
    return page.items.filter((p) => p.status === tab);
  }, [page, tab]);

  const counts = useMemo(() => {
    if (!page?.items) return { pending: 0, approved: 0, rejected: 0 };
    return {
      pending: page.items.filter((p) => p.status === "pending").length,
      approved: page.items.filter((p) => p.status === "approved").length,
      rejected: page.items.filter((p) => p.status === "rejected").length,
    };
  }, [page]);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          Listings
        </h1>
        <p className="text-muted-foreground mt-1">
          Review and manage all property listings
        </p>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
        <TabsList data-ocid="listings-tabs">
          <TabsTrigger value="all">All ({page?.items.length ?? 0})</TabsTrigger>
          <TabsTrigger value="pending">
            Pending
            {counts.pending > 0 && (
              <Badge className="ml-1.5 h-4 min-w-4 rounded-full p-0 text-[10px] bg-primary text-primary-foreground flex items-center justify-center px-1">
                {counts.pending}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({counts.approved})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({counts.rejected})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-3" data-ocid="listings-table">
        {isLoading ? (
          <ListingSkeleton />
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 h-16 w-16 rounded-full bg-muted flex items-center justify-center">
              <Home className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="font-medium text-foreground">No listings found</p>
            <p className="text-sm text-muted-foreground mt-1">
              No listings match the current filter.
            </p>
          </div>
        ) : (
          items.map((property) => (
            <ListingRow key={String(property.id)} property={property} />
          ))
        )}
      </div>
    </div>
  );
}
