import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useParams } from "@tanstack/react-router";
import {
  Bath,
  BedDouble,
  Building2,
  Calendar,
  Car,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  GitCompare,
  Heart,
  Leaf,
  Mail,
  MapPin,
  Phone,
  PhoneCall,
  Ruler,
  Share2,
  ShieldCheck,
  Sparkles,
  TreePine,
  Waves,
  Wifi,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { InquiryType } from "../backend";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { PropertyCard } from "../components/PropertyCard";
import { VerificationBadge } from "../components/VerificationBadge";
import { useAddToCompare, useRemoveFromCompare } from "../hooks/useCompareList";
import { useCreateInquiry } from "../hooks/useInquiries";
import { useProperty, useSimilarProperties } from "../hooks/useProperty";
import {
  useSaveProperty,
  useUnsaveProperty,
} from "../hooks/useSavedProperties";
import { useCurrentUser } from "../hooks/useUser";
import {
  generateBreadcrumbSchema,
  generatePropertySchema,
} from "../lib/schema";
import { useCompareStore, useSavedStore } from "../store/useStore";
import type { Property } from "../types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatPrice(price: bigint): string {
  const n = Number(price);
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`;
  return `$${n.toLocaleString()}`;
}

const typeLabels: Record<string, string> = {
  apartment: "Apartment",
  house: "House",
  villa: "Villa",
  studio: "Studio",
  commercial: "Commercial",
};

const amenityIcons: Record<string, { icon: React.ReactNode; label: string }> = {
  parking: { icon: <Car className="h-5 w-5" />, label: "Parking" },
  pool: { icon: <Waves className="h-5 w-5" />, label: "Pool" },
  gym: { icon: <Dumbbell className="h-5 w-5" />, label: "Gym" },
  garden: { icon: <Leaf className="h-5 w-5" />, label: "Garden" },
  wifi: { icon: <Wifi className="h-5 w-5" />, label: "WiFi" },
  balcony: { icon: <Building2 className="h-5 w-5" />, label: "Balcony" },
  security: { icon: <ShieldCheck className="h-5 w-5" />, label: "Security" },
  elevator: { icon: <Building2 className="h-5 w-5" />, label: "Elevator" },
  furnished: { icon: <Sparkles className="h-5 w-5" />, label: "Furnished" },
  "air conditioning": {
    icon: <Sparkles className="h-5 w-5" />,
    label: "Air Conditioning",
  },
  laundry: { icon: <Sparkles className="h-5 w-5" />, label: "Laundry" },
  garden_view: { icon: <TreePine className="h-5 w-5" />, label: "Garden View" },
};

function getAmenityDisplay(name: string): {
  icon: React.ReactNode;
  label: string;
} {
  const key = name.toLowerCase().replace(/\s+/g, "_");
  return (
    amenityIcons[key] ??
    amenityIcons[name.toLowerCase()] ?? {
      icon: <Sparkles className="h-5 w-5" />,
      label: name,
    }
  );
}

// ─── Image Gallery ────────────────────────────────────────────────────────────

function ImageGallery({ photos, title }: { photos: string[]; title: string }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const images =
    photos.length > 0 ? photos : ["/assets/images/placeholder.svg"];

  const prev = () =>
    setActiveIdx((i) => (i - 1 + images.length) % images.length);
  const next = () => setActiveIdx((i) => (i + 1) % images.length);

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="relative w-full overflow-hidden rounded-2xl bg-muted aspect-[16/9] md:aspect-[2/1]">
        <img
          src={images[activeIdx]}
          alt={`${title} – view ${activeIdx + 1}`}
          className="h-full w-full object-cover transition-all duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "/assets/images/placeholder.svg";
          }}
        />
        {/* Count badge */}
        <div className="absolute bottom-3 right-3 bg-foreground/70 text-card text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm">
          {activeIdx + 1} / {images.length}
        </div>
        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Previous photo"
              data-ocid="gallery-prev"
              className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center h-9 w-9 rounded-full bg-card/80 backdrop-blur-sm border border-border text-foreground hover:bg-card transition-smooth shadow-sm"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next photo"
              data-ocid="gallery-next"
              className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center h-9 w-9 rounded-full bg-card/80 backdrop-blur-sm border border-border text-foreground hover:bg-card transition-smooth shadow-sm"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {images.map((src, i) => (
            <button
              type="button"
              key={`gallery-thumb-${i}-${src.slice(-8)}`}
              onClick={() => setActiveIdx(i)}
              aria-label={`View gallery item ${i + 1}`}
              data-ocid={`gallery-thumb-${i}`}
              className={cn(
                "relative flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-smooth",
                i === activeIdx
                  ? "border-primary"
                  : "border-transparent opacity-60 hover:opacity-90",
              )}
            >
              <img
                src={src}
                alt={`Thumbnail ${i + 1}`}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "/assets/images/placeholder.svg";
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Contact Agent Modal ──────────────────────────────────────────────────────

function ContactAgentModal({
  open,
  onClose,
  propertyId,
}: { open: boolean; onClose: () => void; propertyId: bigint }) {
  const createInquiry = useCreateInquiry();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const contactDetails = JSON.stringify({
      name: form.name,
      email: form.email,
      phone: form.phone,
    });
    await createInquiry.mutateAsync({
      inquiryType: InquiryType.contactAgent,
      propertyId,
      message: form.message,
      contactDetails,
    });
    toast.success("Message sent! The agent will get back to you soon.");
    onClose();
    setForm({ name: "", email: "", phone: "", message: "" });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Contact Agent</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ca-name">Full Name</Label>
              <Input
                id="ca-name"
                required
                placeholder="Jane Doe"
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                data-ocid="contact-agent-name"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ca-phone">Phone</Label>
              <Input
                id="ca-phone"
                type="tel"
                placeholder="+1 555 000"
                value={form.phone}
                onChange={(e) =>
                  setForm((p) => ({ ...p, phone: e.target.value }))
                }
                data-ocid="contact-agent-phone"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ca-email">Email</Label>
            <Input
              id="ca-email"
              type="email"
              required
              placeholder="jane@example.com"
              value={form.email}
              onChange={(e) =>
                setForm((p) => ({ ...p, email: e.target.value }))
              }
              data-ocid="contact-agent-email"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ca-msg">Message</Label>
            <Textarea
              id="ca-msg"
              required
              rows={4}
              placeholder="Hi, I'm interested in this property…"
              value={form.message}
              onChange={(e) =>
                setForm((p) => ({ ...p, message: e.target.value }))
              }
              data-ocid="contact-agent-message"
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={createInquiry.isPending}
            data-ocid="contact-agent-submit"
          >
            {createInquiry.isPending ? "Sending…" : "Send Message"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Schedule Tour Modal ──────────────────────────────────────────────────────

const TIME_SLOTS = [
  "Morning (9am–12pm)",
  "Afternoon (12pm–4pm)",
  "Evening (4pm–7pm)",
];

function ScheduleTourModal({
  open,
  onClose,
  propertyId,
}: { open: boolean; onClose: () => void; propertyId: bigint }) {
  const createInquiry = useCreateInquiry();
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createInquiry.mutateAsync({
      inquiryType: InquiryType.scheduleVisit,
      propertyId,
      message: notes || "Tour requested.",
      preferredTime: `${date} – ${slot}`,
      contactDetails: JSON.stringify({ date, slot }),
    });
    toast.success("Tour scheduled! We'll confirm your visit shortly.");
    onClose();
    setDate("");
    setSlot("");
    setNotes("");
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Schedule a Tour</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="st-date">Preferred Date</Label>
            <Input
              id="st-date"
              type="date"
              required
              value={date}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setDate(e.target.value)}
              data-ocid="tour-date"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="st-slot">Time Slot</Label>
            <Select value={slot} onValueChange={setSlot} required>
              <SelectTrigger id="st-slot" data-ocid="tour-time-slot">
                <SelectValue placeholder="Select a time slot" />
              </SelectTrigger>
              <SelectContent>
                {TIME_SLOTS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="st-notes">Additional Notes</Label>
            <Textarea
              id="st-notes"
              rows={3}
              placeholder="Anything specific you'd like to see?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              data-ocid="tour-notes"
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={createInquiry.isPending || !slot}
            data-ocid="tour-submit"
          >
            {createInquiry.isPending ? "Scheduling…" : "Confirm Tour"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Request Callback Modal ───────────────────────────────────────────────────

const AVAILABILITY_OPTIONS = [
  "Anytime",
  "Morning (9am–12pm)",
  "Afternoon (12pm–5pm)",
  "Evening (5pm–8pm)",
  "Weekends only",
];

function RequestCallbackModal({
  open,
  onClose,
  propertyId,
}: { open: boolean; onClose: () => void; propertyId: bigint }) {
  const createInquiry = useCreateInquiry();
  const [form, setForm] = useState({ name: "", phone: "", availability: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createInquiry.mutateAsync({
      inquiryType: InquiryType.requestCallback,
      propertyId,
      message: `Callback requested. Availability: ${form.availability}`,
      preferredTime: form.availability,
      contactDetails: JSON.stringify({ name: form.name, phone: form.phone }),
    });
    toast.success("Callback requested! An agent will call you soon.");
    onClose();
    setForm({ name: "", phone: "", availability: "" });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Request a Callback</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rc-name">Your Name</Label>
            <Input
              id="rc-name"
              required
              placeholder="Jane Doe"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              data-ocid="callback-name"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rc-phone">Phone Number</Label>
            <Input
              id="rc-phone"
              type="tel"
              required
              placeholder="+1 555 000"
              value={form.phone}
              onChange={(e) =>
                setForm((p) => ({ ...p, phone: e.target.value }))
              }
              data-ocid="callback-phone"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rc-avail">Availability</Label>
            <Select
              value={form.availability}
              onValueChange={(v) => setForm((p) => ({ ...p, availability: v }))}
            >
              <SelectTrigger id="rc-avail" data-ocid="callback-availability">
                <SelectValue placeholder="When can we call?" />
              </SelectTrigger>
              <SelectContent>
                {AVAILABILITY_OPTIONS.map((o) => (
                  <SelectItem key={o} value={o}>
                    {o}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={createInquiry.isPending}
            data-ocid="callback-submit"
          >
            {createInquiry.isPending ? "Requesting…" : "Request Callback"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Contact CTA Panel ────────────────────────────────────────────────────────

type ModalType = "contact" | "tour" | "callback" | null;

function ContactCTAPanel({
  property,
  onOpen,
}: { property: Property; onOpen: (m: ModalType) => void }) {
  return (
    <div className="flex flex-col gap-3 p-5 rounded-2xl bg-card border border-border shadow-elevated">
      <p className="text-2xl font-display font-bold text-primary">
        {formatPrice(property.price)}
      </p>
      <p className="text-sm text-muted-foreground -mt-1">
        {typeLabels[property.propertyType] ?? property.propertyType} ·{" "}
        {property.city}
      </p>
      <div className="border-t border-border pt-3 flex flex-col gap-2.5">
        <Button
          className="w-full gap-2 font-semibold"
          onClick={() => onOpen("contact")}
          data-ocid="cta-contact-agent"
        >
          <Mail className="h-4 w-4" />
          Contact Agent
        </Button>
        <Button
          variant="outline"
          className="w-full gap-2 font-semibold"
          onClick={() => onOpen("tour")}
          data-ocid="cta-schedule-tour"
        >
          <Calendar className="h-4 w-4" />
          Schedule Tour
        </Button>
        <Button
          variant="secondary"
          className="w-full gap-2 font-semibold"
          onClick={() => onOpen("callback")}
          data-ocid="cta-request-callback"
        >
          <PhoneCall className="h-4 w-4" />
          Request Callback
        </Button>
      </div>
    </div>
  );
}

// ─── Skeleton Loader ──────────────────────────────────────────────────────────

function PropertyDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <Skeleton className="h-4 w-64 mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Skeleton className="w-full aspect-[2/1] rounded-2xl" />
          <div className="flex flex-col gap-3">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-5 w-1/3" />
          </div>
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
        <div className="flex flex-col gap-4">
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PropertyDetailPage() {
  const { id } = useParams({ from: "/properties/$id" });

  // Safely parse the URL param — keep hooks unconditional below
  let parsedId: bigint | null = null;
  try {
    const n = BigInt(id);
    if (n >= 0n) parsedId = n;
  } catch {
    // invalid, leave as null
  }
  const propertyId = parsedId ?? 0n;
  const invalidId = parsedId === null;

  const { data: property, isLoading } = useProperty(propertyId);
  const { data: similarProps = [] } = useSimilarProperties(propertyId);
  const { data: currentUser } = useCurrentUser();

  const { has: isSaved, toggle: toggleSavedLocal } = useSavedStore();
  const {
    ids: compareIds,
    add: addCompareLocal,
    remove: removeCompareLocal,
  } = useCompareStore();
  const saveProperty = useSaveProperty();
  const unsaveProperty = useUnsaveProperty();
  const addToCompare = useAddToCompare();
  const removeFromCompare = useRemoveFromCompare();

  const [modal, setModal] = useState<ModalType>(null);
  const stickyRef = useRef<HTMLDivElement>(null);

  const saved = isSaved(propertyId);
  const inCompare = compareIds.some((id) => id === propertyId);
  const canAddCompare = compareIds.length < 4 || inCompare;

  // Schema injection
  useEffect(() => {
    if (!property) return;
    const url = window.location.href;
    const scriptId = "property-schema";
    document.getElementById(scriptId)?.remove();
    const script = document.createElement("script");
    script.id = scriptId;
    script.type = "application/ld+json";
    script.textContent = generatePropertySchema(property, url);
    document.head.appendChild(script);

    const bcScriptId = "property-breadcrumb-schema";
    document.getElementById(bcScriptId)?.remove();
    const bcScript = document.createElement("script");
    bcScript.id = bcScriptId;
    bcScript.type = "application/ld+json";
    bcScript.textContent = generateBreadcrumbSchema([
      { label: "Home", href: "/" },
      {
        label: property.city,
        href: `/cities/${property.city.toLowerCase().replace(/\s+/g, "-")}`,
      },
      {
        label: property.neighborhood,
        href: `/neighborhoods/${property.neighborhood.toLowerCase().replace(/\s+/g, "-")}`,
      },
      { label: property.title },
    ]);
    document.head.appendChild(bcScript);

    return () => {
      document.getElementById(scriptId)?.remove();
      document.getElementById(bcScriptId)?.remove();
    };
  }, [property]);

  const handleSaveToggle = () => {
    toggleSavedLocal(propertyId);
    if (saved) {
      unsaveProperty.mutate(propertyId);
    } else {
      saveProperty.mutate(propertyId);
    }
  };

  const handleCompareToggle = () => {
    if (inCompare) {
      removeCompareLocal(propertyId);
      removeFromCompare.mutate(propertyId);
    } else if (canAddCompare) {
      addCompareLocal(propertyId);
      addToCompare.mutate(propertyId);
    } else {
      toast.error("Compare limit reached. Remove a property first.");
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Could not copy link.");
    }
  };

  if (isLoading) return <PropertyDetailSkeleton />;

  if (invalidId || !property) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <p className="text-6xl font-display font-bold text-primary mb-4">404</p>
        <h1 className="text-2xl font-display font-semibold mb-3">
          {invalidId ? "Invalid property link" : "Property not found"}
        </h1>
        <p className="text-muted-foreground">
          {invalidId
            ? "The property ID in this URL is not valid."
            : "This listing may have been removed or never existed."}
        </p>
      </div>
    );
  }

  const breadcrumbItems = [
    {
      label: property.city,
      href: `/cities/${property.city.toLowerCase().replace(/\s+/g, "-")}`,
    },
    {
      label: property.neighborhood,
      href: `/neighborhoods/${property.neighborhood.toLowerCase().replace(/\s+/g, "-")}`,
    },
    { label: property.title },
  ];

  return (
    <div className="bg-background pb-24 lg:pb-0">
      {/* Modals */}
      <ContactAgentModal
        open={modal === "contact"}
        onClose={() => setModal(null)}
        propertyId={propertyId}
      />
      <ScheduleTourModal
        open={modal === "tour"}
        onClose={() => setModal(null)}
        propertyId={propertyId}
      />
      <RequestCallbackModal
        open={modal === "callback"}
        onClose={() => setModal(null)}
        propertyId={propertyId}
      />

      {/* Page content */}
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Breadcrumbs */}
        <div className="py-4">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* ── Left: Main content ── */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            {/* Gallery */}
            <ImageGallery photos={property.photos} title={property.title} />

            {/* Key info */}
            <div className="flex flex-col gap-4">
              {/* Type badge + status */}
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="secondary"
                  className="text-xs font-semibold uppercase tracking-wide"
                >
                  {typeLabels[property.propertyType] ?? property.propertyType}
                </Badge>
                {property.isFeatured && (
                  <Badge className="bg-primary text-primary-foreground text-xs">
                    Featured
                  </Badge>
                )}
              </div>

              {/* Title */}
              <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground leading-tight">
                {property.title}
              </h1>

              {/* Address */}
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="h-4 w-4 flex-shrink-0 text-primary" />
                <span className="text-sm">
                  {property.address}, {property.neighborhood}, {property.city}
                </span>
              </div>

              {/* Price (mobile-visible) */}
              <p className="text-3xl font-display font-extrabold text-primary lg:hidden">
                {formatPrice(property.price)}
              </p>

              {/* Specs row */}
              <div className="flex flex-wrap gap-4 py-3 border-y border-border">
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <BedDouble className="h-4 w-4 text-muted-foreground" />
                  <span>
                    <strong>{property.bedrooms.toString()}</strong> Bedrooms
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <Bath className="h-4 w-4 text-muted-foreground" />
                  <span>
                    <strong>{property.bathrooms.toString()}</strong> Bathrooms
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <Ruler className="h-4 w-4 text-muted-foreground" />
                  <span>
                    <strong>{Number(property.sqft).toLocaleString()}</strong>{" "}
                    ft²
                  </span>
                </div>
              </div>

              {/* Verification badge */}
              <VerificationBadge
                verifiedAt={property.verifiedAt}
                source={property.verificationSource}
                className="self-start text-sm px-3 py-1"
              />

              {/* Action buttons row */}
              <div className="flex flex-wrap gap-2" ref={stickyRef}>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "gap-2 transition-smooth",
                    saved && "border-primary text-primary",
                  )}
                  onClick={handleSaveToggle}
                  data-ocid="detail-save-btn"
                >
                  <Heart
                    className={cn(
                      "h-4 w-4",
                      saved && "fill-primary text-primary",
                    )}
                  />
                  {saved ? "Saved" : "Save"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "gap-2 transition-smooth",
                    inCompare && "border-primary text-primary",
                  )}
                  onClick={handleCompareToggle}
                  disabled={!canAddCompare && !inCompare}
                  data-ocid="detail-compare-btn"
                >
                  <GitCompare className="h-4 w-4" />
                  {inCompare ? "In Compare" : "Compare"}
                  {compareIds.length > 0 && (
                    <span className="ml-0.5 bg-primary/15 text-primary text-xs font-bold rounded-full px-1.5">
                      {compareIds.length}
                    </span>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 transition-smooth"
                  onClick={handleShare}
                  data-ocid="detail-share-btn"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>

            {/* Description */}
            <section className="flex flex-col gap-3">
              <h2 className="text-lg font-display font-semibold">
                About this property
              </h2>
              <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {property.description}
              </div>
            </section>

            {/* Amenities */}
            {property.amenities.length > 0 && (
              <section className="flex flex-col gap-4 bg-muted/30 rounded-2xl p-5">
                <h2 className="text-lg font-display font-semibold">
                  Amenities
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {property.amenities.map((amenity) => {
                    const { icon, label } = getAmenityDisplay(amenity);
                    return (
                      <div
                        key={amenity}
                        className="flex items-center gap-2.5 bg-card rounded-xl px-3 py-2.5 border border-border text-sm font-medium text-foreground"
                        data-ocid={`amenity-${amenity.toLowerCase().replace(/\s+/g, "-")}`}
                      >
                        <span className="text-primary flex-shrink-0">
                          {icon}
                        </span>
                        {label}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Location map */}
            <section className="flex flex-col gap-4">
              <h2 className="text-lg font-display font-semibold">Location</h2>
              <div className="rounded-2xl overflow-hidden border border-border bg-muted aspect-video relative">
                <img
                  src={`https://picsum.photos/seed/${propertyId.toString()}-map/800/400`}
                  alt="Property location map"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "/assets/images/placeholder.svg";
                  }}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-foreground/70 backdrop-blur-sm px-4 py-3">
                  <p className="text-card font-medium text-sm">
                    {property.address}
                  </p>
                  <p className="text-card/70 text-xs">
                    {property.neighborhood}, {property.city}
                  </p>
                </div>
              </div>
            </section>

            {/* Agent info card */}
            <section className="bg-card rounded-2xl border border-border p-5 flex flex-col gap-4">
              <h2 className="text-lg font-display font-semibold">
                About the Agent
              </h2>
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  <img
                    src={`https://picsum.photos/seed/agent-${property.agentId.toString()}/56/56`}
                    alt="Agent avatar"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
                <div className="flex flex-col gap-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-display font-semibold text-foreground">
                      Verified Agent
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-accent bg-accent/15 rounded-full px-2 py-0.5">
                      <ShieldCheck className="h-3 w-3" /> Verified
                    </span>
                  </div>
                  {currentUser?.role !== undefined && (
                    <p className="text-xs text-muted-foreground font-mono truncate">
                      ID: {property.agentId.toString().slice(0, 16)}…
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => setModal("contact")}
                  data-ocid="agent-card-message-btn"
                >
                  <Mail className="h-4 w-4" />
                  Send Message
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => setModal("callback")}
                  data-ocid="agent-card-phone-btn"
                >
                  <Phone className="h-4 w-4" />
                  Call Agent
                </Button>
              </div>
            </section>

            {/* Similar properties */}
            {similarProps.length > 0 && (
              <section className="flex flex-col gap-5">
                <h2 className="text-lg font-display font-semibold">
                  Similar Properties
                </h2>
                <div className="property-grid">
                  {similarProps.slice(0, 6).map((p) => (
                    <PropertyCard key={p.id.toString()} property={p} />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* ── Right: Desktop sticky sidebar ── */}
          <div className="hidden lg:flex flex-col gap-6 sticky top-6">
            <ContactCTAPanel property={property} onOpen={setModal} />

            {/* Neighborhood insights */}
            <div className="bg-muted/40 rounded-2xl border border-border p-4 flex flex-col gap-3">
              <h3 className="font-display font-semibold text-sm">
                Neighborhood Highlights
              </h3>
              {[
                {
                  label: "Walk Score",
                  value: "87 / 100",
                  sub: "Very Walkable",
                },
                {
                  label: "Transit Score",
                  value: "72 / 100",
                  sub: "Excellent Transit",
                },
                {
                  label: "Schools Nearby",
                  value: "4 schools",
                  sub: "Within 1 mile",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex justify-between items-center text-sm"
                >
                  <span className="text-muted-foreground">{item.label}</span>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">
                      {item.value}
                    </p>
                    <p className="text-xs text-muted-foreground">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile sticky CTA bar ── */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-card border-t border-border px-4 py-3 flex gap-2 shadow-elevated"
        data-ocid="mobile-sticky-cta"
      >
        <Button
          className="flex-1 gap-1.5 font-semibold text-sm"
          onClick={() => setModal("contact")}
          data-ocid="mobile-cta-contact"
        >
          <Mail className="h-4 w-4" />
          Contact
        </Button>
        <Button
          variant="outline"
          className="flex-1 gap-1.5 font-semibold text-sm"
          onClick={() => setModal("tour")}
          data-ocid="mobile-cta-tour"
        >
          <Calendar className="h-4 w-4" />
          Tour
        </Button>
        <Button
          variant="secondary"
          className="flex-1 gap-1.5 font-semibold text-sm"
          onClick={() => setModal("callback")}
          data-ocid="mobile-cta-callback"
        >
          <PhoneCall className="h-4 w-4" />
          Callback
        </Button>
      </div>
    </div>
  );
}
