import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, Modal, ActivityIndicator, Text } from 'react-native';
import { MapView } from '@/components/map/MapView';
import { PropertyLayer } from '@/components/map/PropertyLayer';
import { PropertyDetailsDrawer } from '@/components/property/PropertyDetailsDrawer';
import { KnockDoorModal } from '@/components/knock/KnockDoorModal';
import { usePropertiesInBounds } from '@/hooks/useProperties';
import { useMapStore } from '@/stores/mapStore';
import { Property, Bounds } from '@/models/types';

export default function MapScreen() {
  const [currentBounds, setCurrentBounds] = useState<Bounds | null>(null);
  const {
    selectedProperty,
    selectProperty,
    isDrawerOpen,
    closeDrawer,
    openKnockModal,
  } = useMapStore();

  // Fetch properties within current map bounds
  const { data: properties = [], isLoading, isFetching, error } = usePropertiesInBounds(currentBounds);

  // Debug logging
  useEffect(() => {
    console.log('[MapScreen] Current bounds:', currentBounds);
    console.log('[MapScreen] Properties loaded:', properties.length);
    console.log('[MapScreen] Loading:', isLoading, 'Fetching:', isFetching);
    if (error) {
      console.error('[MapScreen] Error loading properties:', error);
    }
    if (properties.length > 0) {
      console.log('[MapScreen] Sample property:', JSON.stringify(properties[0], null, 2));
    }
  }, [currentBounds, properties, isLoading, isFetching, error]);

  const handleRegionChange = useCallback((bounds: Bounds) => {
    console.log('[MapScreen] Region changed, new bounds:', bounds);
    setCurrentBounds(bounds);
  }, []);

  const handlePropertyPress = useCallback((property: Property) => {
    selectProperty(property);
  }, [selectProperty]);

  const handleKnockDoor = useCallback(() => {
    closeDrawer();
    openKnockModal();
  }, [closeDrawer, openKnockModal]);

  const handleCreateLead = useCallback(() => {
    // Will implement lead form
    console.log('Create lead for:', selectedProperty?.Id);
  }, [selectedProperty]);

  return (
    <View style={styles.container}>
      <MapView onRegionChange={handleRegionChange}>
        {({ MapboxGL }) => (
          <>
            {properties.length > 0 && (
              <PropertyLayer
                properties={properties}
                onPropertyPress={handlePropertyPress}
                MapboxGL={MapboxGL}
              />
            )}
          </>
        )}
      </MapView>

      {/* Loading Indicator */}
      {(isLoading || isFetching) && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#3B82F6" />
            <Text style={styles.loadingText}>Loading properties...</Text>
          </View>
        </View>
      )}

      {/* Property Details Drawer */}
      <Modal
        visible={isDrawerOpen && !!selectedProperty}
        animationType="slide"
        transparent
        onRequestClose={closeDrawer}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedProperty && (
              <PropertyDetailsDrawer
                property={selectedProperty}
                onClose={closeDrawer}
                onKnockDoor={handleKnockDoor}
                onCreateLead={handleCreateLead}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* Knock Door Modal */}
      <KnockDoorModal />
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 60,
    left: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#374151',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    width: '100%',
  },
});


