import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Link, Outlet } from "@tanstack/react-router";
import {
  Building2,
  ChevronDown,
  GitCompare,
  Heart,
  Home,
  LogIn,
  Menu,
  Search,
  User,
  X,
} from "lucide-react";
import { useState } from "react";
import { SearchBar } from "../components/SearchBar";
import { useAuth } from "../hooks/useAuth";
import { useCurrentUser } from "../hooks/useUser";
import { useCompareStore, useSavedStore } from "../store/useStore";

const FOOTER_CITIES = [
  "New York",
  "Los Angeles",
  "Chicago",
  "Houston",
  "Miami",
];
const FOOTER_TYPES = [
  "Apartments",
  "Houses",
  "Villas",
  "Studios",
  "Commercial",
];

export function RootLayout() {
  const { isAuthenticated, isLoading, login, logout } = useAuth();
  const { data: currentUser } = useCurrentUser();
  const compareIds = useCompareStore((s) => s.ids);
  const savedIds = useSavedStore((s) => s.ids);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const initials = currentUser?.name
    ? currentUser.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  const navLinks = [
    { href: "/search", label: "Search" },
    { href: "/blog", label: "Blog" },
    { href: "/cities/new-york", label: "Cities" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header
        className="sticky top-0 z-50 bg-card border-b border-border shadow-xs"
        data-ocid="main-nav"
      >
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center gap-4">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2 flex-shrink-0 mr-2"
              aria-label="NestFind home"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Building2 className="h-4 w-4" />
              </div>
              <span className="font-display font-bold text-foreground text-lg hidden sm:block">
                NestFind
              </span>
            </Link>

            {/* Compact search (center) */}
            <div className="flex-1 max-w-sm hidden md:block">
              <SearchBar variant="compact" />
            </div>

            {/* Right nav */}
            <nav
              className="hidden md:flex items-center gap-1 ml-auto"
              aria-label="Main navigation"
            >
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground rounded-md transition-colors hover:bg-muted"
                  activeProps={{ className: "text-foreground font-medium" }}
                  data-ocid={`nav-${link.label.toLowerCase()}`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-2 ml-2">
              {/* Saved */}
              <Link
                to="/saved"
                aria-label={`Saved properties (${savedIds.length})`}
                data-ocid="nav-saved"
              >
                <Button variant="ghost" size="icon" className="relative">
                  <Heart className="h-5 w-5" />
                  {savedIds.length > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-4 min-w-4 rounded-full p-0 flex items-center justify-center text-[10px] bg-primary text-primary-foreground">
                      {savedIds.length}
                    </Badge>
                  )}
                </Button>
              </Link>

              {/* Compare */}
              {compareIds.length > 0 && (
                <Link
                  to="/properties/compare"
                  aria-label={`Compare (${compareIds.length})`}
                  data-ocid="nav-compare"
                >
                  <Button variant="ghost" size="icon" className="relative">
                    <GitCompare className="h-5 w-5" />
                    <Badge className="absolute -top-1 -right-1 h-4 min-w-4 rounded-full p-0 flex items-center justify-center text-[10px] bg-primary text-primary-foreground">
                      {compareIds.length}
                    </Badge>
                  </Button>
                </Link>
              )}

              <Separator orientation="vertical" className="h-6" />

              {/* Auth */}
              {isLoading ? (
                <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
              ) : isAuthenticated ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setUserMenuOpen((v) => !v)}
                    className="flex items-center gap-2 rounded-full border border-border p-1 hover:bg-muted transition-colors"
                    data-ocid="user-menu-trigger"
                    aria-label="User menu"
                    aria-expanded={userMenuOpen}
                  >
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown
                      className={cn(
                        "h-3.5 w-3.5 text-muted-foreground transition-transform mr-1",
                        userMenuOpen && "rotate-180",
                      )}
                    />
                  </button>
                  {userMenuOpen && (
                    <div
                      className="absolute right-0 mt-2 w-52 bg-card border border-border rounded-xl shadow-elevated py-1 z-50"
                      role="menu"
                    >
                      <div className="px-3 py-2 border-b border-border">
                        <p className="font-medium text-sm text-foreground truncate">
                          {currentUser?.name ?? "User"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {currentUser?.role}
                        </p>
                      </div>
                      {[
                        { label: "Profile", href: "/profile" },
                        { label: "My Listings", href: "/agent/dashboard" },
                        { label: "Saved", href: "/saved" },
                        ...(currentUser?.role === "admin"
                          ? [{ label: "Admin Panel", href: "/admin" }]
                          : []),
                      ].map((item) => (
                        <Link
                          key={item.href}
                          to={item.href}
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-3 py-2 text-sm hover:bg-muted transition-colors"
                          role="menuitem"
                          data-ocid={`user-menu-${item.label.toLowerCase().replace(/\s/g, "-")}`}
                        >
                          {item.label}
                        </Link>
                      ))}
                      <Separator className="my-1" />
                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-destructive hover:bg-muted transition-colors"
                        role="menuitem"
                        data-ocid="logout-btn"
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={login}
                    data-ocid="login-btn"
                  >
                    <LogIn className="h-4 w-4 mr-1.5" />
                    Sign in
                  </Button>
                  <Button size="sm" onClick={login} data-ocid="signup-btn">
                    Sign up
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile menu */}
            <div className="flex items-center gap-2 md:hidden ml-auto">
              <Link to="/saved" aria-label="Saved">
                <Button variant="ghost" size="icon" className="relative">
                  <Heart className="h-5 w-5" />
                  {savedIds.length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-primary text-primary-foreground text-[9px] flex items-center justify-center font-bold">
                      {savedIds.length}
                    </span>
                  )}
                </Button>
              </Link>
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Open menu"
                    data-ocid="mobile-menu-trigger"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80 bg-card p-0">
                  <div className="flex items-center justify-between p-4 border-b border-border">
                    <Link
                      to="/"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2"
                    >
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <Building2 className="h-3.5 w-3.5" />
                      </div>
                      <span className="font-display font-bold">NestFind</span>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setMobileOpen(false)}
                      aria-label="Close menu"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  <div className="p-4">
                    <SearchBar variant="compact" className="mb-4" />
                  </div>
                  <nav className="px-4 pb-4 space-y-1">
                    {[
                      { href: "/", label: "Home", icon: Home },
                      {
                        href: "/search",
                        label: "Search Properties",
                        icon: Search,
                      },
                      {
                        href: "/saved",
                        label: "Saved Properties",
                        icon: Heart,
                      },
                      { href: "/blog", label: "Blog", icon: null },
                    ].map((item) => (
                      <Link
                        key={item.href}
                        to={item.href}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-muted transition-colors"
                        activeProps={{
                          className: "bg-primary/10 text-primary",
                        }}
                        data-ocid={`mobile-nav-${item.label.toLowerCase().replace(/\s/g, "-")}`}
                      >
                        {item.icon && <item.icon className="h-4 w-4" />}
                        {item.label}
                      </Link>
                    ))}
                  </nav>
                  <Separator />
                  <div className="p-4">
                    {isAuthenticated ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">
                              {currentUser?.name ?? "User"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {currentUser?.role}
                            </p>
                          </div>
                        </div>
                        <Link
                          to="/profile"
                          onClick={() => setMobileOpen(false)}
                        >
                          <Button
                            variant="outline"
                            className="w-full justify-start gap-2"
                          >
                            <User className="h-4 w-4" />
                            My Profile
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          className="w-full text-destructive border-destructive/30 hover:bg-destructive/5"
                          onClick={() => {
                            logout();
                            setMobileOpen(false);
                          }}
                        >
                          Sign out
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Button
                          className="w-full"
                          onClick={() => {
                            login();
                            setMobileOpen(false);
                          }}
                          data-ocid="mobile-login-btn"
                        >
                          <LogIn className="h-4 w-4 mr-2" />
                          Sign in / Sign up
                        </Button>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer
        className="bg-card border-t border-border mt-auto"
        data-ocid="footer"
      >
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
            {/* Brand */}
            <div className="col-span-2 sm:col-span-1">
              <Link to="/" className="flex items-center gap-2 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Building2 className="h-4 w-4" />
                </div>
                <span className="font-display font-bold text-foreground">
                  NestFind
                </span>
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Trusted real estate platform for buyers, renters, and sellers.
                Find your perfect home today.
              </p>
            </div>

            {/* Cities */}
            <div>
              <h4 className="font-semibold text-sm text-foreground mb-3">
                Cities
              </h4>
              <ul className="space-y-2">
                {FOOTER_CITIES.map((city) => (
                  <li key={city}>
                    <Link
                      to="/cities/$slug"
                      params={{ slug: city.toLowerCase().replace(/\s+/g, "-") }}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {city}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Property Types */}
            <div>
              <h4 className="font-semibold text-sm text-foreground mb-3">
                Property Types
              </h4>
              <ul className="space-y-2">
                {FOOTER_TYPES.map((type) => (
                  <li key={type}>
                    <Link
                      to="/type/$type"
                      params={{ type: type.toLowerCase() }}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {type}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold text-sm text-foreground mb-3">
                Company
              </h4>
              <ul className="space-y-2">
                {[
                  { label: "Blog", href: "/blog" },
                  { label: "Submit Listing", href: "/submit-listing" },
                  { label: "For Agents", href: "/agent/dashboard" },
                ].map((item) => (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <Separator className="mb-6" />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} NestFind. All rights reserved.</p>
            <p>
              Built with love using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
