/**
 * Event System Examples
 * 
 * This file demonstrates common patterns for using the event system.
 * These examples can be used as templates for your own event handlers.
 */

import { eventEmitter } from './emitter';
import { events, users, registrations } from '../db/schema';
import { eq } from 'drizzle-orm';

// ============================================================================
// Example 1: Auto-generate Slug on Event Create
// ============================================================================

export function registerSlugGenerator() {
  eventEmitter.onBefore(
    'events',
    ['create'],
    async (context) => {
      if (!context.payload.slug && context.payload.title) {
        context.payload.slug = context.payload.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
      }
      return context.payload;
    },
    { id: 'slug-generator', priority: 10 }
  );
}

// ============================================================================
// Example 2: Send Email Notification After Registration
// ============================================================================

export function registerRegistrationNotifier() {
  eventEmitter.onAfter(
    'registrations',
    ['create'],
    async (context) => {
      const registration = context.payload;
      
      // Get user details (non-blocking, transaction already committed)
      const user = await context.db.query.users.findFirst({
        where: eq(users.id, registration.userId),
      });
      
      if (user?.email) {
        // Send email (non-blocking)
        // In a real implementation, you'd use your email service
        console.log(`Sending registration email to ${user.email}`);
        // await sendEmail({
        //   to: user.email,
        //   subject: 'Registration Confirmed',
        //   body: `You've registered for ${registration.eventName}`,
        // });
      }
    },
    { id: 'registration-notifier' }
  );
}

// ============================================================================
// Example 3: Validate Capacity Before Event Update
// ============================================================================

export function registerCapacityValidator() {
  eventEmitter.onBefore(
    'events',
    ['update'],
    async (context) => {
      // Only validate if capacity is being changed
      if (context.payload.capacity === undefined) {
        return context.payload;
      }

      // Use non-transactional DB to check current state
      const currentEvent = await context.db.query.events.findFirst({
        where: eq(events.id, context.metadata.entityId!),
      });
      
      if (!currentEvent) {
        throw new Error('Event not found');
      }

      // Check if capacity is being reduced below current registrations
      // (This would require a count query in a real implementation)
      // const currentRegistrations = await context.db
      //   .select({ count: count() })
      //   .from(registrations)
      //   .where(eq(registrations.eventId, context.metadata.entityId!));
      
      // if (context.payload.capacity < currentRegistrations[0].count) {
      //   throw new Error('Capacity cannot be reduced below current registrations');
      // }
      
      return context.payload;
    },
    { id: 'capacity-validator', priority: 5 }
  );
}

// ============================================================================
// Example 4: Update Cache After Any Entity Change
// ============================================================================

export function registerCacheInvalidator() {
  eventEmitter.onAfter(
    '*',
    ['create', 'update', 'delete'],
    async (context) => {
      // Invalidate cache for this entity
      const cacheKey = `${context.metadata.entity}:${context.metadata.entityId}`;
      console.log(`Invalidating cache: ${cacheKey}`);
      
      // In a real implementation:
      // await invalidateCache(cacheKey);
      
      // Optionally update cache with new data
      if (context.metadata.operation !== 'delete') {
        // await setCache(cacheKey, context.payload);
      }
    },
    { id: 'cache-invalidator' }
  );
}

// ============================================================================
// Example 5: Audit Logging
// ============================================================================

export function registerAuditLogger() {
  eventEmitter.onAfter(
    '*',
    ['create', 'update', 'delete'],
    async (context) => {
      // Log to audit table (non-blocking)
      console.log('Audit log:', {
        entity: context.metadata.entity,
        operation: context.metadata.operation,
        entityId: context.metadata.entityId,
        userId: context.metadata.userId,
        timestamp: context.metadata.timestamp,
      });
      
      // In a real implementation:
      // await context.db.insert(auditLogs).values({
      //   entity: context.metadata.entity,
      //   operation: context.metadata.operation,
      //   entityId: context.metadata.entityId,
      //   userId: context.metadata.userId,
      //   tenantId: context.metadata.tenantId,
      //   timestamp: context.metadata.timestamp,
      //   payload: context.payload,
      // });
    },
    { id: 'audit-logger' }
  );
}

// ============================================================================
// Example 6: Create Related Records Atomically
// ============================================================================

export function registerDefaultSettingsCreator() {
  eventEmitter.onBefore(
    'events',
    ['create'],
    async (context) => {
      // Create default settings within the same transaction
      // This ensures if event creation fails, settings creation also fails
      
      // In a real implementation:
      // await context.tx.insert(eventSettings).values({
      //   eventId: context.payload.id, // Would need to generate ID first
      //   allowWaitlist: true,
      //   requireApproval: false,
      // });
      
      return context.payload;
    },
    { id: 'default-settings-creator', priority: 20 }
  );
}

// ============================================================================
// Example 7: Webhook Trigger
// ============================================================================

export function registerWebhookTrigger() {
  eventEmitter.onAfter(
    'events',
    ['create', 'update', 'delete'],
    async (context) => {
      // Trigger webhook (non-blocking)
      const webhookUrl = process.env.WEBHOOK_URL;
      
      if (webhookUrl) {
        try {
          await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              entity: context.metadata.entity,
              operation: context.metadata.operation,
              entityId: context.metadata.entityId,
              payload: context.payload,
            }),
          });
        } catch (error) {
          console.error('Webhook failed:', error);
          // Don't throw - after events are non-blocking
        }
      }
    },
    { id: 'webhook-trigger' }
  );
}

// ============================================================================
// Register All Example Handlers
// ============================================================================

export function registerAllExampleHandlers() {
  registerSlugGenerator();
  registerRegistrationNotifier();
  registerCapacityValidator();
  registerCacheInvalidator();
  registerAuditLogger();
  registerDefaultSettingsCreator();
  registerWebhookTrigger();
  
  console.log('✅ All example event handlers registered');
}
