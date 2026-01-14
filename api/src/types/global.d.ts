/**
 * Global type definitions for Bun
 */

declare global {
  // Bun provides these globals
  const Bun: typeof import('bun');
  const process: NodeJS.Process;
  const console: Console;
}

export {};
