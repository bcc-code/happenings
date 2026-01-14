/**
 * Validation utilities for FormBuilder
 */

import type { FormSchema, FormField, ValidationRule } from './types'

export function validateField(
  field: FormField,
  value: any,
  allValues: Record<string, any>
): string | null {
  // Check required
  if (field.required && (value === null || value === undefined || value === '')) {
    return field.validation?.find((v) => v.type === 'required')?.message || `${field.label} is required`
  }

  // Skip other validations if value is empty (unless required)
  if (value === null || value === undefined || value === '') {
    return null
  }

  // Run validation rules
  if (field.validation) {
    for (const rule of field.validation) {
      const error = validateRule(rule, value, allValues)
      if (error) return error
    }
  }

  // Type-specific validations
  switch (field.type) {
    case 'email':
      if (!isValidEmail(value)) {
        return 'Please enter a valid email address'
      }
      break
    case 'url':
      if (!isValidUrl(value)) {
        return 'Please enter a valid URL'
      }
      break
    case 'number':
    case 'decimal':
      if (isNaN(Number(value))) {
        return 'Please enter a valid number'
      }
      if (field.min !== undefined && Number(value) < field.min) {
        return `Value must be at least ${field.min}`
      }
      if (field.max !== undefined && Number(value) > field.max) {
        return `Value must be at most ${field.max}`
      }
      break
    case 'text':
    case 'textarea':
      if (field.min !== undefined && String(value).length < field.min) {
        return `Must be at least ${field.min} characters`
      }
      if (field.max !== undefined && String(value).length > field.max) {
        return `Must be at most ${field.max} characters`
      }
      break
  }

  return null
}

export function validateForm(
  schema: FormSchema,
  values: Record<string, any>
): Record<string, string> {
  const errors: Record<string, string> = {}

  for (const field of schema.fields) {
    if (field.hidden) continue
    
    // Check conditional visibility
    if (field.showIf) {
      const shouldShow = evaluateCondition(field.showIf, values)
      if (!shouldShow) continue
    }

    const value = values[field.name]
    const error = validateField(field, value, values)
    if (error) {
      errors[field.name] = error
    }
  }

  return errors
}

function validateRule(
  rule: ValidationRule,
  value: any,
  allValues: Record<string, any>
): string | null {
  switch (rule.type) {
    case 'required':
      if (value === null || value === undefined || value === '') {
        return rule.message || 'This field is required'
      }
      break
    case 'min':
      if (Number(value) < Number(rule.value)) {
        return rule.message || `Value must be at least ${rule.value}`
      }
      break
    case 'max':
      if (Number(value) > Number(rule.value)) {
        return rule.message || `Value must be at most ${rule.value}`
      }
      break
    case 'minLength':
      if (String(value).length < Number(rule.value)) {
        return rule.message || `Must be at least ${rule.value} characters`
      }
      break
    case 'maxLength':
      if (String(value).length > Number(rule.value)) {
        return rule.message || `Must be at most ${rule.value} characters`
      }
      break
    case 'pattern':
      if (rule.value && !new RegExp(rule.value).test(String(value))) {
        return rule.message || 'Invalid format'
      }
      break
    case 'email':
      if (!isValidEmail(value)) {
        return rule.message || 'Please enter a valid email address'
      }
      break
    case 'url':
      if (!isValidUrl(value)) {
        return rule.message || 'Please enter a valid URL'
      }
      break
    case 'custom':
      if (rule.validator) {
        const result = rule.validator(value)
        if (result !== true) {
          return typeof result === 'string' ? result : rule.message || 'Validation failed'
        }
      }
      break
  }

  return null
}

function evaluateCondition(
  condition: FormField['showIf'],
  values: Record<string, any>
): boolean {
  if (!condition) return true

  const fieldValue = values[condition.field]

  switch (condition.operator) {
    case 'equals':
      return fieldValue === condition.value
    case 'notEquals':
      return fieldValue !== condition.value
    case 'contains':
      return String(fieldValue).includes(String(condition.value))
    case 'greaterThan':
      return Number(fieldValue) > Number(condition.value)
    case 'lessThan':
      return Number(fieldValue) < Number(condition.value)
    default:
      return true
  }
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}
