// Re-export all backend types for use across the app
export type {
  Property,
  PropertyId,
  PropertyStatus,
  PropertyType,
  User,
  UserId,
  UserRole,
  Inquiry,
  InquiryId,
  InquiryType,
  InquiryStatus,
  BlogPost,
  BlogPostId,
  BlogCategory,
  Location,
  LocationId,
  LocationType,
  AdminStats,
  Page,
  SearchFilters,
  CreatePropertyInput,
  UpdatePropertyInput,
  CreateInquiryInput,
  CreateBlogPostInput,
  UpdateBlogPostInput,
  CreateLocationInput,
  UpdateLocationInput,
  RegisterUserInput,
  UpdateUserInput,
  FlaggedContent,
  FlagId,
  FlagStatus,
  FlagAction,
  ContentType,
  Timestamp,
} from "../backend";

// Frontend-only UI types
export interface SearchFormValues {
  keyword: string;
  city: string;
  propertyType: string;
  minPrice: string;
  maxPrice: string;
  minBedrooms: string;
  minBathrooms: string;
}

export interface CompareListStore {
  ids: bigint[];
  add: (id: bigint) => void;
  remove: (id: bigint) => void;
  clear: () => void;
}

export interface SavedPropertiesStore {
  ids: bigint[];
  add: (id: bigint) => void;
  remove: (id: bigint) => void;
  toggle: (id: bigint) => void;
  has: (id: bigint) => boolean;
}

export interface SearchFiltersStore {
  keyword: string;
  city: string;
  propertyType: string;
  minPrice: string;
  maxPrice: string;
  minBedrooms: string;
  minBathrooms: string;
  setFilters: (filters: Partial<SearchFormValues>) => void;
  reset: () => void;
}

export type BreadcrumbItem = {
  label: string;
  href?: string;
};
