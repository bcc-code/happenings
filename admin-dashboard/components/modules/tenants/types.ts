export interface Tenant {
  id: string
  name: string
  slug: string
  domain?: string | null
  logoUrl?: string | null
  primaryColor?: string | null
  secondaryColor?: string | null
  timezone: string
  locale: string
  currency: string
  isActive: boolean
  createdAt?: string | Date | null
  updatedAt?: string | Date | null
}
