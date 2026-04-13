import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  CheckCircle2,
  Edit3,
  Loader2,
  LogOut,
  Mail,
  Phone,
  Shield,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageLoader } from "../components/LoadingSpinner";
import { useAuth } from "../hooks/useAuth";
import { useCurrentUser, useUpdateUser } from "../hooks/useUser";
import type { UpdateUserInput } from "../types";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const { data: user, isLoading } = useCurrentUser();
  const updateUser = useUpdateUser();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<UpdateUserInput>({});

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: "/auth" });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (user) {
      setForm({ name: user.name, email: user.email, phone: user.phone });
    }
  }, [user]);

  if (isLoading) return <PageLoader />;
  if (!user) return null;

  const initials = user.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const roleLabel: Record<string, string> = {
    admin: "Admin",
    agent: "Agent",
    buyer: "Buyer",
  };

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      await updateUser.mutateAsync(form);
      toast.success("Profile updated successfully.");
      setEditing(false);
    } catch {
      toast.error("Failed to update profile. Please try again.");
    }
  }

  function handleCancel() {
    setForm({ name: user!.name, email: user!.email, phone: user!.phone });
    setEditing(false);
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Page header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-6 max-w-3xl">
          <h1 className="font-display text-2xl font-bold text-foreground">
            My Profile
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your personal information and preferences
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-3xl space-y-6">
        {/* Profile card */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {/* Cover banner */}
          <div className="h-24 bg-primary/20 relative" />

          {/* Avatar + headline */}
          <div className="px-6 pb-6">
            <div className="flex items-end justify-between -mt-10 mb-4">
              <Avatar className="h-20 w-20 border-4 border-card shadow-md">
                <AvatarImage
                  src={
                    user.avatarUrl ||
                    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=face"
                  }
                  alt={user.name}
                />
                <AvatarFallback className="bg-primary text-primary-foreground font-display text-xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex gap-2 mt-12">
                {!editing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditing(true)}
                    data-ocid="profile-edit-btn"
                  >
                    <Edit3 className="h-4 w-4 mr-1.5" />
                    Edit profile
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={logout}
                  data-ocid="profile-logout-btn"
                >
                  <LogOut className="h-4 w-4 mr-1.5" />
                  Sign out
                </Button>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-display text-xl font-bold text-foreground">
                  {user.name}
                </h2>
                {user.isVerified && (
                  <CheckCircle2
                    className="h-5 w-5 text-accent flex-shrink-0"
                    aria-label="Verified"
                  />
                )}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  variant="secondary"
                  className="bg-primary/10 text-primary border-primary/20"
                >
                  <Shield className="h-3 w-3 mr-1" />
                  {roleLabel[user.role] ?? user.role}
                </Badge>
                {!user.isActive && (
                  <Badge variant="destructive">Inactive</Badge>
                )}
              </div>
              <p className="text-muted-foreground text-sm">
                Member since{" "}
                {new Date(
                  Number(user.createdAt) / 1_000_000,
                ).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Profile info / edit form */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display font-semibold text-foreground text-lg">
              Personal information
            </h3>
            {editing && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCancel}
                aria-label="Cancel editing"
                data-ocid="profile-cancel-btn"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {editing ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Full name</Label>
                <Input
                  id="edit-name"
                  value={form.name ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="Your full name"
                  data-ocid="profile-name-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email address</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={form.email ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                  placeholder="you@example.com"
                  data-ocid="profile-email-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone number</Label>
                <Input
                  id="edit-phone"
                  type="tel"
                  value={form.phone ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, phone: e.target.value }))
                  }
                  placeholder="+1 (555) 000-0000"
                  data-ocid="profile-phone-input"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={updateUser.isPending}
                  data-ocid="profile-save-btn"
                >
                  {updateUser.isPending && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Save changes
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              {[
                { icon: User, label: "Full name", value: user.name },
                {
                  icon: Mail,
                  label: "Email address",
                  value: user.email || "Not provided",
                },
                {
                  icon: Phone,
                  label: "Phone number",
                  value: user.phone || "Not provided",
                },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label}>
                  <div className="flex items-center gap-3 py-2">
                    <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                        {label}
                      </p>
                      <p className="text-foreground font-medium truncate">
                        {value}
                      </p>
                    </div>
                  </div>
                  <Separator />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 gap-4">
          <Link
            to="/saved"
            className="bg-card border border-border rounded-xl p-5 flex flex-col gap-2 hover:border-primary/50 hover:shadow-card transition-all duration-200"
            data-ocid="profile-saved-link"
          >
            <span className="text-2xl">❤️</span>
            <p className="font-display font-semibold text-foreground">
              Saved Properties
            </p>
            <p className="text-muted-foreground text-xs">
              Your shortlisted homes
            </p>
          </Link>
          <Link
            to="/properties/compare"
            className="bg-card border border-border rounded-xl p-5 flex flex-col gap-2 hover:border-primary/50 hover:shadow-card transition-all duration-200"
            data-ocid="profile-compare-link"
          >
            <span className="text-2xl">🔄</span>
            <p className="font-display font-semibold text-foreground">
              Compare List
            </p>
            <p className="text-muted-foreground text-xs">
              Side-by-side comparison
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
