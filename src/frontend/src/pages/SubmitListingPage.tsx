import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  Loader2,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { useActor } from "@caffeineai/core-infrastructure";
import { PropertyType, createActor } from "../backend";
import { useCreateProperty } from "../hooks/useProperties";
import type { CreatePropertyInput } from "../types";

// ─── Constants ───────────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: "Basic Info" },
  { id: 2, label: "Location" },
  { id: 3, label: "Photos" },
  { id: 4, label: "Details" },
  { id: 5, label: "Contact" },
];

const AMENITIES = [
  "Parking",
  "Pool",
  "Gym",
  "Garden",
  "Elevator",
  "Balcony",
  "Furnished",
  "Pet-friendly",
  "Concierge",
  "Security",
];

const PROPERTY_TYPES = [
  { value: PropertyType.apartment, label: "Apartment" },
  { value: PropertyType.house, label: "House" },
  { value: PropertyType.villa, label: "Villa" },
  { value: PropertyType.studio, label: "Studio" },
  { value: PropertyType.commercial, label: "Commercial" },
];

// ─── Types ────────────────────────────────────────────────────────────────────
interface PhotoFile {
  id: string;
  file: File;
  previewUrl: string;
  progress: number;
  uploaded: boolean;
  dataUrl?: string;
}

interface FormState {
  // Step 1 — Basic info
  title: string;
  propertyType: PropertyType | "";
  price: string;
  bedrooms: string;
  bathrooms: string;
  sqft: string;
  // Step 2 — Location
  address: string;
  city: string;
  neighborhood: string;
  latitude: string;
  longitude: string;
  // Step 3 — Photos (handled separately)
  // Step 4 — Details
  description: string;
  amenities: string[];
  // Step 5 — Contact
  agentName: string;
  email: string;
  phone: string;
  whatsapp: string;
  neighborhoodDesc: string;
}

const INITIAL_FORM: FormState = {
  title: "",
  propertyType: "",
  price: "",
  bedrooms: "",
  bathrooms: "",
  sqft: "",
  address: "",
  city: "",
  neighborhood: "",
  latitude: "",
  longitude: "",
  description: "",
  amenities: [],
  agentName: "",
  email: "",
  phone: "",
  whatsapp: "",
  neighborhoodDesc: "",
};

// ─── Helper ───────────────────────────────────────────────────────────────────
function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ─── Step Indicator ──────────────────────────────────────────────────────────
function StepIndicator({ current }: { current: number }) {
  return (
    <nav aria-label="Form steps" className="mb-8">
      <ol className="flex items-center gap-0">
        {STEPS.map((step, idx) => {
          const done = step.id < current;
          const active = step.id === current;
          return (
            <li
              key={step.id}
              className="flex items-center flex-1 last:flex-none"
            >
              <div className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold border-2 transition-all",
                    done
                      ? "bg-primary border-primary text-primary-foreground"
                      : active
                        ? "border-primary text-primary bg-primary/10"
                        : "border-border text-muted-foreground bg-card",
                  )}
                  aria-current={active ? "step" : undefined}
                >
                  {done ? <CheckCircle2 className="h-4 w-4" /> : step.id}
                </div>
                <span
                  className={cn(
                    "hidden sm:block text-xs font-medium",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {step.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mt-[-12px] mx-1",
                    done ? "bg-primary" : "bg-border",
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// ─── Photo Upload ─────────────────────────────────────────────────────────────
function PhotoUploadStep({
  photos,
  onAdd,
  onRemove,
  error,
}: {
  photos: PhotoFile[];
  onAdd: (files: File[]) => void;
  onRemove: (id: string) => void;
  error?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      /image\/(jpeg|png|webp)/.test(f.type),
    );
    if (files.length) onAdd(files);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length) onAdd(files);
    e.target.value = "";
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-foreground mb-1">
          Property Photos
        </h3>
        <p className="text-sm text-muted-foreground">
          Add at least 3 photos (JPEG, PNG, or WebP). Maximum 20 photos.
        </p>
      </div>

      {/* Drop zone */}
      {photos.length < 20 && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className={cn(
            "w-full rounded-xl border-2 border-dashed p-8 text-center transition-colors",
            "hover:border-primary hover:bg-primary/5 cursor-pointer",
            error ? "border-destructive" : "border-border",
          )}
          data-ocid="photo-dropzone"
        >
          <ImagePlus className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
          <p className="font-medium text-foreground mb-1">
            Drag photos here or click to upload
          </p>
          <p className="text-xs text-muted-foreground">
            JPEG, PNG, WebP · {photos.length}/20 uploaded
          </p>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={handleChange}
            data-ocid="photo-file-input"
          />
        </button>
      )}

      {error && (
        <p className="flex items-center gap-1.5 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          {error}
        </p>
      )}

      {/* Thumbnails */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {photos.map((p, idx) => (
            <div
              key={p.id}
              className="relative group aspect-square rounded-lg overflow-hidden border border-border bg-muted"
            >
              {p.previewUrl && (
                <img
                  src={p.previewUrl}
                  alt={`Upload ${idx + 1}`}
                  className="h-full w-full object-cover"
                />
              )}
              {/* Progress overlay */}
              {!p.uploaded && (
                <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
                  <div className="w-3/4">
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-300"
                        style={{ width: `${p.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-center mt-1 text-muted-foreground">
                      {p.progress}%
                    </p>
                  </div>
                </div>
              )}
              {idx === 0 && (
                <Badge className="absolute bottom-1 left-1 text-[10px] px-1.5 py-0 bg-primary text-primary-foreground">
                  Cover
                </Badge>
              )}
              <button
                type="button"
                onClick={() => onRemove(p.id)}
                className="absolute top-1 right-1 h-5 w-5 rounded-full bg-card/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
                aria-label="Remove photo"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Confirmation ─────────────────────────────────────────────────────────────
function ConfirmationView({ refNumber }: { refNumber: string }) {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-accent/15">
        <CheckCircle2 className="h-10 w-10 text-accent" />
      </div>
      <h2 className="text-2xl font-display font-bold text-foreground mb-2">
        Listing Submitted!
      </h2>
      <p className="text-muted-foreground max-w-sm mb-6">
        Your listing has been submitted for review. Our team will verify it
        within 24–48 hours.
      </p>
      <div className="rounded-xl border border-border bg-muted/40 px-6 py-4 mb-8 w-full max-w-xs">
        <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">
          Reference Number
        </p>
        <p className="font-mono text-xl font-bold text-primary">{refNumber}</p>
        <Badge
          variant="outline"
          className="mt-2 text-xs border-yellow-500/40 text-yellow-700 dark:text-yellow-400"
        >
          Pending Review
        </Badge>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="outline"
          onClick={() => navigate({ to: "/agent/dashboard" })}
          data-ocid="go-to-dashboard-btn"
        >
          View My Listings
        </Button>
        <Button
          onClick={() => navigate({ to: "/submit-listing" })}
          data-ocid="submit-another-btn"
        >
          Submit Another
        </Button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SubmitListingPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [photos, setPhotos] = useState<PhotoFile[]>([]);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  const createProperty = useCreateProperty();
  const { isFetching: actorLoading } = useActor(createActor);

  const setField = (key: keyof FormState, value: string | string[]) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const toggleAmenity = (amenity: string) => {
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(amenity)
        ? f.amenities.filter((a) => a !== amenity)
        : [...f.amenities, amenity],
    }));
  };

  const addPhotos = async (files: File[]) => {
    if (photos.length >= 20) return;
    const remaining = 20 - photos.length;
    const toAdd = files.slice(0, remaining);

    const newPhotos: PhotoFile[] = toAdd.map((file) => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      previewUrl: URL.createObjectURL(file),
      progress: 0,
      uploaded: false,
    }));

    setPhotos((p) => [...p, ...newPhotos]);

    // Simulate upload progress while reading file
    for (const photo of newPhotos) {
      // Animate progress
      const progressInterval = setInterval(() => {
        setPhotos((p) =>
          p.map((ph) =>
            ph.id === photo.id && ph.progress < 90
              ? { ...ph, progress: ph.progress + 20 }
              : ph,
          ),
        );
      }, 100);

      const dataUrl = await readFileAsDataURL(photo.file);
      clearInterval(progressInterval);

      setPhotos((p) =>
        p.map((ph) =>
          ph.id === photo.id
            ? { ...ph, dataUrl, progress: 100, uploaded: true }
            : ph,
        ),
      );
    }
  };

  const removePhoto = (id: string) => {
    setPhotos((p) => {
      const photo = p.find((ph) => ph.id === id);
      if (photo?.previewUrl) URL.revokeObjectURL(photo.previewUrl);
      return p.filter((ph) => ph.id !== id);
    });
  };

  // ─── Validation ────────────────────────────────────────────────────────────
  const validateStep = (s: number): boolean => {
    const newErrors: Partial<Record<string, string>> = {};
    if (s === 1) {
      if (!form.title.trim()) newErrors.title = "Title is required";
      if (!form.propertyType) newErrors.propertyType = "Select a property type";
      if (
        !form.price ||
        Number.isNaN(Number(form.price)) ||
        Number(form.price) <= 0
      )
        newErrors.price = "Enter a valid price";
      if (!form.bedrooms || Number.isNaN(Number(form.bedrooms)))
        newErrors.bedrooms = "Enter bedrooms count";
      if (!form.bathrooms || Number.isNaN(Number(form.bathrooms)))
        newErrors.bathrooms = "Enter bathrooms count";
      if (!form.sqft || Number.isNaN(Number(form.sqft)))
        newErrors.sqft = "Enter square footage";
    }
    if (s === 2) {
      if (!form.address.trim()) newErrors.address = "Address is required";
      if (!form.city.trim()) newErrors.city = "City is required";
    }
    if (s === 3) {
      if (photos.length < 3) newErrors.photos = "Upload at least 3 photos";
      const unready = photos.some((p) => !p.uploaded);
      if (unready)
        newErrors.photos = "Please wait for all photos to finish uploading";
    }
    if (s === 5) {
      if (!form.agentName.trim()) newErrors.agentName = "Name is required";
      if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email))
        newErrors.email = "Enter a valid email";
      if (!form.phone.trim()) newErrors.phone = "Phone number is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, 5));
  };

  const handleBack = () => {
    setStep((s) => Math.max(s - 1, 1));
    setErrors({});
  };

  const handleSubmit = async () => {
    if (!validateStep(5)) return;

    const photoUrls = photos
      .filter((p) => p.uploaded && p.dataUrl)
      .map((p) => p.dataUrl as string);

    const input: CreatePropertyInput = {
      title: form.title.trim(),
      propertyType: form.propertyType as PropertyType,
      price: BigInt(Math.round(Number(form.price))),
      bedrooms: BigInt(Math.round(Number(form.bedrooms))),
      bathrooms: BigInt(Math.round(Number(form.bathrooms))),
      sqft: BigInt(Math.round(Number(form.sqft))),
      address: form.address.trim(),
      city: form.city.trim(),
      neighborhood: form.neighborhood.trim(),
      latitude: form.latitude ? Number.parseFloat(form.latitude) : 0,
      longitude: form.longitude ? Number.parseFloat(form.longitude) : 0,
      description: form.description,
      amenities: form.amenities,
      photos: photoUrls,
    };

    try {
      const property = await createProperty.mutateAsync(input);
      setSubmittedRef(`NF-${property.id.toString().padStart(6, "0")}`);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to submit. Please try again.";
      setErrors({ submit: message });
    }
  };

  if (submittedRef) return <ConfirmationView refNumber={submittedRef} />;

  return (
    <div className="bg-background min-h-screen">
      {/* Hero band */}
      <div className="bg-card border-b border-border py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-1">
            Submit Your Listing
          </h1>
          <p className="text-muted-foreground">
            List your property for thousands of buyers and renters to discover.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-2xl py-8">
        <StepIndicator current={step} />

        <div className="bg-card rounded-2xl border border-border shadow-card p-6 sm:p-8">
          {/* ── Step 1: Basic Info ── */}
          {step === 1 && (
            <div className="space-y-5" data-ocid="step-basic-info">
              <h2 className="text-lg font-display font-semibold text-foreground">
                Basic Information
              </h2>

              <div>
                <Label htmlFor="title">
                  Property Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="e.g. Bright 2-bed apartment in downtown"
                  value={form.title}
                  onChange={(e) => setField("title", e.target.value)}
                  className={cn("mt-1", errors.title && "border-destructive")}
                  data-ocid="input-title"
                />
                {errors.title && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.title}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="propertyType">
                  Property Type <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={form.propertyType}
                  onValueChange={(v) => setField("propertyType", v)}
                >
                  <SelectTrigger
                    className={cn(
                      "mt-1",
                      errors.propertyType && "border-destructive",
                    )}
                    data-ocid="select-property-type"
                  >
                    <SelectValue placeholder="Select type…" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROPERTY_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.propertyType && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.propertyType}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="price">
                  Price (USD) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  placeholder="e.g. 450000"
                  value={form.price}
                  onChange={(e) => setField("price", e.target.value)}
                  className={cn("mt-1", errors.price && "border-destructive")}
                  data-ocid="input-price"
                />
                {errors.price && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.price}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="bedrooms">
                    Bedrooms <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={form.bedrooms}
                    onChange={(e) => setField("bedrooms", e.target.value)}
                    className={cn(
                      "mt-1",
                      errors.bedrooms && "border-destructive",
                    )}
                    data-ocid="input-bedrooms"
                  />
                  {errors.bedrooms && (
                    <p className="mt-1 text-xs text-destructive">
                      {errors.bedrooms}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="bathrooms">
                    Bathrooms <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={form.bathrooms}
                    onChange={(e) => setField("bathrooms", e.target.value)}
                    className={cn(
                      "mt-1",
                      errors.bathrooms && "border-destructive",
                    )}
                    data-ocid="input-bathrooms"
                  />
                  {errors.bathrooms && (
                    <p className="mt-1 text-xs text-destructive">
                      {errors.bathrooms}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="sqft">
                    Sq. Ft. <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="sqft"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={form.sqft}
                    onChange={(e) => setField("sqft", e.target.value)}
                    className={cn("mt-1", errors.sqft && "border-destructive")}
                    data-ocid="input-sqft"
                  />
                  {errors.sqft && (
                    <p className="mt-1 text-xs text-destructive">
                      {errors.sqft}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Step 2: Location ── */}
          {step === 2 && (
            <div className="space-y-5" data-ocid="step-location">
              <h2 className="text-lg font-display font-semibold text-foreground">
                Location Details
              </h2>

              <div>
                <Label htmlFor="address">
                  Street Address <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="address"
                  placeholder="e.g. 123 Main Street, Apt 4B"
                  value={form.address}
                  onChange={(e) => setField("address", e.target.value)}
                  className={cn("mt-1", errors.address && "border-destructive")}
                  data-ocid="input-address"
                />
                {errors.address && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.address}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">
                    City <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="city"
                    placeholder="e.g. New York"
                    value={form.city}
                    onChange={(e) => setField("city", e.target.value)}
                    className={cn("mt-1", errors.city && "border-destructive")}
                    data-ocid="input-city"
                  />
                  {errors.city && (
                    <p className="mt-1 text-xs text-destructive">
                      {errors.city}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="neighborhood">Neighborhood</Label>
                  <Input
                    id="neighborhood"
                    placeholder="e.g. Brooklyn Heights"
                    value={form.neighborhood}
                    onChange={(e) => setField("neighborhood", e.target.value)}
                    className="mt-1"
                    data-ocid="input-neighborhood"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    placeholder="e.g. 40.7128"
                    value={form.latitude}
                    onChange={(e) => setField("latitude", e.target.value)}
                    className="mt-1"
                    data-ocid="input-latitude"
                  />
                </div>
                <div>
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    placeholder="e.g. -74.0060"
                    value={form.longitude}
                    onChange={(e) => setField("longitude", e.target.value)}
                    className="mt-1"
                    data-ocid="input-longitude"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Coordinates help display your property on the map. Enter
                manually or leave blank.
              </p>
            </div>
          )}

          {/* ── Step 3: Photos ── */}
          {step === 3 && (
            <div data-ocid="step-photos">
              <PhotoUploadStep
                photos={photos}
                onAdd={addPhotos}
                onRemove={removePhoto}
                error={errors.photos}
              />
            </div>
          )}

          {/* ── Step 4: Details ── */}
          {step === 4 && (
            <div className="space-y-6" data-ocid="step-details">
              <h2 className="text-lg font-display font-semibold text-foreground">
                Property Details
              </h2>

              <div>
                <Label>Description</Label>
                <div
                  className={cn(
                    "mt-1 rounded-lg border border-input overflow-hidden",
                    "[&_.ql-toolbar]:border-0 [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-border",
                    "[&_.ql-container]:border-0 [&_.ql-editor]:min-h-[180px]",
                    "[&_.ql-editor]:text-foreground [&_.ql-editor]:bg-background",
                    "[&_.ql-toolbar]:bg-muted/30",
                  )}
                  data-ocid="input-description"
                >
                  <ReactQuill
                    theme="snow"
                    value={form.description}
                    onChange={(v) => setField("description", v)}
                    placeholder="Describe your property — key features, surroundings, unique selling points…"
                    modules={{
                      toolbar: [
                        [{ header: [2, 3, false] }],
                        ["bold", "italic", "underline"],
                        [{ list: "ordered" }, { list: "bullet" }],
                        ["clean"],
                      ],
                    }}
                  />
                </div>
              </div>

              <div>
                <Label className="mb-3 block">Amenities</Label>
                <div
                  className="grid grid-cols-2 sm:grid-cols-3 gap-3"
                  data-ocid="amenities-checkboxes"
                >
                  {AMENITIES.map((amenity) => (
                    <label
                      key={amenity}
                      htmlFor={`amenity-${amenity}`}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg border p-3 cursor-pointer transition-colors",
                        form.amenities.includes(amenity)
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/40 hover:bg-muted/30",
                      )}
                    >
                      <Checkbox
                        id={`amenity-${amenity}`}
                        checked={form.amenities.includes(amenity)}
                        onCheckedChange={() => toggleAmenity(amenity)}
                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <span className="text-sm font-medium text-foreground">
                        {amenity}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Step 5: Contact ── */}
          {step === 5 && (
            <div className="space-y-5" data-ocid="step-contact">
              <h2 className="text-lg font-display font-semibold text-foreground">
                Contact Information
              </h2>

              <div>
                <Label htmlFor="agentName">
                  Your Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="agentName"
                  placeholder="Full name"
                  value={form.agentName}
                  onChange={(e) => setField("agentName", e.target.value)}
                  className={cn(
                    "mt-1",
                    errors.agentName && "border-destructive",
                  )}
                  data-ocid="input-agent-name"
                />
                {errors.agentName && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.agentName}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="agent@example.com"
                    value={form.email}
                    onChange={(e) => setField("email", e.target.value)}
                    className={cn("mt-1", errors.email && "border-destructive")}
                    data-ocid="input-email"
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-destructive">
                      {errors.email}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="phone">
                    Phone <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={form.phone}
                    onChange={(e) => setField("phone", e.target.value)}
                    className={cn("mt-1", errors.phone && "border-destructive")}
                    data-ocid="input-phone"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-xs text-destructive">
                      {errors.phone}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="whatsapp">WhatsApp Number (optional)</Label>
                <Input
                  id="whatsapp"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={form.whatsapp}
                  onChange={(e) => setField("whatsapp", e.target.value)}
                  className="mt-1"
                  data-ocid="input-whatsapp"
                />
              </div>

              <div>
                <Label htmlFor="neighborhoodDesc">
                  Neighborhood Notes (optional)
                </Label>
                <textarea
                  id="neighborhoodDesc"
                  rows={3}
                  placeholder="Describe the neighborhood — nearby schools, transport, amenities…"
                  value={form.neighborhoodDesc}
                  onChange={(e) => setField("neighborhoodDesc", e.target.value)}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                  data-ocid="input-neighborhood-desc"
                />
              </div>

              {errors.submit && (
                <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
                  <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                  <p className="text-sm text-destructive">{errors.submit}</p>
                </div>
              )}
            </div>
          )}

          {/* ── Navigation ── */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1}
              data-ocid="btn-back"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>

            {step < 5 ? (
              <Button onClick={handleNext} data-ocid="btn-next">
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={createProperty.isPending || actorLoading}
                data-ocid="btn-submit-listing"
              >
                {createProperty.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting…
                  </>
                ) : actorLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Connecting…
                  </>
                ) : (
                  "Submit Listing"
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Step hint */}
        <p className="text-center text-xs text-muted-foreground mt-4">
          Step {step} of {STEPS.length} — {STEPS[step - 1]?.label}
        </p>
      </div>
    </div>
  );
}
