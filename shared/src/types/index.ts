/**
 * Shared TypeScript types and interfaces
 */

// User types
export interface User {
  id: string;
  auth0Id: string;
  personId?: string | null;
  email: string;
  emailVerified: boolean;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  timezone: string;
  locale: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date | null;
}

// Tenant types
export interface Tenant {
  id: string;
  name: string;
  slug: string;
  domain?: string | null;
  logoUrl?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  timezone: string;
  locale: string;
  currency: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// User Affiliation types
export interface UserAffiliation {
  id: string;
  userId: string;
  tenantId: string;
  role: 'super_admin' | 'admin' | 'event_manager' | 'user';
  isPrimary: boolean;
  status: 'active' | 'inactive';
  joinedAt: Date;
  lastActiveAt?: Date | null;
}

// Event types
export interface Event {
  id: string;
  tenantId: string;
  title: string;
  description?: string | null;
  startDate: Date;
  endDate: Date;
  venue?: string | null;
  capacity?: number | null;
  registrationOpen?: Date | null;
  registrationClose?: Date | null;
  isGlobal: boolean;
  globalAccessRules?: Record<string, any> | null;
  createdAt: Date;
  updatedAt: Date;
}

// Registration types
export interface Registration {
  id: string;
  userId: string;
  eventId: string;
  tenantId: string;
  familyRegistrationId?: string | null;
  pricingTierId?: string | null;
  basePrice: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  registeredAt: Date;
  paymentDueDate?: Date | null;
}

// Family types
export interface FamilyGroup {
  id: string;
  tenantId: string;
  name?: string | null;
  primaryContactId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FamilyGroupMember {
  id: string;
  familyGroupId: string;
  userId: string;
  relationshipType: 'parent' | 'child' | 'spouse' | 'guardian' | 'sibling' | 'other';
  isPrimaryContact: boolean;
  addedAt: Date;
  addedBy?: string | null;
}

export interface FamilyRegistration {
  id: string;
  familyGroupId: string;
  eventId: string;
  tenantId: string;
  primaryContactId: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'partial';
  familyDiscount: number;
  totalAmount: number;
  currency: string;
  registeredAt: Date;
  updatedAt: Date;
}

// API Response types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// Error types
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// Common utility types
export type Status = 'pending' | 'active' | 'inactive' | 'cancelled' | 'completed';
export type Role = 'super_admin' | 'admin' | 'event_manager' | 'user';
export type Currency = 'USD' | 'EUR' | 'GBP' | 'NOK' | 'SEK' | 'DKK';

// Permission System Types
export type PermissionLevel = 'view' | 'edit' | 'manage' | 'owner';
export type GroupType = 'user_group' | 'document_group' | 'both';

export interface Group {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  description?: string | null;
  type: GroupType;
  isSystem: boolean;
  metadata?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  addedAt: Date;
  addedBy?: string | null;
}

export interface GroupAssignment {
  id: string;
  groupId: string;
  entityType: string; // e.g., 'Event', 'Post', 'Registration'
  entityId: string;
  assignedAt: Date;
  assignedBy?: string | null;
  metadata?: string | null;
}

export interface GroupPermission {
  id: string;
  userGroupId: string;
  documentGroupId: string;
  permissionLevel: PermissionLevel;
  grantedAt: Date;
  grantedBy?: string | null;
  metadata?: string | null;
}

/**
 * Permission check result
 */
export interface PermissionResult {
  allowed: boolean;
  level?: PermissionLevel;
  reason?: string;
}

/**
 * Permission check context
 */
export interface PermissionContext {
  userId: string;
  tenantId: string;
  userGroupIds: string[];
  action: PermissionLevel;
  entityType: string;
  entityId: string;
}
