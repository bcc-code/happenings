/**
 * Super-admin tenant endpoints
 */

import type { Context } from 'elysia';
import { asc, eq, ne } from 'drizzle-orm';
import { config } from '../../config';
import { db, sql } from '../../db/client';
import { tenants } from '../../db/schema';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type * as schema from '../../db/schema';
import { error, success } from '../../utils/response';

function isSqlite(): boolean {
  return config.databaseType === 'sqlite';
}

function isPostgres(): boolean {
  return config.databaseType === 'postgres' ||
    (config.databaseUrl?.startsWith('postgres') ?? false);
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

function ensureTenantTable() {
  if (!isSqlite()) return;

  const sqlite = sqliteDb();

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS "Tenant" (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      domain TEXT,
      logoUrl TEXT,
      primaryColor TEXT,
      secondaryColor TEXT,
      timezone TEXT DEFAULT 'UTC',
      locale TEXT DEFAULT 'en',
      currency TEXT DEFAULT 'USD',
      isActive INTEGER DEFAULT 1,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  sqlite.exec(`CREATE UNIQUE INDEX IF NOT EXISTS tenant_slug_unique ON "Tenant"(slug);`);
  sqlite.exec(`CREATE UNIQUE INDEX IF NOT EXISTS tenant_domain_unique ON "Tenant"(domain);`);
  sqlite.exec(`CREATE INDEX IF NOT EXISTS tenant_slug_idx ON "Tenant"(slug);`);
  sqlite.exec(`CREATE INDEX IF NOT EXISTS tenant_domain_idx ON "Tenant"(domain);`);
}

function parseSqliteBool(value: unknown): boolean {
  return value === 1 || value === true || value === '1' || value === 'true'
}

type SqliteTenantRow = {
  id: string
  name: string
  slug: string
  domain: string | null
  logoUrl: string | null
  primaryColor: string | null
  secondaryColor: string | null
  timezone: string | null
  locale: string | null
  currency: string | null
  isActive: number | null
  createdAt: string | null
  updatedAt: string | null
}

function mapSqliteTenant(row: SqliteTenantRow) {
  return {
    ...row,
    isActive: parseSqliteBool(row.isActive),
    timezone: row.timezone || 'UTC',
    locale: row.locale || 'en',
    currency: row.currency || 'USD',
  }
}

function sqliteGetAllTenants() {
  const sqlite = sqliteDb()
  const stmt = sqlite.prepare(`SELECT * FROM "Tenant" ORDER BY name ASC`)
  const rows = stmt.all() as SqliteTenantRow[]
  return rows.map(mapSqliteTenant)
}

function sqliteGetTenantById(id: string) {
  const sqlite = sqliteDb()
  const stmt = sqlite.prepare(`SELECT * FROM "Tenant" WHERE id = ? LIMIT 1`)
  const row = stmt.get(id) as SqliteTenantRow | null
  return row ? mapSqliteTenant(row) : null
}

function sqliteGetTenantBySlugOrDomain(slug: string, domain?: string) {
  const sqlite = sqliteDb()
  if (domain) {
    const stmt = sqlite.prepare(`SELECT * FROM "Tenant" WHERE slug = ? OR domain = ? LIMIT 1`)
    const row = stmt.get(slug, domain) as SqliteTenantRow | null
    return row ? mapSqliteTenant(row) : null
  } else {
    const stmt = sqlite.prepare(`SELECT * FROM "Tenant" WHERE slug = ? LIMIT 1`)
    const row = stmt.get(slug) as SqliteTenantRow | null
    return row ? mapSqliteTenant(row) : null
  }
}

export async function listTenants() {
  try {
    if (isSqlite()) {
      const rows = sqliteGetAllTenants();
      return success(rows);
    }

    const pgDb = postgresDb();
    const rows = await pgDb.query.tenants.findMany({
      orderBy: [asc(tenants.name)],
    });

    return success(rows);
  } catch (err) {
    console.error('Error listing tenants:', err);
    return error('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

export async function getTenant({ params }: Context) {
  try {
    const { tenantId } = params as { tenantId: string };
    
    if (isSqlite()) {
      const row = sqliteGetTenantById(tenantId);
      if (!row) {
        return error('Tenant not found', 'NOT_FOUND', 404);
      }
      return success(row);
    }

    const pgDb = postgresDb();
    const row = await pgDb.query.tenants.findFirst({
      where: eq(tenants.id, tenantId),
    });

    if (!row) {
      return error('Tenant not found', 'NOT_FOUND', 404);
    }

    return success(row);
  } catch (err) {
    console.error('Error fetching tenant:', err);
    return error('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

export async function createTenant({ body, store }: Context) {
  try {
    const input = body as {
      name: string;
      slug: string;
      domain?: string;
      logoUrl?: string;
      primaryColor?: string;
      secondaryColor?: string;
      timezone?: string;
      locale?: string;
      currency?: string;
      isActive?: boolean;
    };

    if (!input.name || !input.slug) {
      return error('Name and slug are required', 'VALIDATION_ERROR', 400);
    }

    if (isSqlite()) {
      // Check if slug or domain already exists
      const existing = sqliteGetTenantBySlugOrDomain(input.slug, input.domain);
      if (existing) {
        return error(
          existing.slug === input.slug
            ? 'A tenant with this slug already exists'
            : 'A tenant with this domain already exists',
          'DUPLICATE_ERROR',
          409
        );
      }

      const tenantId = crypto.randomUUID();
      const sqlite = sqliteDb();
      const insert = sqlite.prepare(
        `INSERT INTO "Tenant" 
         (id, name, slug, domain, logoUrl, primaryColor, secondaryColor, timezone, locale, currency, isActive)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      );

      insert.run(
        tenantId,
        input.name,
        input.slug,
        input.domain || null,
        input.logoUrl || null,
        input.primaryColor || null,
        input.secondaryColor || null,
        input.timezone || 'UTC',
        input.locale || 'en',
        input.currency || 'USD',
        input.isActive !== false ? 1 : 0
      );

      const tenant = sqliteGetTenantById(tenantId);
      if (!tenant) {
        throw new Error('Failed to retrieve created tenant');
      }
      return success(tenant, 201);
    }

    const pgDb = postgresDb();
    // Check if slug or domain already exists
    const existing = await pgDb.query.tenants.findFirst({
      where: (tenants, { or, eq }) =>
        or(
          eq(tenants.slug, input.slug),
          ...(input.domain ? [eq(tenants.domain, input.domain)] : [])
        ),
    });

    if (existing) {
      return error(
        existing.slug === input.slug
          ? 'A tenant with this slug already exists'
          : 'A tenant with this domain already exists',
        'DUPLICATE_ERROR',
        409
      );
    }

    const [tenant] = await pgDb
      .insert(tenants)
      .values({
        name: input.name,
        slug: input.slug,
        domain: input.domain || null,
        logoUrl: input.logoUrl || null,
        primaryColor: input.primaryColor || null,
        secondaryColor: input.secondaryColor || null,
        timezone: input.timezone || 'UTC',
        locale: input.locale || 'en',
        currency: input.currency || 'USD',
        isActive: input.isActive ?? true,
      })
      .returning();

    return success(tenant, 201);
  } catch (err: any) {
    console.error('Error creating tenant:', err);
    return error(
      err.message || 'Internal server error',
      'INTERNAL_ERROR',
      err.message?.includes('unique') || err.message?.includes('duplicate') ? 409 : 500
    );
  }
}

export async function updateTenant({ params, body, store }: Context) {
  try {
    const { tenantId } = params as { tenantId: string };
    const input = body as {
      name?: string;
      slug?: string;
      domain?: string;
      logoUrl?: string;
      primaryColor?: string;
      secondaryColor?: string;
      timezone?: string;
      locale?: string;
      currency?: string;
      isActive?: boolean;
    };

    if (isSqlite()) {
      // Check if tenant exists
      const existing = sqliteGetTenantById(tenantId);
      if (!existing) {
        return error('Tenant not found', 'NOT_FOUND', 404);
      }

      // Check for duplicate slug or domain if being changed
      if (input.slug || input.domain) {
        const duplicate = sqliteGetTenantBySlugOrDomain(
          input.slug || existing.slug,
          input.domain || existing.domain || undefined
        );
        if (duplicate && duplicate.id !== tenantId) {
          return error(
            duplicate.slug === (input.slug || existing.slug)
              ? 'A tenant with this slug already exists'
              : 'A tenant with this domain already exists',
            'DUPLICATE_ERROR',
            409
          );
        }
      }

      const sqlite = sqliteDb();
      const updates: string[] = [];
      const values: any[] = [];

      if (input.name !== undefined) {
        updates.push('name = ?');
        values.push(input.name);
      }
      if (input.slug !== undefined) {
        updates.push('slug = ?');
        values.push(input.slug);
      }
      if (input.domain !== undefined) {
        updates.push('domain = ?');
        values.push(input.domain || null);
      }
      if (input.logoUrl !== undefined) {
        updates.push('logoUrl = ?');
        values.push(input.logoUrl || null);
      }
      if (input.primaryColor !== undefined) {
        updates.push('primaryColor = ?');
        values.push(input.primaryColor || null);
      }
      if (input.secondaryColor !== undefined) {
        updates.push('secondaryColor = ?');
        values.push(input.secondaryColor || null);
      }
      if (input.timezone !== undefined) {
        updates.push('timezone = ?');
        values.push(input.timezone);
      }
      if (input.locale !== undefined) {
        updates.push('locale = ?');
        values.push(input.locale);
      }
      if (input.currency !== undefined) {
        updates.push('currency = ?');
        values.push(input.currency);
      }
      if (input.isActive !== undefined) {
        updates.push('isActive = ?');
        values.push(input.isActive ? 1 : 0);
      }
      updates.push('updatedAt = CURRENT_TIMESTAMP');
      values.push(tenantId);

      const updateStmt = sqlite.prepare(
        `UPDATE "Tenant" SET ${updates.join(', ')} WHERE id = ?`
      );
      updateStmt.run(...values);

      const updated = sqliteGetTenantById(tenantId);
      if (!updated) {
        throw new Error('Failed to retrieve updated tenant');
      }
      return success(updated);
    }

    const pgDb = postgresDb();
    // Check if tenant exists
    const existing = await pgDb.query.tenants.findFirst({
      where: eq(tenants.id, tenantId),
    });

    if (!existing) {
      return error('Tenant not found', 'NOT_FOUND', 404);
    }

    // Check for duplicate slug or domain if being changed
    if (input.slug || input.domain) {
      const duplicate = await pgDb.query.tenants.findFirst({
        where: (tenants, { and, or, eq, ne }) =>
          and(
            ne(tenants.id, tenantId),
            or(
              ...(input.slug ? [eq(tenants.slug, input.slug)] : []),
              ...(input.domain ? [eq(tenants.domain, input.domain)] : [])
            )
          ),
      });

      if (duplicate) {
        return error(
          duplicate.slug === input.slug
            ? 'A tenant with this slug already exists'
            : 'A tenant with this domain already exists',
          'DUPLICATE_ERROR',
          409
        );
      }
    }

    const [updated] = await pgDb
      .update(tenants)
      .set({
        ...(input.name !== undefined && { name: input.name }),
        ...(input.slug !== undefined && { slug: input.slug }),
        ...(input.domain !== undefined && { domain: input.domain || null }),
        ...(input.logoUrl !== undefined && { logoUrl: input.logoUrl || null }),
        ...(input.primaryColor !== undefined && { primaryColor: input.primaryColor || null }),
        ...(input.secondaryColor !== undefined && { secondaryColor: input.secondaryColor || null }),
        ...(input.timezone !== undefined && { timezone: input.timezone }),
        ...(input.locale !== undefined && { locale: input.locale }),
        ...(input.currency !== undefined && { currency: input.currency }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
        updatedAt: new Date(),
      })
      .where(eq(tenants.id, tenantId))
      .returning();

    return success(updated);
  } catch (err: any) {
    console.error('Error updating tenant:', err);
    return error(
      err.message || 'Internal server error',
      'INTERNAL_ERROR',
      err.message?.includes('unique') || err.message?.includes('duplicate') ? 409 : 500
    );
  }
}

export async function deleteTenant({ params, store }: Context) {
  try {
    const { tenantId } = params as { tenantId: string };

    if (isSqlite()) {
      // Check if tenant exists
      const existing = sqliteGetTenantById(tenantId);
      if (!existing) {
        return error('Tenant not found', 'NOT_FOUND', 404);
      }

      const sqlite = sqliteDb();
      const deleteStmt = sqlite.prepare(`DELETE FROM "Tenant" WHERE id = ?`);
      deleteStmt.run(tenantId);

      return success({ deleted: true, id: tenantId });
    }

    const pgDb = postgresDb();
    // Check if tenant exists
    const existing = await pgDb.query.tenants.findFirst({
      where: eq(tenants.id, tenantId),
    });

    if (!existing) {
      return error('Tenant not found', 'NOT_FOUND', 404);
    }

    // Check if tenant has any events (soft validation - could be enhanced)
    // For now, we'll allow deletion but could add a check here

    await pgDb.delete(tenants).where(eq(tenants.id, tenantId));

    return success({ deleted: true, id: tenantId });
  } catch (err: any) {
    console.error('Error deleting tenant:', err);
    return error(
      err.message || 'Internal server error',
      'INTERNAL_ERROR',
      500
    );
  }
}

