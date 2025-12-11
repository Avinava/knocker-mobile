import * as Network from 'expo-network';
import { databaseService } from './database';
import { storageService } from './storage';

// Define sync actions
export type SyncAction = 'create' | 'update' | 'delete';
export type EntityType = 'event' | 'lead' | 'property';

interface SyncQueueItem {
    id: number;
    entity_type: EntityType;
    entity_id: string;
    action: SyncAction;
    payload: any;
    attempts: number;
}

class SyncService {
    private static instance: SyncService;
    private isSyncing = false;
    private syncInterval: NodeJS.Timeout | null = null;
    private onSyncStatusChange: ((isSyncing: boolean) => void) | null = null;

    private constructor() { }

    static getInstance(): SyncService {
        if (!SyncService.instance) {
            SyncService.instance = new SyncService();
        }
        return SyncService.instance;
    }

    setSyncStatusCallback(callback: (isSyncing: boolean) => void) {
        this.onSyncStatusChange = callback;
    }

    startBackgroundSync(intervalMs: number = 30000) {
        if (this.syncInterval) return;

        this.processQueue(); // Run immediately
        this.syncInterval = setInterval(() => {
            this.processQueue();
        }, intervalMs);
    }

    stopBackgroundSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
    }

    async processQueue() {
        if (this.isSyncing) return;

        try {
            const networkState = await Network.getNetworkStateAsync();
            if (!networkState.isInternetReachable) return;

            this.isSyncing = true;
            this.onSyncStatusChange?.(true);

            const queue = await databaseService.getQueuedActions();

            if (queue.length === 0) {
                this.isSyncing = false;
                this.onSyncStatusChange?.(false);
                return;
            }

            console.log(`[Sync] Processing ${queue.length} items...`);

            for (const item of queue) {
                try {
                    await this.processItem(item);
                    await databaseService.removeQueueItem(item.id);
                } catch (error) {
                    console.error(`[Sync] Failed to process item ${item.id}`, error);
                    // Logic to update attempts or move to dead letter queue could go here
                }
            }

        } catch (error) {
            console.error('[Sync] Error processing queue', error);
        } finally {
            this.isSyncing = false;
            this.onSyncStatusChange?.(false);
        }
    }

    private async processItem(item: SyncQueueItem) {
        // This function would dispatch to the appropriate API service
        // For now, we will mock the API calls since those services might not be fully ready or loop dependent

        console.log(`[Sync] Syncing ${item.action} on ${item.entity_type} (${item.entity_id})`);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Mapping to actual services (To be implemented when services are ready)
        // switch(item.entity_type) { ... }

        // After successful API call, update local DB status if needed
        if (item.entity_type === 'event' && item.action === 'create') {
            // Mock: Server returns a real ID. In reality, we'd get this from the API response
            const serverId = `server_${item.entity_id}`;
            await databaseService.markEventSynced(item.entity_id, serverId);
        }
    }
}

export const syncService = SyncService.getInstance();
