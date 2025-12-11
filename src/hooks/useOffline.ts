import { useState, useEffect } from 'react';
import * as Network from 'expo-network';

export function useOffline() {
    const [isOnline, setIsOnline] = useState(true);
    const [isLoading, setIsLoading] = useState(true);

    const checkNetwork = async () => {
        try {
            const state = await Network.getNetworkStateAsync();
            // On iOS isInternetReachable can be null initially, assume true if isConnected is true
            setIsOnline(state.isInternetReachable ?? state.isConnected ?? true);
        } catch (e) {
            console.error('Network check failed', e);
            setIsOnline(false);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkNetwork();

        // Poll every 10 seconds since we don't have NetInfo listeners
        const interval = setInterval(checkNetwork, 10000);

        return () => clearInterval(interval);
    }, []);

    return { isOnline, isLoading, checkNetwork };
}
