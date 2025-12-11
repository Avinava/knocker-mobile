import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useOffline } from '@/hooks/useOffline';
import { syncService } from '@/services/offline/sync';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function OfflineIndicator() {
    const { isOnline } = useOffline();
    const [isSyncing, setIsSyncing] = useState(false);
    const insets = useSafeAreaInsets();

    useEffect(() => {
        syncService.setSyncStatusCallback(setIsSyncing);
        return () => syncService.setSyncStatusCallback(() => { });
    }, []);

    if (isOnline && !isSyncing) return null;

    return (
        <View style={[styles.container, { top: insets.top }]}>
            <Text style={styles.text}>
                {!isOnline ? 'You are offline' : 'Syncing data...'}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 0,
        right: 0,
        backgroundColor: '#333',
        padding: 8,
        alignItems: 'center',
        zIndex: 999,
    },
    text: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    }
});
