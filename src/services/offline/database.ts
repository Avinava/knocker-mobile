import * as SQLite from 'expo-sqlite';
import { MIGRATIONS } from './schema';

class DatabaseService {
    private static instance: DatabaseService;
    private db: SQLite.SQLiteDatabase | null = null;
    private dbName = 'knocker.db';

    private constructor() { }

    static getInstance(): DatabaseService {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService();
        }
        return DatabaseService.instance;
    }

    async initialize(): Promise<void> {
        try {
            this.db = await SQLite.openDatabaseAsync(this.dbName);
            await this.runMigrations();
            console.log('Database initialized successfully');
        } catch (error) {
            console.error('Failed to initialize database:', error);
            throw error;
        }
    }

    private async runMigrations(): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');

        // Simple migration runner
        // In a real app, track version in a user_version pragma or metadata table
        for (const migration of MIGRATIONS) {
            await migration(this.db);
        }
    }

    getDatabase(): SQLite.SQLiteDatabase {
        if (!this.db) {
            throw new Error('Database not initialized. Call initialize() first.');
        }
        return this.db;
    }

    // --- Properties ---

    async saveProperty(property: any): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');

        // Upsert property
        await this.db.runAsync(
            `INSERT OR REPLACE INTO properties (id, data, latitude, longitude, updated_at, synced_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
            [
                property.id,
                JSON.stringify(property),
                property.location.latitude,
                property.location.longitude,
                Date.now(),
                Date.now() // Assume synced if coming from server, logic might vary
            ]
        );
    }

    async getPropertiesInBounds(minLat: number, maxLat: number, minLon: number, maxLon: number): Promise<any[]> {
        if (!this.db) throw new Error('Database not initialized');

        const results = await this.db.getAllAsync<{ data: string }>(
            `SELECT data FROM properties 
       WHERE latitude BETWEEN ? AND ? 
       AND longitude BETWEEN ? AND ?`,
            [minLat, maxLat, minLon, maxLon]
        );

        return results.map(row => JSON.parse(row.data));
    }

    // --- Events ---

    async saveEvent(event: any, isLocal: boolean = true): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');

        await this.db.runAsync(
            `INSERT OR REPLACE INTO events (id, local_id, property_id, data, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
            [
                event.id || event.localId,
                event.localId,
                event.propertyId,
                JSON.stringify(event),
                isLocal ? 'pending' : 'synced',
                Date.now()
            ]
        );
    }

    async getPendingEvents(): Promise<any[]> {
        if (!this.db) throw new Error('Database not initialized');

        const results = await this.db.getAllAsync<{ data: string }>(
            `SELECT data FROM events WHERE status = 'pending'`
        );
        return results.map(row => JSON.parse(row.data));
    }

    async markEventSynced(localId: string, serverId: string): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');

        await this.db.runAsync(
            `UPDATE events SET status = 'synced', id = ?, synced_at = ? WHERE local_id = ?`,
            [serverId, Date.now(), localId]
        );
    }

    // --- Sync Queue ---

    async queueAction(entityType: string, entityId: string, action: string, payload: any): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');

        await this.db.runAsync(
            `INSERT INTO sync_queue (entity_type, entity_id, action, payload, created_at)
       VALUES (?, ?, ?, ?, ?)`,
            [entityType, entityId, action, JSON.stringify(payload), Date.now()]
        );
    }

    async getQueuedActions(): Promise<any[]> {
        if (!this.db) throw new Error('Database not initialized');

        const results = await this.db.getAllAsync<any>(
            `SELECT * FROM sync_queue ORDER BY created_at ASC`
        );
        return results.map(row => ({
            ...row,
            payload: JSON.parse(row.payload)
        }));
    }

    async removeQueueItem(id: number): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');
        await this.db.runAsync(`DELETE FROM sync_queue WHERE id = ?`, [id]);
    }
    // --- Value Sets (Schema) ---

    async saveValueSet(name: string, data: any[] | any): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');

        await this.db.runAsync(
            `INSERT OR REPLACE INTO value_sets (name, data, fetched_at)
             VALUES (?, ?, ?)`,
            [name, JSON.stringify(data), Date.now()]
        );
    }

    async getValueSet(name: string): Promise<any | null> {
        if (!this.db) throw new Error('Database not initialized');

        const result = await this.db.getFirstAsync<{ data: string }>(
            `SELECT data FROM value_sets WHERE name = ?`,
            [name]
        );

        return result ? JSON.parse(result.data) : null;
    }
}

export const databaseService = DatabaseService.getInstance();
