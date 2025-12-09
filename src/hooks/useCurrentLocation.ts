import { useState, useCallback } from 'react';
import * as Location from 'expo-location';
import { Alert } from 'react-native';

interface LocationState {
    latitude: number;
    longitude: number;
}

export function useCurrentLocation() {
    const [location, setLocation] = useState<LocationState | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);

    const getCurrentPosition = useCallback(async (): Promise<LocationState | null> => {
        setLoading(true);
        setError(null);
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                throw new Error('Permission to access location was denied');
            }

            const locationResult = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            });

            const newLocation = {
                latitude: locationResult.coords.latitude,
                longitude: locationResult.coords.longitude,
            };

            setLocation(newLocation);
            return newLocation;
        } catch (err: any) {
            setError(err.message || 'Failed to get location');
            console.error('[useCurrentLocation] Error:', err);
            return null;
        } finally {
            setLoading(false);
            setRetryCount((prev) => prev + 1);
        }
    }, []);

    return {
        location,
        loading,
        error,
        retryCount,
        getCurrentPosition,
    };
}
