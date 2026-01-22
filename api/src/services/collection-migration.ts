/**
 * Collection Migration Service
 * Dynamically generates and runs migrations for new collections
 */

import { eq } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { config } from '../config';
import { db, sql } from '../db/client';
import type * as schema from '../db/schema';
import { collectionFields, collections } from '../db/schema';

type SqliteCollectionRow = {
  id: string
  name: string
  slug: string
  description: string | null
  tableName: string
  isActive: number | null
  createdAt: string | null
  updatedAt: string | null
  createdBy: string | null
}

type SqliteCollectionFieldRow = {
  id: string
  collectionId: string
  name: string
  slug: string
  type: string
  isRequired: number | null
  isUnique: number | null
  defaultValue: string | null
  validation: string | null
  displayOrder: number | null
  createdAt: string | null
  updatedAt: string | null
}

function isSqlite(): boolean {
  return config.databaseType === 'sqlite';
}

function isPostgres(): boolean {
  return config.databaseType === 'postgres' ||
    (config.databaseUrl?.startsWith('postgres') ?? false);
}

function normalizeSqliteValue(value: any) {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'object' && value !== null) return JSON.stringify(value);
  return value;
}

function ensureCollectionMetadataTables() {
  if (!isSqlite()) return;

  // `sql` is a Bun SQLite Database when `DB_TYPE=sqlite`.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const sqlite = sql as any;

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS "Collection" (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      description TEXT,
      tableName TEXT NOT NULL,
      isActive INTEGER DEFAULT 1,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
      createdBy TEXT
    );
  `);

  sqlite.exec(`CREATE UNIQUE INDEX IF NOT EXISTS collection_slug_unique ON "Collection"(slug);`);
  sqlite.exec(`CREATE UNIQUE INDEX IF NOT EXISTS collection_tablename_unique ON "Collection"(tableName);`);
  sqlite.exec(`CREATE INDEX IF NOT EXISTS collection_slug_idx ON "Collection"(slug);`);
  sqlite.exec(`CREATE INDEX IF NOT EXISTS collection_tablename_idx ON "Collection"(tableName);`);

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS "CollectionField" (
      id TEXT PRIMARY KEY,
      collectionId TEXT NOT NULL,
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      type TEXT NOT NULL,
      isRequired INTEGER DEFAULT 0,
      isUnique INTEGER DEFAULT 0,
      defaultValue TEXT,
      validation TEXT,
      displayOrder INTEGER DEFAULT 0,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  sqlite.exec(`CREATE INDEX IF NOT EXISTS collectionfield_collectionid_idx ON "CollectionField"(collectionId);`);
  sqlite.exec(`CREATE INDEX IF NOT EXISTS collectionfield_slug_idx ON "CollectionField"(slug);`);
  sqlite.exec(`CREATE UNIQUE INDEX IF NOT EXISTS collectionfield_collection_slug_unique ON "CollectionField"(collectionId, slug);`);
}

function sqliteDb() {
  if (!isSqlite()) {
    throw new Error('sqliteDb() called when not using sqlite')
  }
  return sql as any
}

function postgresDb() {
  if (isSqlite()) {
    throw new Error('postgresDb() called when using sqlite')
  }
  return db as unknown as PostgresJsDatabase<typeof schema>
}

function parseSqliteBool(value: unknown): boolean {
  return value === 1 || value === true || value === '1' || value === 'true'
}

function mapSqliteField(row: SqliteCollectionFieldRow) {
  return {
    ...row,
    isRequired: parseSqliteBool(row.isRequired),
    isUnique: parseSqliteBool(row.isUnique),
    displayOrder: row.displayOrder ?? 0,
    validation: row.validation ? safeJsonParse(row.validation) : null,
  }
}

function safeJsonParse(value: string) {
  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}

function sqliteGetFields(collectionId: string) {
  const sqlite = sqliteDb()
  const stmt = sqlite.prepare(
    `SELECT * FROM "CollectionField" WHERE collectionId = ? ORDER BY displayOrder ASC`
  )
  const rows = stmt.all(collectionId) as SqliteCollectionFieldRow[]
  return rows.map(mapSqliteField)
}

function sqliteGetCollectionByIdOrSlug(idOrSlug: string) {
  const sqlite = sqliteDb()
  const stmt = sqlite.prepare(`SELECT * FROM "Collection" WHERE id = ? OR slug = ? LIMIT 1`)
  const row = stmt.get(idOrSlug, idOrSlug) as SqliteCollectionRow | null
  if (!row) return null
  return {
    ...row,
    isActive: parseSqliteBool(row.isActive),
    fields: sqliteGetFields(row.id),
  }
}

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
  const isPostgresDb = isPostgres();

  if (isSqlite()) {
    const sqlite = sqliteDb()
    const existingStmt = sqlite.prepare(
      `SELECT id FROM "Collection" WHERE slug = ? OR tableName = ? LIMIT 1`
    )
    const existing = existingStmt.get(input.slug, tableName) as { id: string } | null
    if (existing) {
      throw new Error(`Collection with slug "${input.slug}" or table "${tableName}" already exists`)
    }

    const collectionId = crypto.randomUUID()

    sqlite.exec('BEGIN')
    try {
      const insertCollection = sqlite.prepare(
        `INSERT INTO "Collection" (id, name, slug, description, tableName, isActive, createdBy)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      insertCollection.run(
        collectionId,
        input.name,
        input.slug,
        input.description ?? null,
        tableName,
        1,
        createdBy
      )

      const insertField = sqlite.prepare(
        `INSERT INTO "CollectionField"
          (id, collectionId, name, slug, type, isRequired, isUnique, defaultValue, validation, displayOrder)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )

      input.fields.forEach((field, index) => {
        insertField.run(
          crypto.randomUUID(),
          collectionId,
          field.name,
          field.slug,
          field.type,
          field.isRequired ? 1 : 0,
          field.isUnique ? 1 : 0,
          field.defaultValue ?? null,
          null,
          index
        )
      })

      await createCollectionTable(tableName, input.fields, false)
      sqlite.exec('COMMIT')
    } catch (e) {
      sqlite.exec('ROLLBACK')
      throw e
    }

    const full = sqliteGetCollectionByIdOrSlug(collectionId)
    if (!full) {
      throw new Error('Failed to load created collection')
    }
    return full as any
  }

  const pgDb = postgresDb()

  // Check if collection with same slug or table name already exists
  const existing = await pgDb.query.collections.findFirst({
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
    const [collection] = await pgDb
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

    await pgDb.insert(collectionFields).values(fieldRecords);

    // Generate and execute migration SQL
    await createCollectionTable(tableName, input.fields, isPostgresDb);

    // Return the full collection including fields (matches GET /collections shape)
    const full = await getCollectionByIdOrSlug(collection.id)
    return (full ?? collection) as any
  } catch (error) {
    // Rollback: delete collection if table creation fails
    await pgDb.delete(collections).where(eq(collections.slug, input.slug));
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
    // SQLite - use sqliteDb() to get the SQLite database instance
    const sqlite = sqliteDb();
    sqlite.exec(createTableSQL);
    // Execute index creation separately if exists
    const indexSQL = columns.find(c => c.startsWith('CREATE INDEX'));
    if (indexSQL) {
      sqlite.exec(indexSQL);
    }
  }
}

/**
 * Get all collections
 */
export async function getAllCollections() {
  if (isSqlite()) {
    const sqlite = sqliteDb()
    const rows = sqlite
      .prepare(`SELECT * FROM "Collection" ORDER BY name ASC`)
      .all() as SqliteCollectionRow[]
    return rows.map((row) => ({
      ...row,
      isActive: parseSqliteBool(row.isActive),
      fields: sqliteGetFields(row.id),
    })) as any
  }
  const pgDb = postgresDb()
  return await pgDb.query.collections.findMany({
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
  if (isSqlite()) {
    return sqliteGetCollectionByIdOrSlug(idOrSlug) as any
  }
  const pgDb = postgresDb()
  const collection = await pgDb.query.collections.findFirst({
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
  const isPostgresDb = isPostgres();

  if (!isPostgresDb && !data.id) {
    data.id = crypto.randomUUID();
  }

  const fields = Object.keys(data).filter(k => (isPostgresDb ? k !== 'id' : true));
  const fieldList = fields.join(', ');
  
  if (isPostgresDb) {
    const values = fields.map((_, i) => `$${i + 1}`).join(', ');
    const query = `INSERT INTO "${tableName}" (${fieldList}) VALUES (${values}) RETURNING *`;
    const result = await sql.unsafe(query, fields.map(f => data[f]));
    return result[0];
  } else {
    // SQLite
    const placeholders = fields.map(() => '?').join(', ');
    const query = `INSERT INTO "${tableName}" (${fieldList}) VALUES (${placeholders}) RETURNING *`;
    const stmt = sql.prepare(query);
    const result = stmt.all(...fields.map(f => normalizeSqliteValue(data[f]))) as any[];
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
  const isPostgresDb = isPostgres();
  const fields = Object.keys(data).filter(k => k !== 'id' && k !== 'created_at');
  
  if (isPostgresDb) {
    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const query = `UPDATE "${tableName}" SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${fields.length + 1} RETURNING *`;
    const result = await sql.unsafe(query, [...fields.map(f => data[f]), id]);
    return result[0] || null;
  } else {
    // SQLite
    const setClause = fields.map((f, i) => `${f} = ?`).join(', ');
    const query = `UPDATE "${tableName}" SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ? RETURNING *`;
    const stmt = sql.prepare(query);
    const result = stmt.all(...fields.map(f => normalizeSqliteValue(data[f])), id) as any[];
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
