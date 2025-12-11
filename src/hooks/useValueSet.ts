import { useState, useEffect } from 'react';
import { schemaService } from '@/services/offline/schemaService';

interface UseValueSetResult<T = any> {
    data: T[];
    isLoading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
}

export function useValueSet<T = any>(setName: string): UseValueSetResult<T> {
    const [data, setData] = useState<T[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const loadData = async (forceString = false) => {
        try {
            setIsLoading(true);
            setError(null);
            const result = await schemaService.getValueSet(setName, forceString);
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to load value set'));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [setName]);

    return { data, isLoading, error, refetch: () => loadData(true) };
}
