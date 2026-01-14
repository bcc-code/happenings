/**
 * Event Emitter
 * 
 * Manages event handler registration and emission for before/after events
 */

import type {
  EventOperation,
  BeforeEventContext,
  AfterEventContext,
  BeforeEventHandler,
  AfterEventHandler,
  EventHandlerRegistration,
  EventMetadata,
} from './types';

/**
 * Event emitter class
 */
export class EventEmitter {
  private handlers: Map<string, EventHandlerRegistration[]> = new Map();

  /**
   * Register a before event handler
   */
  onBefore<T = unknown>(
    entity: string | '*',
    operations: EventOperation[] | '*',
    handler: BeforeEventHandler<T>,
    options?: { id?: string; priority?: number }
  ): string {
    const id = options?.id || `before-${entity}-${Date.now()}-${Math.random()}`;
    const registration: EventHandlerRegistration = {
      id,
      entity,
      operations: operations === '*' ? '*' : operations,
      handler: handler as BeforeEventHandler,
      type: 'before',
      priority: options?.priority || 0,
    };

    this.addHandler(registration);
    return id;
  }

  /**
   * Register an after event handler
   */
  onAfter<T = unknown>(
    entity: string | '*',
    operations: EventOperation[] | '*',
    handler: AfterEventHandler<T>,
    options?: { id?: string; priority?: number }
  ): string {
    const id = options?.id || `after-${entity}-${Date.now()}-${Math.random()}`;
    const registration: EventHandlerRegistration = {
      id,
      entity,
      operations: operations === '*' ? '*' : operations,
      handler: handler as AfterEventHandler,
      type: 'after',
      priority: options?.priority || 0,
    };

    this.addHandler(registration);
    return id;
  }

  /**
   * Unregister an event handler
   */
  off(id: string): boolean {
    for (const [key, handlers] of this.handlers.entries()) {
      const index = handlers.findIndex((h) => h.id === id);
      if (index !== -1) {
        handlers.splice(index, 1);
        if (handlers.length === 0) {
          this.handlers.delete(key);
        }
        return true;
      }
    }
    return false;
  }

  /**
   * Emit before events
   * Processes handlers sequentially and allows payload modification
   * 
   * @returns Modified payload after all handlers process it
   */
  async emitBefore<T = unknown>(
    entity: string,
    operation: EventOperation,
    context: BeforeEventContext<T>
  ): Promise<T> {
    const handlers = this.getHandlers('before', entity, operation);
    let payload = context.payload;

    // Process handlers in priority order (highest first)
    for (const registration of handlers) {
      const handler = registration.handler as BeforeEventHandler<T>;
      const handlerContext: BeforeEventContext<T> = {
        ...context,
        payload,
      };

      try {
        const result = await handler(handlerContext);
        // Handler can return modified payload
        if (result !== undefined) {
          payload = result;
        } else {
          // If handler doesn't return, use payload from context (may have been mutated)
          payload = handlerContext.payload;
        }
      } catch (error) {
        console.error(
          `Error in before event handler ${registration.id} for ${entity}.${operation}:`,
          error
        );
        throw error; // Re-throw to abort transaction
      }
    }

    return payload;
  }

  /**
   * Emit after events
   * Processes handlers asynchronously (non-blocking)
   * Errors are logged but don't affect the operation
   */
  async emitAfter<T = unknown>(
    entity: string,
    operation: EventOperation,
    context: AfterEventContext<T>
  ): Promise<void> {
    const handlers = this.getHandlers('after', entity, operation);

    // Process handlers asynchronously (don't await, but track promises)
    const promises = handlers.map(async (registration) => {
      const handler = registration.handler as AfterEventHandler<T>;
      try {
        await handler(context);
      } catch (error) {
        console.error(
          `Error in after event handler ${registration.id} for ${entity}.${operation}:`,
          error
        );
        // Don't re-throw - after events are non-blocking
      }
    });

    // Wait for all handlers but don't fail if one fails
    await Promise.allSettled(promises);
  }

  /**
   * Get handlers for a specific event
   */
  private getHandlers(
    type: 'before' | 'after',
    entity: string,
    operation: EventOperation
  ): EventHandlerRegistration[] {
    const allHandlers: EventHandlerRegistration[] = [];

    // Collect handlers that match
    for (const handlers of this.handlers.values()) {
      for (const handler of handlers) {
        if (handler.type !== type) continue;

        // Check entity match
        const entityMatch =
          handler.entity === '*' || handler.entity === entity;

        // Check operation match
        const operationMatch =
          handler.operations === '*' ||
          handler.operations.includes(operation);

        if (entityMatch && operationMatch) {
          allHandlers.push(handler);
        }
      }
    }

    // Sort by priority (highest first)
    return allHandlers.sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }

  /**
   * Add a handler to the registry
   */
  private addHandler(registration: EventHandlerRegistration): void {
    const key = `${registration.type}-${registration.entity}`;
    if (!this.handlers.has(key)) {
      this.handlers.set(key, []);
    }
    this.handlers.get(key)!.push(registration);
  }

  /**
   * Get all registered handlers (for debugging/monitoring)
   */
  getHandlers(): EventHandlerRegistration[] {
    const all: EventHandlerRegistration[] = [];
    for (const handlers of this.handlers.values()) {
      all.push(...handlers);
    }
    return all;
  }

  /**
   * Clear all handlers
   */
  clear(): void {
    this.handlers.clear();
  }
}

// Singleton instance
export const eventEmitter = new EventEmitter();
