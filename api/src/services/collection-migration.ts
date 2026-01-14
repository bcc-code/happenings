/**
 * Collection Migration Service
 * Dynamically generates and runs migrations for new collections
 */

import { db, sql } from '../db/client';
import { collections, collectionFields } from '../db/schema';
import { eq } from 'drizzle-orm';
import { config } from '../config';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type { BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite';

interface CollectionField {
  name: string;
  slug: string;
  type: 'text' | 'number' | 'boolean' | 'date' | 'json' | 'uuid';
  isRequired?: boolean;
  isUnique?: boolean;
  defaultValue?: string;
}

interface CreateCollectionInput {
  name: string;
  slug: string;
  description?: string;
  fields: CollectionField[];
}

/**
 * Convert field type to SQL column type
 */
function getColumnType(field: CollectionField, isPostgres: boolean): string {
  switch (field.type) {
    case 'text':
      return isPostgres ? 'VARCHAR(255)' : 'TEXT';
    case 'number':
      return isPostgres ? 'INTEGER' : 'INTEGER';
    case 'boolean':
      return isPostgres ? 'BOOLEAN' : 'BOOLEAN';
    case 'date':
      return isPostgres ? 'TIMESTAMP' : 'DATETIME';
    case 'json':
      return isPostgres ? 'JSONB' : 'TEXT';
    case 'uuid':
      return isPostgres ? 'UUID' : 'TEXT';
    default:
      return isPostgres ? 'VARCHAR(255)' : 'TEXT';
  }
}

/**
 * Generate table name from slug
 */
function generateTableName(slug: string): string {
  // Convert slug to PascalCase and prefix with Collection
  const pascalCase = slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
  return `Collection${pascalCase}`;
}

/**
 * Create a new collection and generate its table
 */
export async function createCollection(
  input: CreateCollectionInput,
  createdBy: string
) {
  const tableName = generateTableName(input.slug);
  const isPostgres = process.env.DB_TYPE !== 'sqlite' && 
    (process.env.DATABASE_URL?.startsWith('postgres') ?? true);

  // Check if collection with same slug or table name already exists
  const existing = await db.query.collections.findFirst({
    where: (collections, { or, eq }) => 
      or(
        eq(collections.slug, input.slug),
        eq(collections.tableName, tableName)
      ),
  });

  if (existing) {
    throw new Error(`Collection with slug "${input.slug}" or table "${tableName}" already exists`);
  }

  // Start transaction
  try {
    // Create collection record
    const [collection] = await db
      .insert(collections)
      .values({
        name: input.name,
        slug: input.slug,
        description: input.description,
        tableName,
        createdBy,
      })
      .returning();

    // Create field records
    const fieldRecords = input.fields.map((field, index) => ({
      collectionId: collection.id,
      name: field.name,
      slug: field.slug,
      type: field.type,
      isRequired: field.isRequired ?? false,
      isUnique: field.isUnique ?? false,
      defaultValue: field.defaultValue,
      displayOrder: index,
    }));

    await db.insert(collectionFields).values(fieldRecords);

    // Generate and execute migration SQL
    await createCollectionTable(tableName, input.fields, isPostgres);

    return collection;
  } catch (error) {
    // Rollback: delete collection if table creation fails
    await db.delete(collections).where(eq(collections.slug, input.slug));
    throw error;
  }
}

/**
 * Create the actual database table for a collection
 */
async function createCollectionTable(
  tableName: string,
  fields: CollectionField[],
  isPostgres: boolean
) {
  const columns: string[] = [
    isPostgres 
      ? 'id UUID PRIMARY KEY DEFAULT gen_random_uuid()'
      : 'id TEXT PRIMARY KEY',
    'created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    'updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
  ];

  // Add collection fields
  for (const field of fields) {
    const columnType = getColumnType(field, isPostgres);
    let columnDef = `${field.slug} ${columnType}`;
    
    if (field.isRequired) {
      columnDef += ' NOT NULL';
    }
    
    if (field.defaultValue !== undefined) {
      if (field.type === 'text' || field.type === 'uuid') {
        columnDef += ` DEFAULT '${field.defaultValue}'`;
      } else {
        columnDef += ` DEFAULT ${field.defaultValue}`;
      }
    }
    
    columns.push(columnDef);
    
    if (field.isUnique) {
      columns.push(`UNIQUE(${field.slug})`);
    }
  }

  // Add indexes for common fields
  if (isPostgres) {
    columns.push(`CREATE INDEX IF NOT EXISTS ${tableName.toLowerCase()}_created_at_idx ON "${tableName}"(created_at)`);
  }

  const createTableSQL = isPostgres
    ? `CREATE TABLE IF NOT EXISTS "${tableName}" (${columns.filter(c => !c.startsWith('CREATE INDEX')).join(', ')})`
    : `CREATE TABLE IF NOT EXISTS "${tableName}" (${columns.filter(c => !c.startsWith('CREATE INDEX')).join(', ')})`;

  // Execute SQL
  if (isPostgres) {
    await sql.unsafe(createTableSQL);
    // Execute index creation separately
    const indexSQL = columns.find(c => c.startsWith('CREATE INDEX'));
    if (indexSQL) {
      await sql.unsafe(indexSQL);
    }
  } else {
    // SQLite - use prepare/run for DDL
    sql.exec(createTableSQL);
    // Execute index creation separately if exists
    const indexSQL = columns.find(c => c.startsWith('CREATE INDEX'));
    if (indexSQL) {
      sql.exec(indexSQL);
    }
  }
}

/**
 * Get all collections
 */
export async function getAllCollections() {
  return await db.query.collections.findMany({
    with: {
      fields: {
        orderBy: (fields, { asc }) => [asc(fields.displayOrder)],
      },
    },
    orderBy: (collections, { asc }) => [asc(collections.name)],
  });
}

/**
 * Get collection by ID or slug
 */
export async function getCollectionByIdOrSlug(idOrSlug: string) {
  const collection = await db.query.collections.findFirst({
    where: (collections, { or, eq }) => 
      or(
        eq(collections.id, idOrSlug),
        eq(collections.slug, idOrSlug)
      ),
    with: {
      fields: {
        orderBy: (fields, { asc }) => [asc(fields.displayOrder)],
      },
    },
  });

  return collection;
}

/**
 * Helper to check if using PostgreSQL
 */
function isPostgres(): boolean {
  return config.databaseType === 'postgres' || 
    (config.databaseUrl?.startsWith('postgres') ?? false);
}

/**
 * Get items from a collection table
 */
export async function getCollectionItems(
  tableName: string,
  limit = 100,
  offset = 0
) {
  if (isPostgres()) {
    const query = `SELECT * FROM "${tableName}" ORDER BY created_at DESC LIMIT $1 OFFSET $2`;
    const result = await sql.unsafe(query, [limit, offset]);
    return result;
  } else {
    // SQLite
    const query = `SELECT * FROM "${tableName}" ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    const stmt = sql.prepare(query);
    const result = stmt.all(limit, offset) as any[];
    return result;
  }
}

/**
 * Get count of items in a collection
 */
export async function getCollectionItemCount(tableName: string) {
  if (isPostgres()) {
    const query = `SELECT COUNT(*) as count FROM "${tableName}"`;
    const result = await sql.unsafe(query);
    return parseInt(result[0]?.count || '0', 10);
  } else {
    // SQLite
    const query = `SELECT COUNT(*) as count FROM "${tableName}"`;
    const stmt = sql.prepare(query);
    const result = stmt.get() as { count: number };
    return result?.count || 0;
  }
}

/**
 * Get a single collection item by ID
 */
export async function getCollectionItem(tableName: string, id: string) {
  if (isPostgres()) {
    const query = `SELECT * FROM "${tableName}" WHERE id = $1 LIMIT 1`;
    const result = await sql.unsafe(query, [id]);
    return result[0] || null;
  } else {
    // SQLite
    const query = `SELECT * FROM "${tableName}" WHERE id = ? LIMIT 1`;
    const stmt = sql.prepare(query);
    const result = stmt.get(id) as any;
    return result || null;
  }
}

/**
 * Create a new collection item
 */
export async function createCollectionItem(tableName: string, data: Record<string, any>) {
  const fields = Object.keys(data).filter(k => k !== 'id');
  const fieldList = fields.join(', ');
  
  if (isPostgres()) {
    const values = fields.map((_, i) => `$${i + 1}`).join(', ');
    const query = `INSERT INTO "${tableName}" (${fieldList}) VALUES (${values}) RETURNING *`;
    const result = await sql.unsafe(query, fields.map(f => data[f]));
    return result[0];
  } else {
    // SQLite
    const placeholders = fields.map(() => '?').join(', ');
    const query = `INSERT INTO "${tableName}" (${fieldList}) VALUES (${placeholders}) RETURNING *`;
    const stmt = sql.prepare(query);
    const result = stmt.all(...fields.map(f => data[f])) as any[];
    return result[0] || null;
  }
}

/**
 * Update a collection item
 */
export async function updateCollectionItem(
  tableName: string,
  id: string,
  data: Record<string, any>
) {
  const fields = Object.keys(data).filter(k => k !== 'id' && k !== 'created_at');
  
  if (isPostgres()) {
    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const query = `UPDATE "${tableName}" SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${fields.length + 1} RETURNING *`;
    const result = await sql.unsafe(query, [...fields.map(f => data[f]), id]);
    return result[0] || null;
  } else {
    // SQLite
    const setClause = fields.map((f, i) => `${f} = ?`).join(', ');
    const query = `UPDATE "${tableName}" SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ? RETURNING *`;
    const stmt = sql.prepare(query);
    const result = stmt.all(...fields.map(f => data[f]), id) as any[];
    return result[0] || null;
  }
}

/**
 * Delete a collection item
 */
export async function deleteCollectionItem(tableName: string, id: string) {
  if (isPostgres()) {
    const query = `DELETE FROM "${tableName}" WHERE id = $1 RETURNING *`;
    const result = await sql.unsafe(query, [id]);
    return result[0] || null;
  } else {
    // SQLite
    const query = `DELETE FROM "${tableName}" WHERE id = ? RETURNING *`;
    const stmt = sql.prepare(query);
    const result = stmt.all(id) as any[];
    return result[0] || null;
  }
}
