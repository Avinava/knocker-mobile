import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, Modal } from 'react-native';
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
  const { data: properties = [], isLoading, error } = usePropertiesInBounds(currentBounds);

  // Debug logging
  useEffect(() => {
    console.log('[MapScreen] Current bounds:', currentBounds);
    console.log('[MapScreen] Properties loaded:', properties.length);
    console.log('[MapScreen] Loading:', isLoading);
    if (error) {
      console.error('[MapScreen] Error loading properties:', error);
    }
    if (properties.length > 0) {
      console.log('[MapScreen] Sample property:', JSON.stringify(properties[0], null, 2));
    }
  }, [currentBounds, properties, isLoading, error]);

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
            {!isLoading && properties.length > 0 && (
              <PropertyLayer
                properties={properties}
                onPropertyPress={handlePropertyPress}
                MapboxGL={MapboxGL}
              />
            )}
          </>
        )}
      </MapView>

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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    flex: 0,
  },
});
