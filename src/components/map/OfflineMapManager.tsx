import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, ActivityIndicator } from 'react-native';
import { tileService } from '@/services/map/tiles';
import { Ionicons } from '@expo/vector-icons';

interface OfflinePack {
    name: string;
    metadata: any;
    bounds: any;
}

export const OfflineMapManager = () => {
    const [packs, setPacks] = useState<OfflinePack[]>([]);
    const [loading, setLoading] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState<number | null>(null);

    useEffect(() => {
        loadPacks();
    }, []);

    const loadPacks = async () => {
        try {
            setLoading(true);
            const downloadedPacks = await tileService.getDownloadedRegions();
            setPacks(downloadedPacks || []);
        } catch (error) {
            console.error('Failed to load packs', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (name: string) => {
        Alert.alert(
            'Delete Region',
            `Are you sure you want to delete "${name}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        await tileService.deleteRegion(name);
                        loadPacks();
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }: { item: OfflinePack }) => (
        <View style={styles.itemContainer}>
            <View style={styles.itemInfo}>
                <Ionicons name="map" size={24} color="#666" />
                <View style={styles.itemTextParams}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemDate}>
                        {item.metadata?.created ? new Date(item.metadata.created).toLocaleDateString() : 'Unknown date'}
                    </Text>
                </View>
            </View>
            <TouchableOpacity onPress={() => handleDelete(item.name)} style={styles.deleteButton}>
                <Ionicons name="trash-outline" size={20} color="#ef4444" />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Offline Maps</Text>
                <TouchableOpacity onPress={loadPacks}>
                    <Ionicons name="refresh" size={20} color="#3b82f6" />
                </TouchableOpacity>
            </View>

            {downloadProgress !== null && (
                <View style={styles.progressContainer}>
                    <Text style={styles.progressText}>Downloading... {Math.round(downloadProgress)}%</Text>
                    <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${downloadProgress}%` }]} />
                    </View>
                </View>
            )}

            {loading ? (
                <ActivityIndicator style={styles.loader} />
            ) : (
                <FlatList
                    data={packs}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.name}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>No offline maps downloaded.</Text>
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111',
    },
    loader: {
        marginTop: 20,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#f9fafb',
        borderRadius: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    itemInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    itemTextParams: {
        flex: 1,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1f2937',
    },
    itemDate: {
        fontSize: 12,
        color: '#6b7280',
    },
    deleteButton: {
        padding: 8,
    },
    emptyText: {
        textAlign: 'center',
        color: '#6b7280',
        marginTop: 20,
    },
    progressContainer: {
        marginBottom: 16,
    },
    progressText: {
        fontSize: 14,
        color: '#3b82f6',
        marginBottom: 4,
    },
    progressBar: {
        height: 4,
        backgroundColor: '#e5e7eb',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#3b82f6',
    }
});
