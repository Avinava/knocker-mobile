import MapboxGL from '@rnmapbox/maps';

class TileService {
    private static instance: TileService;

    private constructor() { }

    static getInstance(): TileService {
        if (!TileService.instance) {
            TileService.instance = new TileService();
        }
        return TileService.instance;
    }

    /**
     * Downloads a map region for offline use
     * @param name Unique name for the pack
     * @param bounds [minLng, minLat, maxLng, maxLat]
     * @param minZoom Minimum zoom level
     * @param maxZoom Maximum zoom level
     * @param onProgress Callback for download progress
     */
    async downloadRegion(
        name: string,
        bounds: [number, number, number, number],
        minZoom: number = 10,
        maxZoom: number = 16,
        onProgress?: (percentage: number, completedResourceCount: number, totalResourceCount: number) => void
    ): Promise<void> {
        try {
            // Convert flat bounds to [ne, sw] or [min, max] pairs required by Mapbox
            // Expected type is likely [Position, Position] -> [[lng, lat], [lng, lat]]
            const boundsPair = [
                [bounds[0], bounds[1]], // sw: [minLng, minLat]
                [bounds[2], bounds[3]]  // ne: [maxLng, maxLat]
            ];

            await MapboxGL.offlineManager.createPack(
                {
                    name,
                    styleURL: MapboxGL.StyleURL.Street,
                    bounds: boundsPair as any, // Cast to any or correct type if known, usually [Position, Position]
                    minZoom,
                    maxZoom,
                    metadata: {
                        name,
                        created: new Date().toISOString()
                    }
                },
                (pack: any, status: any) => {
                    // Callback signature might be (pack, status) or just (pack) with status inside
                    // Based on common RNMapbox versions, status contains percentage
                    // If status is undefined, check pack directly (older versions)
                    const progressSafe = status || pack;

                    if (onProgress && progressSafe) {
                        const percentage = progressSafe.percentage;
                        const completed = progressSafe.completedResourceCount;
                        const total = progressSafe.requiredResourceCount;
                        onProgress(percentage, completed, total);
                    }
                    console.log(`[OfflineMap] Progress: ${progressSafe?.percentage}%`);
                },
                (error: any, event: any) => {
                    console.error('[OfflineMap] Error:', error);
                }
            );
        } catch (error) {
            console.error('[OfflineMap] Failed to create pack:', error);
            throw error;
        }
    }

    async getDownloadedRegions(): Promise<any[]> {
        const packs = await MapboxGL.offlineManager.getPacks();
        return packs;
    }

    async deleteRegion(name: string): Promise<void> {
        await MapboxGL.offlineManager.deletePack(name);
    }

    async clearAllRegions(): Promise<void> {
        await MapboxGL.offlineManager.resetDatabase();
    }
}

export const tileService = TileService.getInstance();
