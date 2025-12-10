import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, Modal, Text, TouchableOpacity, ActivityIndicator, TextInput, Platform, Alert } from 'react-native';
import { MapView } from '@/components/map/MapView';
import { PropertyLayer } from '@/components/map/PropertyLayer';
import { PropertyDetailsDrawer } from '@/components/property/PropertyDetailsDrawer';
import { KnockDoorSheet } from '@/components/knock/KnockDoorSheet';
import { LeadFormSheet } from '@/components/leads/LeadFormSheet';
import { usePropertiesInBounds } from '@/hooks/useProperties';
import { useMapStore } from '@/stores/mapStore';
import { useDispositionStore } from '@/stores/dispositionStore';
import { Property, Bounds, DispositionType } from '@/models/types';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeOut, FadeInUp, FadeOutUp } from 'react-native-reanimated';
import * as Location from 'expo-location';
import { DISPOSITION_TYPES } from '@/utils/constants';

// Disposition icons mapping
const DISPOSITION_ICONS: Record<DispositionType, keyof typeof Ionicons.glyphMap> = {
  'Insurance Restoration': 'shield-outline',
  'Solar Replacement': 'sunny-outline',
  'Community Solar': 'people-outline',
};

// Disposition short labels
const DISPOSITION_SHORT_LABELS: Record<DispositionType, string> = {
  'Insurance Restoration': 'Storm',
  'Solar Replacement': 'Solar',
  'Community Solar': 'Community',
};

const MapControlBar = ({
  onZoomIn,
  onZoomOut,
  onLocation,
  onRefresh,
  onSearchToggle,
  onStyleToggle,
  onDispositionToggle,
  isSearchVisible,
  selectedDisposition,
}: {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onLocation: () => void;
  onRefresh: () => void;
  onSearchToggle: () => void;
  onStyleToggle: () => void;
  onDispositionToggle: () => void;
  isSearchVisible: boolean;
  selectedDisposition: DispositionType;
}) => (
  <View style={styles.controlBar}>
    {/* Disposition Selector Button */}
    <TouchableOpacity onPress={onDispositionToggle} style={styles.controlButton}>
      <Ionicons 
        name={DISPOSITION_ICONS[selectedDisposition]} 
        size={22} 
        color="#3B82F6" 
      />
    </TouchableOpacity>
    <View style={styles.dividerHorizontal} />
    <TouchableOpacity onPress={onSearchToggle} style={styles.controlButton}>
      <Ionicons name={isSearchVisible ? "close" : "search"} size={22} color="#374151" />
    </TouchableOpacity>
    <View style={styles.dividerHorizontal} />
    <TouchableOpacity onPress={onZoomIn} style={styles.controlButton}>
      <Ionicons name="add" size={24} color="#374151" />
    </TouchableOpacity>
    <TouchableOpacity onPress={onZoomOut} style={styles.controlButton}>
      <Ionicons name="remove" size={24} color="#374151" />
    </TouchableOpacity>
    <View style={styles.dividerHorizontal} />
    <TouchableOpacity onPress={onLocation} style={styles.controlButton}>
      <Ionicons name="navigate" size={22} color="#374151" />
    </TouchableOpacity>
    <TouchableOpacity onPress={onRefresh} style={styles.controlButton}>
      <Ionicons name="refresh" size={22} color="#374151" />
    </TouchableOpacity>
    <View style={styles.dividerHorizontal} />
    <TouchableOpacity onPress={onStyleToggle} style={styles.controlButton}>
      <Ionicons name="layers-outline" size={22} color="#374151" />
    </TouchableOpacity>
  </View>
);

export default function MapScreen() {
  const [currentBounds, setCurrentBounds] = useState<Bounds | null>(null);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [showDispositionPicker, setShowDispositionPicker] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);

  const {
    selectedProperty,
    selectProperty,
    isDrawerOpen,
    closeDrawer,
    openKnockSheet,
    viewState,
    setViewState,
    setMapStyle,
    currentStyle
  } = useMapStore();

  const { selectedDisposition, setDisposition } = useDispositionStore();

  // Fetch properties within current map bounds
  const { data: properties = [], isLoading, isFetching, error, refetch } = usePropertiesInBounds(currentBounds);

  // Debug logging
  useEffect(() => {
    console.log('[MapScreen] Current bounds:', currentBounds);
    console.log('[MapScreen] Properties loaded:', properties.length);
    console.log('[MapScreen] Loading:', isLoading, 'Fetching:', isFetching);
    if (error) {
      console.error('[MapScreen] Error loading properties:', error);
    }
  }, [currentBounds, properties, isLoading, isFetching, error]);

  const handleRegionChange = useCallback((bounds: Bounds) => {
    // console.log('[MapScreen] Region changed, new bounds:', bounds);
    setCurrentBounds(bounds);
  }, []);

  const handlePropertyPress = useCallback((property: Property) => {
    selectProperty(property);
  }, [selectProperty]);

  const handleKnockDoor = useCallback(() => {
    closeDrawer();
    openKnockSheet();
  }, [closeDrawer, openKnockSheet]);

  const handleCreateLead = useCallback(() => {
    closeDrawer();
    setShowLeadForm(true);
  }, [closeDrawer]);

  // Controls Logic
  const handleZoomIn = () => setViewState({ ...viewState, zoom: viewState.zoom + 1 });
  const handleZoomOut = () => setViewState({ ...viewState, zoom: Math.max(1, viewState.zoom - 1) });

  const handleLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Allow location access to find your position.');
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      setViewState({
        ...viewState,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        zoom: 16
      });
    } catch (err) {
      console.log('Loc error', err);
    }
  };

  const handleStyleToggle = () => {
    const styles: Array<typeof currentStyle> = ['streets', 'satellite', 'hybrid'];
    const nextIndex = (styles.indexOf(currentStyle) + 1) % styles.length;
    setMapStyle(styles[nextIndex]);
  };

  const handleDispositionToggle = () => {
    setShowDispositionPicker(true);
  };

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
                dispositionType={selectedDisposition}
              />
            )}
          </>
        )}
      </MapView>

      {/* Top Search Area */}
      {isSearchVisible && (
        <Animated.View
          entering={FadeInUp.springify()}
          exiting={FadeOutUp}
          style={styles.searchContainer}
        >
          <SafeAreaView edges={['top']}>
            <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color="#9CA3AF" />
              <TextInput
                placeholder="Search area, address or city..."
                placeholderTextColor="#9CA3AF"
                style={styles.searchInput}
                autoFocus
              />
              <TouchableOpacity onPress={() => setIsSearchVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Animated.View>
      )}

      {/* Loading Pill (Top Center, moves down if search is visible) */}
      {(isLoading || isFetching) && (
        <Animated.View
          entering={FadeIn}
          exiting={FadeOut}
          style={[styles.loadingPill, isSearchVisible && { top: 110 }]}
        >
          <ActivityIndicator size="small" color="#3B82F6" />
          <Text style={styles.loadingText}>Updating map area...</Text>
        </Animated.View>
      )}

      {/* Bottom Clean Control Bar */}
      <SafeAreaView style={styles.bottomContainer} edges={['bottom']} pointerEvents="box-none">
        <MapControlBar
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onLocation={handleLocation}
          onRefresh={() => refetch()}
          onSearchToggle={() => setIsSearchVisible(!isSearchVisible)}
          onStyleToggle={handleStyleToggle}
          onDispositionToggle={handleDispositionToggle}
          isSearchVisible={isSearchVisible}
          selectedDisposition={selectedDisposition}
        />
      </SafeAreaView>

      {/* Disposition Picker Modal */}
      <Modal
        visible={showDispositionPicker}
        animationType="fade"
        transparent
        onRequestClose={() => setShowDispositionPicker(false)}
      >
        <TouchableOpacity
          style={styles.dispositionModalOverlay}
          activeOpacity={1}
          onPress={() => setShowDispositionPicker(false)}
        >
          <View style={styles.dispositionPickerContainer}>
            <Text style={styles.dispositionPickerTitle}>Select View</Text>
            {DISPOSITION_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.dispositionOption,
                  selectedDisposition === type && styles.dispositionOptionSelected
                ]}
                onPress={() => {
                  setDisposition(type);
                  setShowDispositionPicker(false);
                }}
              >
                <Ionicons 
                  name={DISPOSITION_ICONS[type]} 
                  size={22} 
                  color={selectedDisposition === type ? '#3B82F6' : '#6B7280'} 
                />
                <Text style={[
                  styles.dispositionOptionText,
                  selectedDisposition === type && styles.dispositionOptionTextSelected
                ]}>
                  {type}
                </Text>
                {selectedDisposition === type && (
                  <Ionicons name="checkmark-circle" size={22} color="#3B82F6" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

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

      <KnockDoorSheet />

      {/* Lead Form Sheet */}
      <LeadFormSheet
        visible={showLeadForm}
        onClose={() => setShowLeadForm(false)}
        property={selectedProperty}
      />

    </View >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 12,
    zIndex: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 16,
    height: 48,
    borderRadius: 24,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1F2937',
    height: '100%',
  },
  cancelText: {
    color: '#3B82F6',
    fontWeight: '500',
    marginLeft: 12,
  },
  loadingPill: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 5,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    right: 16, // Align to right
    alignItems: 'flex-end', // Align items to end
    paddingBottom: 40, // More padding to clear safe area/tab bar
  },
  controlBar: {
    flexDirection: 'column', // Vertical stack
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 24, // Slightly different radius for vertical pill
    paddingHorizontal: 6,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: 10,
  },
  controlButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
  },
  dividerHorizontal: {
    width: 24,
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    width: '100%',
  },
  dispositionModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dispositionPickerContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '85%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  dispositionPickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  dispositionOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#F9FAFB',
  },
  dispositionOptionSelected: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  dispositionOptionText: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    marginLeft: 12,
  },
  dispositionOptionTextSelected: {
    color: '#3B82F6',
    fontWeight: '600',
  },
});

