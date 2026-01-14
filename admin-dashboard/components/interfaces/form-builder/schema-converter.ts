/**
 * Utilities to convert Drizzle ORM schema definitions to FormBuilder schema format
 * 
 * This provides helpers to convert database schema information into
 * JSON schema definitions that FormBuilder can use.
 */

import type { FormField, FormSchema } from './types'

/**
 * Convert a Drizzle table schema to FormBuilder schema
 * 
 * @param tableName - Name of the table
 * @param columns - Column definitions from Drizzle schema
 * @param relations - Relationship definitions (optional)
 * @returns FormBuilder schema
 */
export function drizzleToFormSchema(
  tableName: string,
  columns: Record<string, any>,
  relations?: Record<string, any>
): FormSchema {
  const fields: FormField[] = []

  // Convert columns to form fields
  for (const [columnName, columnDef] of Object.entries(columns)) {
    const field = columnToFormField(columnName, columnDef, relations)
    if (field) {
      fields.push(field)
    }
  }

  return {
    table: tableName,
    fields,
  }
}

/**
 * Convert a Drizzle column definition to a FormField
 */
function columnToFormField(
  columnName: string,
  columnDef: any,
  relations?: Record<string, any>
): FormField | null {
  // Skip internal fields
  if (columnName === 'id' && columnDef.primaryKey) {
    return null // ID fields are usually auto-generated
  }

  // Check if this is a foreign key (relationship)
  const relation = findRelation(columnName, relations)
  if (relation) {
    return {
      name: columnName,
      label: formatLabel(columnName),
      type: 'relationship',
      relationship: {
        type: 'manyToOne',
        table: relation.targetTable,
        foreignKey: columnName,
        displayField: relation.displayField || 'name',
        valueField: 'id',
      },
      required: !columnDef.notNull === false, // Inverted logic: notNull means required
      defaultValue: columnDef.default,
    }
  }

  // Determine field type from column definition
  const fieldType = inferFieldType(columnDef)
  
  return {
    name: columnName,
    label: formatLabel(columnName),
    type: fieldType,
    required: columnDef.notNull === true,
    defaultValue: columnDef.default,
    placeholder: `Enter ${formatLabel(columnName)}`,
    // Add type-specific options
    ...(fieldType === 'number' || fieldType === 'decimal' ? {
      min: columnDef.min,
      max: columnDef.max,
    } : {}),
    ...(fieldType === 'textarea' ? {
      rows: 4,
    } : {}),
  }
}

/**
 * Infer FormField type from Drizzle column definition
 */
function inferFieldType(columnDef: any): FormField['type'] {
  const columnType = columnDef.dataType || columnDef.columnType || ''

  // Check for specific types
  if (columnType.includes('varchar') || columnType.includes('text')) {
    if (columnDef.length && columnDef.length > 255) {
      return 'textarea'
    }
    return 'text'
  }

  if (columnType.includes('integer') || columnType.includes('bigint')) {
    return 'number'
  }

  if (columnType.includes('decimal') || columnType.includes('numeric') || columnType.includes('float')) {
    return 'decimal'
  }

  if (columnType.includes('boolean') || columnType === 'boolean') {
    return 'boolean'
  }

  if (columnType.includes('timestamp') || columnType.includes('date')) {
    if (columnType.includes('time')) {
      return 'datetime'
    }
    return 'date'
  }

  if (columnType.includes('json') || columnType.includes('jsonb')) {
    return 'json'
  }

  // Default to text
  return 'text'
}

/**
 * Find relationship for a column
 */
function findRelation(
  columnName: string,
  relations?: Record<string, any>
): { targetTable: string; displayField: string } | null {
  if (!relations) return null

  // Look for relation that references this column
  for (const [relationName, relationDef] of Object.entries(relations)) {
    if (relationDef.fields?.includes(columnName)) {
      return {
        targetTable: relationDef.references?.[0] || relationName,
        displayField: 'name', // Default, should be inferred from target schema
      }
    }
  }

  return null
}

/**
 * Format column name to label
 */
function formatLabel(columnName: string): string {
  return columnName
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim()
}

/**
 * Create a form schema from a JSON definition
 * This is useful when you have schema definitions stored as JSON
 */
export function createFormSchemaFromJSON(json: {
  table: string
  title?: string
  description?: string
  fields: Array<{
    name: string
    label: string
    type: string
    [key: string]: any
  }>
  sections?: Array<{
    title?: string
    description?: string
    fields: string[]
    [key: string]: any
  }>
}): FormSchema {
  return {
    table: json.table,
    title: json.title,
    description: json.description,
    fields: json.fields.map((f) => ({
      ...f,
      type: f.type as FormField['type'],
    })),
    sections: json.sections,
  }
}

/**
 * Example: Convert Event schema to FormBuilder schema
 * 
 * This is a helper that creates a schema for the Event table
 */
export function createEventFormSchema(): FormSchema {
  return {
    table: 'Event',
    title: 'Event Details',
    description: 'Create or edit an event',
    fields: [
      {
        name: 'title',
        label: 'Event Title',
        type: 'text',
        required: true,
        placeholder: 'Enter event title',
      },
      {
        name: 'description',
        label: 'Description',
        type: 'textarea',
        rows: 6,
        placeholder: 'Enter event description',
      },
      {
        name: 'startDate',
        label: 'Start Date',
        type: 'datetime',
        required: true,
      },
      {
        name: 'endDate',
        label: 'End Date',
        type: 'datetime',
        required: true,
      },
      {
        name: 'venue',
        label: 'Venue',
        type: 'text',
        placeholder: 'Enter venue name',
      },
      {
        name: 'capacity',
        label: 'Capacity',
        type: 'number',
        min: 1,
        placeholder: 'Enter maximum capacity',
      },
      {
        name: 'tenantId',
        label: 'Tenant',
        type: 'relationship',
        relationship: {
          type: 'manyToOne',
          table: 'Tenant',
          foreignKey: 'tenantId',
          displayField: 'name',
          valueField: 'id',
        },
        required: true,
      },
    ],
    sections: [
      {
        title: 'Basic Information',
        fields: ['title', 'description', 'tenantId'],
      },
      {
        title: 'Date & Location',
        fields: ['startDate', 'endDate', 'venue', 'capacity'],
      },
    ],
  }
}
