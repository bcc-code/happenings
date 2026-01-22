export type CollectionFieldType = 'text' | 'number' | 'boolean' | 'date' | 'json' | 'uuid'

export interface CollectionField {
  id: string
  name: string
  slug: string
  type: CollectionFieldType
  isRequired: boolean
  isUnique: boolean
  defaultValue?: string | null
}

export interface Collection {
  id: string
  name: string
  slug: string
  description?: string | null
  tableName: string
  fields: CollectionField[]
}

export type CollectionItem = Record<string, unknown> & {
  id: string
  created_at?: string | Date | null
  updated_at?: string | Date | null
}

