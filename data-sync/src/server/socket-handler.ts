/**
 * Socket.io handler for real-time sync events
 */

import type { Server as SocketIOServer } from 'socket.io';
import type { SyncDocument, SyncEvent, SyncEventType, DeletionRecord } from '../types';

export interface SocketHandlerConfig {
  onSubscribe?: (socketId: string, collection: string) => void;
  onUnsubscribe?: (socketId: string, collection: string) => void;
  verifyToken?: (token: string) => Promise<{ userId: string } | null>;
}

export class SocketHandler {
  private io: SocketIOServer;
  private config: SocketHandlerConfig;
  private subscriptions: Map<string, Set<string>> = new Map(); // collection -> Set of socketIds

  constructor(io: SocketIOServer, config: SocketHandlerConfig = {}) {
    this.io = io;
    this.config = config;

    this.setupHandlers();
  }

  private setupHandlers(): void {
    this.io.use(async (socket, next) => {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }

      if (this.config.verifyToken) {
        const user = await this.config.verifyToken(token);
        if (!user) {
          return next(new Error('Invalid token'));
        }
        (socket as any).userId = user.userId;
      }

      next();
    });

    this.io.on('connection', (socket) => {
      socket.on('subscribe', (collection: string) => {
        this.handleSubscribe(socket.id, collection);
      });

      socket.on('unsubscribe', (collection: string) => {
        this.handleUnsubscribe(socket.id, collection);
      });

      socket.on('disconnect', () => {
        this.handleDisconnect(socket.id);
      });
    });
  }

  private handleSubscribe(socketId: string, collection: string): void {
    if (!this.subscriptions.has(collection)) {
      this.subscriptions.set(collection, new Set());
    }
    this.subscriptions.get(collection)!.add(socketId);

    if (this.config.onSubscribe) {
      this.config.onSubscribe(socketId, collection);
    }
  }

  private handleUnsubscribe(socketId: string, collection: string): void {
    const subs = this.subscriptions.get(collection);
    if (subs) {
      subs.delete(socketId);
      if (subs.size === 0) {
        this.subscriptions.delete(collection);
      }
    }

    if (this.config.onUnsubscribe) {
      this.config.onUnsubscribe(socketId, collection);
    }
  }

  private handleDisconnect(socketId: string): void {
    // Remove socket from all subscriptions
    this.subscriptions.forEach((socketIds, collection) => {
      socketIds.delete(socketId);
      if (socketIds.size === 0) {
        this.subscriptions.delete(collection);
      }
    });
  }

  /**
   * Emit document created event
   */
  emitDocumentCreated(document: SyncDocument): void {
    const event: SyncEvent = {
      type: SyncEventType.DOCUMENT_CREATED,
      collection: document.collection,
      documentId: document.id,
      document,
      timestamp: new Date(),
    };

    this.emitToCollection(document.collection, event);
  }

  /**
   * Emit document updated event
   */
  emitDocumentUpdated(document: SyncDocument): void {
    const event: SyncEvent = {
      type: SyncEventType.DOCUMENT_UPDATED,
      collection: document.collection,
      documentId: document.id,
      document,
      timestamp: new Date(),
    };

    this.emitToCollection(document.collection, event);
  }

  /**
   * Emit document deleted event
   */
  emitDocumentDeleted(collection: string, id: string, deletedBy: string): void {
    const event: SyncEvent = {
      type: SyncEventType.DOCUMENT_DELETED,
      collection,
      documentId: id,
      timestamp: new Date(),
    };

    this.emitToCollection(collection, event);
  }

  /**
   * Emit event to all subscribers of a collection
   */
  private emitToCollection(collection: string, event: SyncEvent): void {
    const socketIds = this.subscriptions.get(collection);
    if (!socketIds) return;

    socketIds.forEach((socketId) => {
      const socket = this.io.sockets.sockets.get(socketId);
      if (socket) {
        socket.emit('sync:event', event);
      }
    });
  }

  /**
   * Get subscribers for a collection
   */
  getSubscribers(collection: string): string[] {
    const socketIds = this.subscriptions.get(collection);
    return socketIds ? Array.from(socketIds) : [];
  }
}
