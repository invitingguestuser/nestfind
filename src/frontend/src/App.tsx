import { RouterProvider, createRouter } from "@tanstack/react-router";
import { createRootRoute, createRoute } from "@tanstack/react-router";
import { AdminLayout } from "./layouts/AdminLayout";
import { RootLayout } from "./layouts/RootLayout";
import AdminContentPage from "./pages/AdminContentPage";
import AdminListingsPage from "./pages/AdminListingsPage";
import AdminModerationPage from "./pages/AdminModerationPage";
import AdminPage from "./pages/AdminPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import AgentDashboardPage from "./pages/AgentDashboardPage";
import AuthPage from "./pages/AuthPage";
import BlogPage from "./pages/BlogPage";
import BlogPostPage from "./pages/BlogPostPage";
import CityPage from "./pages/CityPage";
import ComparePage from "./pages/ComparePage";
import HomePage from "./pages/HomePage";
import NeighborhoodPage from "./pages/NeighborhoodPage";
import NotFoundPage from "./pages/NotFoundPage";
import ProfilePage from "./pages/ProfilePage";
import PropertyDetailPage from "./pages/PropertyDetailPage";
import PropertyTypePage from "./pages/PropertyTypePage";
import SavedPage from "./pages/SavedPage";
import SearchPage from "./pages/SearchPage";
import SubmitListingPage from "./pages/SubmitListingPage";

// ─── Root routes ──────────────────────────────────────────────────────────────
const rootRoute = createRootRoute({ component: RootLayout });

// ─── Admin layout route (nested under root, renders AdminLayout) ──────────────
const adminLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "admin-layout",
  component: AdminLayout,
});

// ─── Public routes ────────────────────────────────────────────────────────────
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const searchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/search",
  component: SearchPage,
});

const propertyDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/properties/$id",
  component: PropertyDetailPage,
});

const propertyCompareRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/properties/compare",
  component: ComparePage,
});

const savedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/saved",
  component: SavedPage,
});

const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth",
  component: AuthPage,
});

const submitListingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/submit-listing",
  component: SubmitListingPage,
});

const agentDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/agent/dashboard",
  component: AgentDashboardPage,
});

const cityRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/cities/$slug",
  component: CityPage,
});

const neighborhoodRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/neighborhoods/$slug",
  component: NeighborhoodPage,
});

const typeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/type/$type",
  component: PropertyTypePage,
});

const blogRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/blog",
  component: BlogPage,
});

const blogPostRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/blog/$slug",
  component: BlogPostPage,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: ProfilePage,
});

const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "*",
  component: NotFoundPage,
});

// ─── Admin routes (nested under adminLayoutRoute) ────────────────────────────
const adminRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/admin",
  component: AdminPage,
});

const adminListingsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/admin/listings",
  component: AdminListingsPage,
});

const adminUsersRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/admin/users",
  component: AdminUsersPage,
});

const adminContentRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/admin/content",
  component: AdminContentPage,
});

const adminModerationRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/admin/moderation",
  component: AdminModerationPage,
});

// ─── Router ──────────────────────────────────────────────────────────────────
const routeTree = rootRoute.addChildren([
  indexRoute,
  searchRoute,
  propertyCompareRoute,
  propertyDetailRoute,
  savedRoute,
  authRoute,
  submitListingRoute,
  agentDashboardRoute,
  adminLayoutRoute.addChildren([
    adminRoute,
    adminListingsRoute,
    adminUsersRoute,
    adminContentRoute,
    adminModerationRoute,
  ]),
  cityRoute,
  neighborhoodRoute,
  typeRoute,
  blogRoute,
  blogPostRoute,
  profileRoute,
  notFoundRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
