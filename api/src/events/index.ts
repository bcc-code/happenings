/**
 * Event System
 * 
 * Main export for the event-driven architecture
 */

export * from './types';
export * from './emitter';
export * from './context';
export * from './helpers';

// Re-export singleton instance
export { eventEmitter } from './emitter';
