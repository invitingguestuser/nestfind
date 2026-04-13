import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Location {
    id: LocationId;
    latitude: number;
    name: string;
    slug: string;
    description: string;
    featuredImageUrl: string;
    longitude: number;
    parentId?: LocationId;
    locationType: LocationType;
}
export type Timestamp = bigint;
export interface Property {
    id: PropertyId;
    status: PropertyStatus;
    latitude: number;
    title: string;
    verificationSource?: string;
    propertyType: PropertyType;
    bedrooms: bigint;
    city: string;
    neighborhood: string;
    createdAt: Timestamp;
    sqft: bigint;
    description: string;
    agentId: UserId;
    amenities: Array<string>;
    updatedAt: Timestamp;
    isFeatured: boolean;
    longitude: number;
    address: string;
    bathrooms: bigint;
    price: bigint;
    verifiedAt?: Timestamp;
    photos: Array<string>;
}
export type FlagId = bigint;
export interface Page {
    total: bigint;
    page: bigint;
    pageSize: bigint;
    items: Array<Property>;
}
export interface UpdateLocationInput {
    latitude?: number;
    name?: string;
    slug?: string;
    description?: string;
    featuredImageUrl?: string;
    longitude?: number;
}
export interface CreateBlogPostInput {
    metaDescription: string;
    title: string;
    content: string;
    isPublished: boolean;
    slug: string;
    tags: Array<string>;
    featuredImageUrl: string;
    excerpt: string;
    category: BlogCategory;
}
export interface UpdatePropertyInput {
    latitude?: number;
    title?: string;
    propertyType?: PropertyType;
    bedrooms?: bigint;
    city?: string;
    neighborhood?: string;
    sqft?: bigint;
    description?: string;
    amenities?: Array<string>;
    longitude?: number;
    address?: string;
    bathrooms?: bigint;
    price?: bigint;
    photos?: Array<string>;
}
export interface FlaggedContent {
    id: FlagId;
    status: FlagStatus;
    contentId: bigint;
    contentType: ContentType;
    createdAt: Timestamp;
    reportedBy: UserId;
    reason: string;
}
export interface SearchFilters {
    propertyType?: PropertyType;
    city?: string;
    neighborhood?: string;
    page: bigint;
    pageSize: bigint;
    amenities?: Array<string>;
    minBedrooms?: bigint;
    maxPrice?: bigint;
    maxBedrooms?: bigint;
    keyword?: string;
    minPrice?: bigint;
    minBathrooms?: bigint;
}
export interface CreateInquiryInput {
    inquiryType: InquiryType;
    propertyId: PropertyId;
    message: string;
    preferredTime?: string;
    contactDetails: string;
}
export interface BlogPost {
    id: BlogPostId;
    metaDescription: string;
    title: string;
    content: string;
    isPublished: boolean;
    authorId: UserId;
    createdAt: Timestamp;
    slug: string;
    tags: Array<string>;
    publishedAt?: Timestamp;
    updatedAt: Timestamp;
    featuredImageUrl: string;
    excerpt: string;
    category: BlogCategory;
}
export interface UpdateUserInput {
    name?: string;
    email?: string;
    avatarUrl?: string;
    phone?: string;
}
export interface User {
    name: string;
    createdAt: Timestamp;
    role: UserRole;
    isActive: boolean;
    email: string;
    isVerified: boolean;
    avatarUrl: string;
    phone: string;
    principalId: UserId;
}
export interface CreatePropertyInput {
    latitude: number;
    title: string;
    propertyType: PropertyType;
    bedrooms: bigint;
    city: string;
    neighborhood: string;
    sqft: bigint;
    description: string;
    amenities: Array<string>;
    longitude: number;
    address: string;
    bathrooms: bigint;
    price: bigint;
    photos: Array<string>;
}
export interface UpdateBlogPostInput {
    metaDescription?: string;
    title?: string;
    content?: string;
    isPublished?: boolean;
    slug?: string;
    tags?: Array<string>;
    featuredImageUrl?: string;
    excerpt?: string;
    category?: BlogCategory;
}
export interface CreateFlagInput {
    contentId: bigint;
    contentType: ContentType;
    reason: string;
}
export interface CreateLocationInput {
    latitude: number;
    name: string;
    slug: string;
    description: string;
    featuredImageUrl: string;
    longitude: number;
    parentId?: LocationId;
    locationType: LocationType;
}
export type UserId = Principal;
export interface RegisterUserInput {
    name: string;
    role: UserRole;
    email: string;
    avatarUrl: string;
    phone: string;
}
export type InquiryId = bigint;
export type PropertyId = bigint;
export type BlogPostId = bigint;
export interface AdminStats {
    activeUsers: bigint;
    pendingApprovals: bigint;
    totalBlogPosts: bigint;
    totalListings: bigint;
    totalInquiries: bigint;
}
export interface Inquiry {
    id: InquiryId;
    status: InquiryStatus;
    userId: UserId;
    inquiryType: InquiryType;
    createdAt: Timestamp;
    propertyId: PropertyId;
    message: string;
    preferredTime?: string;
    contactDetails: string;
}
export type LocationId = bigint;
export enum BlogCategory {
    news = "news",
    marketTrends = "marketTrends",
    buyingGuide = "buyingGuide",
    rentalGuide = "rentalGuide"
}
export enum ContentType {
    blogPost = "blogPost",
    property = "property"
}
export enum FlagAction {
    remove = "remove",
    dismiss = "dismiss"
}
export enum FlagStatus {
    pending = "pending",
    reviewed = "reviewed",
    removed = "removed"
}
export enum InquiryStatus {
    closed = "closed",
    responded = "responded",
    pending = "pending"
}
export enum InquiryType {
    requestCallback = "requestCallback",
    scheduleVisit = "scheduleVisit",
    contactAgent = "contactAgent"
}
export enum LocationType {
    city = "city",
    neighborhood = "neighborhood"
}
export enum PropertyStatus {
    pending = "pending",
    inactive = "inactive",
    approved = "approved",
    rejected = "rejected"
}
export enum PropertyType {
    studio = "studio",
    commercial = "commercial",
    house = "house",
    villa = "villa",
    apartment = "apartment"
}
export enum UserRole {
    admin = "admin",
    agent = "agent",
    buyer = "buyer"
}
export interface backendInterface {
    activateUser(principalId: UserId): Promise<boolean>;
    addToCompare(propertyId: PropertyId): Promise<void>;
    approveProperty(propertyId: PropertyId, verificationSource: string): Promise<Property | null>;
    createBlogPost(input: CreateBlogPostInput): Promise<BlogPost>;
    createInquiry(input: CreateInquiryInput): Promise<Inquiry>;
    createLocation(input: CreateLocationInput): Promise<Location>;
    createProperty(input: CreatePropertyInput): Promise<Property>;
    deactivateUser(principalId: UserId): Promise<boolean>;
    deleteBlogPost(postId: BlogPostId): Promise<boolean>;
    deleteProperty(propertyId: PropertyId): Promise<boolean>;
    flagContent(input: CreateFlagInput): Promise<FlaggedContent>;
    getAdminStats(): Promise<AdminStats>;
    getAgentListings(agentId: UserId): Promise<Array<Property>>;
    getBlogPost(postId: BlogPostId): Promise<BlogPost | null>;
    getBlogPostBySlug(slug: string): Promise<BlogPost | null>;
    getCompareList(): Promise<Array<Property>>;
    getFeaturedProperties(): Promise<Array<Property>>;
    getInquiry(inquiryId: InquiryId): Promise<Inquiry | null>;
    getLocation(locationId: LocationId): Promise<Location | null>;
    getLocationBySlug(slug: string): Promise<Location | null>;
    getPropertiesByCity(city: string): Promise<Array<Property>>;
    getPropertiesByNeighborhood(neighborhood: string): Promise<Array<Property>>;
    getPropertiesByType(propertyType: PropertyType): Promise<Array<Property>>;
    getProperty(propertyId: PropertyId): Promise<Property | null>;
    getSavedProperties(): Promise<Array<Property>>;
    getSimilarProperties(propertyId: PropertyId): Promise<Array<Property>>;
    getUser(principalId: UserId): Promise<User | null>;
    getUserByPrincipal(): Promise<User | null>;
    listAllInquiries(): Promise<Array<Inquiry>>;
    listAllUsers(): Promise<Array<User>>;
    listBlogPosts(category: BlogCategory | null, isPublished: boolean | null): Promise<Array<BlogPost>>;
    listFlaggedContent(): Promise<Array<FlaggedContent>>;
    listInquiryByProperty(propertyId: PropertyId): Promise<Array<Inquiry>>;
    listInquiryByUser(): Promise<Array<Inquiry>>;
    listLocations(): Promise<Array<Location>>;
    listNeighborhoodsByCity(cityId: LocationId): Promise<Array<Location>>;
    listProperties(page: bigint, pageSize: bigint): Promise<Page>;
    registerUser(input: RegisterUserInput): Promise<User>;
    rejectProperty(propertyId: PropertyId, reason: string): Promise<Property | null>;
    removeFromCompare(propertyId: PropertyId): Promise<void>;
    reviewFlaggedContent(flagId: FlagId, action: FlagAction): Promise<FlaggedContent | null>;
    saveProperty(propertyId: PropertyId): Promise<void>;
    searchProperties(filters: SearchFilters): Promise<Page>;
    setUserRole(principalId: UserId, role: UserRole): Promise<User | null>;
    unsaveProperty(propertyId: PropertyId): Promise<void>;
    updateBlogPost(postId: BlogPostId, input: UpdateBlogPostInput): Promise<BlogPost | null>;
    updateInquiryStatus(inquiryId: InquiryId, status: InquiryStatus): Promise<Inquiry | null>;
    updateLocation(locationId: LocationId, input: UpdateLocationInput): Promise<Location | null>;
    updateProperty(propertyId: PropertyId, input: UpdatePropertyInput): Promise<Property | null>;
    updateUser(input: UpdateUserInput): Promise<User | null>;
}
