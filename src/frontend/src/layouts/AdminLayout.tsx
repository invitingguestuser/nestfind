import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  AlertTriangle,
  BarChart3,
  Building2,
  FileText,
  Home,
  Menu,
  Shield,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useCurrentUser } from "../hooks/useUser";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: BarChart3, exact: true },
  { href: "/admin/listings", label: "Listings", icon: Building2, exact: false },
  { href: "/admin/users", label: "Users", icon: Users, exact: false },
  {
    href: "/admin/content",
    label: "Content / Blog",
    icon: FileText,
    exact: false,
  },
  {
    href: "/admin/moderation",
    label: "Moderation",
    icon: AlertTriangle,
    exact: false,
  },
];

function NavItem({
  href,
  label,
  icon: Icon,
  exact,
  onClick,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  exact: boolean;
  onClick?: () => void;
}) {
  const { location } = useRouterState();
  const isActive = exact
    ? location.pathname === href
    : location.pathname.startsWith(href);

  return (
    <Link
      to={href}
      onClick={onClick}
      data-ocid={`admin-nav-${label.toLowerCase().replace(/[\s/]+/g, "-")}`}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-muted",
      )}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      <span>{label}</span>
    </Link>
  );
}

function AdminSidebar({ onNav }: { onNav?: () => void }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-5 border-b border-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground flex-shrink-0">
          <Shield className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="font-display font-bold text-foreground text-sm leading-tight">
            Admin Panel
          </p>
          <p className="text-xs text-muted-foreground">NestFind</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.href} {...item} onClick={onNav} />
        ))}
      </nav>

      <div className="px-3 pb-4">
        <Separator className="mb-4" />
        <Link
          to="/"
          onClick={onNav}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          data-ocid="admin-nav-back-to-site"
        >
          <Home className="h-4 w-4 flex-shrink-0" />
          Back to site
        </Link>
      </div>
    </div>
  );
}

export function AdminLayout() {
  const { data: currentUser, isLoading } = useCurrentUser();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 rounded-full border-2 border-muted border-t-primary animate-spin" />
      </div>
    );
  }

  if (!currentUser || currentUser.role !== "admin") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <Shield className="h-8 w-8 text-destructive" />
        </div>
        <h1 className="text-2xl font-display font-bold text-foreground mb-2">
          Access Denied
        </h1>
        <p className="text-muted-foreground mb-6">
          You need admin privileges to view this page.
        </p>
        <Button asChild>
          <Link to="/">Go to homepage</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-card border-r border-border fixed inset-y-0 z-40">
        <AdminSidebar />
      </aside>

      {/* Mobile header + sheet */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center h-14 bg-card border-b border-border px-4 gap-3">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open admin menu"
              data-ocid="admin-mobile-menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 bg-card">
            <AdminSidebar onNav={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Shield className="h-3.5 w-3.5" />
          </div>
          <span className="font-display font-bold text-sm">Admin Panel</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {currentUser.name}
          </Badge>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 lg:pl-60 pt-14 lg:pt-0 min-w-0">
        <div className="min-h-screen bg-background">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
