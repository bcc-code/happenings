/**
 * SQLite table initialization
 * Ensures all required tables exist when using SQLite
 * This is called once at server startup
 */

import { config } from '../config';
import { sql } from './client';

function isSqlite(): boolean {
  return config.databaseType === 'sqlite';
}

function sqliteDb() {
  if (!isSqlite()) {
    throw new Error('sqliteDb() called when not using sqlite')
  }
  return sql as any
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

function ensureCollectionMetadataTables() {
  if (!isSqlite()) return;

  const sqlite = sqliteDb();

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

function ensureEventTable() {
  if (!isSqlite()) return;

  const sqlite = sqliteDb();

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS "Event" (
      id TEXT PRIMARY KEY,
      "tenantId" TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      "startDate" TEXT NOT NULL,
      "endDate" TEXT NOT NULL,
      venue TEXT,
      capacity INTEGER,
      "registrationOpen" TEXT,
      "registrationClose" TEXT,
      "isGlobal" INTEGER DEFAULT 0,
      "globalAccessRules" TEXT,
      "createdAt" TEXT DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  sqlite.exec(`CREATE INDEX IF NOT EXISTS event_tenantid_idx ON "Event"("tenantId");`);
  sqlite.exec(`CREATE INDEX IF NOT EXISTS event_isglobal_idx ON "Event"("isGlobal");`);
  sqlite.exec(`CREATE INDEX IF NOT EXISTS event_startdate_idx ON "Event"("startDate");`);
}

function ensureAuditLogTable() {
  if (!isSqlite()) return;

  const sqlite = sqliteDb();

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS "AuditLog" (
      id TEXT PRIMARY KEY,
      "parentId" TEXT,
      collection TEXT NOT NULL,
      "itemId" TEXT NOT NULL,
      operation TEXT NOT NULL,
      "userId" TEXT NOT NULL,
      "userIp" TEXT,
      "userRole" TEXT,
      "tenantId" TEXT,
      delta TEXT NOT NULL,
      "oldData" TEXT,
      "newData" TEXT,
      "createdAt" TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
    );
  `);

  sqlite.exec(`CREATE INDEX IF NOT EXISTS auditlog_collection_item_idx ON "AuditLog"(collection, "itemId");`);
  sqlite.exec(`CREATE INDEX IF NOT EXISTS auditlog_userid_idx ON "AuditLog"("userId");`);
  sqlite.exec(`CREATE INDEX IF NOT EXISTS auditlog_tenantid_idx ON "AuditLog"("tenantId");`);
  sqlite.exec(`CREATE INDEX IF NOT EXISTS auditlog_createdat_idx ON "AuditLog"("createdAt");`);
  sqlite.exec(`CREATE INDEX IF NOT EXISTS auditlog_parentid_idx ON "AuditLog"("parentId");`);
  sqlite.exec(`CREATE INDEX IF NOT EXISTS auditlog_operation_idx ON "AuditLog"(operation);`);
}

function ensureUserTable() {
  if (!isSqlite()) return;

  const sqlite = sqliteDb();

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS "User" (
      id TEXT PRIMARY KEY,
      "auth0Id" TEXT NOT NULL,
      "personId" TEXT,
      email TEXT NOT NULL,
      "emailVerified" INTEGER DEFAULT 0,
      "firstName" TEXT,
      "lastName" TEXT,
      phone TEXT,
      "avatarUrl" TEXT,
      timezone TEXT DEFAULT 'UTC',
      locale TEXT DEFAULT 'en',
      "createdAt" TEXT DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TEXT DEFAULT CURRENT_TIMESTAMP,
      "lastLoginAt" TEXT
    );
  `);

  sqlite.exec(`CREATE UNIQUE INDEX IF NOT EXISTS user_auth0id_unique ON "User"("auth0Id");`);
  sqlite.exec(`CREATE UNIQUE INDEX IF NOT EXISTS user_email_unique ON "User"(email);`);
  sqlite.exec(`CREATE UNIQUE INDEX IF NOT EXISTS user_personid_unique ON "User"("personId");`);
  sqlite.exec(`CREATE INDEX IF NOT EXISTS user_auth0id_idx ON "User"("auth0Id");`);
  sqlite.exec(`CREATE INDEX IF NOT EXISTS user_email_idx ON "User"(email);`);
  sqlite.exec(`CREATE INDEX IF NOT EXISTS user_personid_idx ON "User"("personId");`);
}

function ensureUserAffiliationTable() {
  if (!isSqlite()) return;

  const sqlite = sqliteDb();

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS "UserAffiliation" (
      id TEXT PRIMARY KEY,
      "userId" TEXT NOT NULL,
      "tenantId" TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      "isPrimary" INTEGER DEFAULT 0,
      status TEXT DEFAULT 'active',
      "joinedAt" TEXT DEFAULT CURRENT_TIMESTAMP,
      "lastActiveAt" TEXT
    );
  `);

  sqlite.exec(`CREATE UNIQUE INDEX IF NOT EXISTS useraffiliation_user_tenant_unique ON "UserAffiliation"("userId", "tenantId");`);
  sqlite.exec(`CREATE INDEX IF NOT EXISTS useraffiliation_userid_idx ON "UserAffiliation"("userId");`);
  sqlite.exec(`CREATE INDEX IF NOT EXISTS useraffiliation_tenantid_idx ON "UserAffiliation"("tenantId");`);
}

function ensureRegistrationTable() {
  if (!isSqlite()) return;

  const sqlite = sqliteDb();

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS "Registration" (
      id TEXT PRIMARY KEY,
      "userId" TEXT NOT NULL,
      "eventId" TEXT NOT NULL,
      "tenantId" TEXT NOT NULL,
      "familyRegistrationId" TEXT,
      "pricingTierId" TEXT,
      "basePrice" TEXT DEFAULT '0',
      "discountAmount" TEXT DEFAULT '0',
      "taxAmount" TEXT DEFAULT '0',
      "totalAmount" TEXT DEFAULT '0',
      currency TEXT DEFAULT 'USD',
      status TEXT DEFAULT 'pending',
      "registeredAt" TEXT DEFAULT CURRENT_TIMESTAMP,
      "paymentDueDate" TEXT
    );
  `);

  sqlite.exec(`CREATE INDEX IF NOT EXISTS registration_userid_idx ON "Registration"("userId");`);
  sqlite.exec(`CREATE INDEX IF NOT EXISTS registration_eventid_idx ON "Registration"("eventId");`);
  sqlite.exec(`CREATE INDEX IF NOT EXISTS registration_tenantid_idx ON "Registration"("tenantId");`);
  sqlite.exec(`CREATE INDEX IF NOT EXISTS registration_status_idx ON "Registration"(status);`);
  sqlite.exec(`CREATE INDEX IF NOT EXISTS registration_familyregistrationid_idx ON "Registration"("familyRegistrationId");`);
}

function ensureCacheTable() {
  if (!isSqlite()) return;

  const sqlite = sqliteDb();

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS "Cache" (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      "expiresAt" TEXT,
      "createdAt" TEXT DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  sqlite.exec(`CREATE INDEX IF NOT EXISTS cache_expiresat_idx ON "Cache"("expiresAt");`);
  sqlite.exec(`CREATE INDEX IF NOT EXISTS cache_createdat_idx ON "Cache"("createdAt");`);
}

/**
 * Ensure all SQLite tables exist
 * Call this once at server startup
 */
export function ensureAllTables() {
  if (!isSqlite()) {
    return;
  }

  try {
    // Core tables (required for basic functionality)
    ensureTenantTable();
    ensureUserTable();
    ensureUserAffiliationTable();
    
    // Event system tables
    ensureEventTable();
    ensureRegistrationTable();
    
    // Admin/system tables
    ensureCollectionMetadataTables();
    ensureAuditLogTable();
    ensureCacheTable();
    
    if (config.nodeEnv === 'development') {
      console.log('✅ All SQLite tables ensured');
    }
  } catch (err) {
    console.error('❌ Error ensuring SQLite tables:', err);
    throw err;
  }
}
