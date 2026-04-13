import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserCheck, UserX, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  useActivateUser,
  useAllUsers,
  useDeactivateUser,
  useSetUserRole,
} from "../hooks/useUser";
import type { User, UserRole } from "../types";

const ROLE_BADGE: Record<
  UserRole,
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  admin: { label: "Admin", variant: "default" },
  agent: { label: "Agent", variant: "secondary" },
  buyer: { label: "Buyer", variant: "outline" },
};

type RoleFilter = "all" | UserRole;

function UserSkeleton() {
  return (
    <div className="space-y-2">
      {["u1", "u2", "u3", "u4", "u5", "u6"].map((k) => (
        <div
          key={k}
          className="flex items-center gap-4 p-4 border border-border rounded-lg"
        >
          <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-8 w-28" />
        </div>
      ))}
    </div>
  );
}

function SetRoleDialog({
  user,
  onClose,
}: {
  user: User;
  onClose: () => void;
}) {
  const [role, setRole] = useState<UserRole>(user.role);
  const { mutate, isPending } = useSetUserRole();

  const handleSave = () => {
    mutate(
      { principalId: user.principalId, role },
      {
        onSuccess: () => {
          toast.success("Role updated");
          onClose();
        },
        onError: () => toast.error("Failed to update role"),
      },
    );
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Set Role</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">
            Changing role for{" "}
            <strong className="text-foreground">{user.name}</strong>
          </p>
          <div className="space-y-1.5">
            <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
              <SelectTrigger data-ocid="role-select">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="buyer">Buyer</SelectItem>
                <SelectItem value="agent">Agent</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isPending || role === user.role}
            data-ocid="role-save-btn"
          >
            {isPending ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function UserRow({ user }: { user: User }) {
  const [roleOpen, setRoleOpen] = useState(false);
  const { mutate: activate, isPending: activating } = useActivateUser();
  const { mutate: deactivate, isPending: deactivating } = useDeactivateUser();

  const badge = ROLE_BADGE[user.role];
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleToggle = () => {
    if (user.isActive) {
      deactivate(user.principalId, {
        onSuccess: () => toast.success(`${user.name} deactivated`),
        onError: () => toast.error("Failed to deactivate user"),
      });
    } else {
      activate(user.principalId, {
        onSuccess: () => toast.success(`${user.name} activated`),
        onError: () => toast.error("Failed to activate user"),
      });
    }
  };

  return (
    <>
      <div
        className="flex items-center gap-4 p-4 bg-card rounded-lg border border-border hover:border-primary/30 transition-colors"
        data-ocid={`user-row-${user.principalId.toString().slice(0, 8)}`}
      >
        {/* Avatar */}
        <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm flex-shrink-0">
          {initials}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-medium text-sm text-foreground truncate">
              {user.name}
            </p>
            {!user.isActive && (
              <Badge
                variant="outline"
                className="text-[10px] text-muted-foreground border-muted-foreground/30"
              >
                Inactive
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Joined{" "}
            {new Date(Number(user.createdAt) / 1_000_000).toLocaleDateString()}
          </p>
        </div>

        <Badge variant={badge.variant}>{badge.label}</Badge>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Button
            size="sm"
            variant="outline"
            className="text-xs"
            onClick={() => setRoleOpen(true)}
            data-ocid="set-role-btn"
          >
            Set Role
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className={`text-xs gap-1.5 ${user.isActive ? "text-destructive hover:bg-destructive/5" : "text-primary hover:bg-primary/5"}`}
            onClick={handleToggle}
            disabled={activating || deactivating}
            data-ocid="toggle-active-btn"
          >
            {user.isActive ? (
              <>
                <UserX className="h-3.5 w-3.5" />
                Deactivate
              </>
            ) : (
              <>
                <UserCheck className="h-3.5 w-3.5" />
                Activate
              </>
            )}
          </Button>
        </div>
      </div>

      {roleOpen && (
        <SetRoleDialog user={user} onClose={() => setRoleOpen(false)} />
      )}
    </>
  );
}

export default function AdminUsersPage() {
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const { data: users, isLoading } = useAllUsers();

  const filtered = useMemo(() => {
    if (!users) return [];
    if (roleFilter === "all") return users;
    return users.filter((u) => u.role === roleFilter);
  }, [users, roleFilter]);

  const counts = useMemo(() => {
    if (!users) return { all: 0, buyer: 0, agent: 0, admin: 0 };
    return {
      all: users.length,
      buyer: users.filter((u) => u.role === "buyer").length,
      agent: users.filter((u) => u.role === "agent").length,
      admin: users.filter((u) => u.role === "admin").length,
    };
  }, [users]);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          Users
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage user accounts, roles, and access
        </p>
      </div>

      <Tabs
        value={roleFilter}
        onValueChange={(v) => setRoleFilter(v as RoleFilter)}
      >
        <TabsList data-ocid="users-tabs">
          <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
          <TabsTrigger value="buyer">Buyers ({counts.buyer})</TabsTrigger>
          <TabsTrigger value="agent">Agents ({counts.agent})</TabsTrigger>
          <TabsTrigger value="admin">Admins ({counts.admin})</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-3" data-ocid="users-table">
        {isLoading ? (
          <UserSkeleton />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 h-16 w-16 rounded-full bg-muted flex items-center justify-center">
              <Users className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="font-medium text-foreground">No users found</p>
            <p className="text-sm text-muted-foreground mt-1">
              No users match the selected role filter.
            </p>
          </div>
        ) : (
          filtered.map((user) => (
            <UserRow key={user.principalId.toString()} user={user} />
          ))
        )}
      </div>
    </div>
  );
}
