import { databaseService } from './database';
import { useOffline } from '@/hooks/useOffline';
import { Network } from 'expo-network';

// Mock API function - replace with actual API client call
const fetchValueSetFromApi = async (setName: string): Promise<any[]> => {
    console.log(`[SchemaService] Fetching ${setName} from API...`);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Return mock data based on set name
    if (setName.includes('Roof')) {
        return [
            { label: 'Asphalt Shingle', value: 'asphalt' },
            { label: 'Metal', value: 'metal' },
            { label: 'Tile', value: 'tile' },
            { label: 'Slate', value: 'slate' }
        ];
    }
    if (setName.includes('Status')) {
        return [
            { label: 'New', value: 'new' },
            { label: 'Contacted', value: 'contacted' },
            { label: 'Interested', value: 'interested' },
            { label: 'Not Interested', value: 'not_interested' }
        ];
    }

    return [];
};


class SchemaService {
    private static instance: SchemaService;
    private memoryCache: Map<string, any> = new Map();

    private constructor() { }

    static getInstance(): SchemaService {
        if (!SchemaService.instance) {
            SchemaService.instance = new SchemaService();
        }
        return SchemaService.instance;
    }

    /**
     * Retrieves a value set (picklist options) by name.
     * Strategy:
     * 1. Check memory cache.
     * 2. Check local database.
     * 3. If missing in DB, attempt to fetch from API and cache it.
     * 4. If offline and missing, return empty array (or error).
     * 
     * @param setName The unique name of the value set
     * @param forceRefresh If true, bypass cache and fetch from API
     */
    async getValueSet(setName: string, forceRefresh = false): Promise<any[]> {
        // 1. Memory Cache
        if (!forceRefresh && this.memoryCache.has(setName)) {
            return this.memoryCache.get(setName);
        }

        // 2. Database Cache
        if (!forceRefresh) {
            try {
                const cachedData = await databaseService.getValueSet(setName);
                if (cachedData) {
                    this.memoryCache.set(setName, cachedData);
                    // Optionally: Trigger background refresh if data is old?
                    return cachedData;
                }
            } catch (e) {
                console.warn('[SchemaService] Failed to read from DB', e);
            }
        }

        // 3. API Fetch
        try {
            const data = await fetchValueSetFromApi(setName);

            // Save to caches
            this.memoryCache.set(setName, data);
            await databaseService.saveValueSet(setName, data);

            return data;
        } catch (error) {
            console.error(`[SchemaService] Failed to fetch value set ${setName}`, error);

            // Return empty if we really have nothing
            return [];
        }
    }

    /**
     * Pre-fetches critical value sets for offline use.
     * Call this during app initialization or initial sync.
     */
    async warmupCache(setNames: string[]): Promise<void> {
        console.log('[SchemaService] Warming up schema cache...');
        await Promise.all(setNames.map(name => this.getValueSet(name, true)));
    }
}

export const schemaService = SchemaService.getInstance();
