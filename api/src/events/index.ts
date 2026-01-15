/**
 * Event System
 * 
 * Main export for the event-driven architecture
 */

export * from './context';
export * from './emitter';
export * from './helpers';
export * from './types';

// Re-export singleton instance
export { eventEmitter } from './emitter';
