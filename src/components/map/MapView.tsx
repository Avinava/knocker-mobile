import React, { useRef, useEffect, useCallback, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
// Mapbox is imported dynamically to avoid crashes in Expo Go
// import Mapbox from '@rnmapbox/maps'; 
import { MAPBOX_CONFIG, MAP_STYLES } from '@/config/mapbox';
import { useMapStore } from '@/stores/mapStore';
import { Bounds } from '@/models/types';

interface MapViewProps {
  onRegionChange?: (bounds: Bounds) => void;
  children?: React.ReactNode | ((props: { MapboxGL: any }) => React.ReactNode);
}

export function MapView({ onRegionChange, children }: MapViewProps) {
  // We use 'any' for the module because dynamic require loses types
  const [MapboxGL, setMapboxGL] = useState<any>(null);
  const [isSupported, setIsSupported] = useState(true);
  const [showStylePicker, setShowStylePicker] = useState(false);

  const mapRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);

  const {
    viewState,
    setViewState,
    setBounds,
    currentStyle,
    setMapStyle,
    showUserLocation,
  } = useMapStore();

  const styleOptions: { key: typeof currentStyle; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'streets', label: 'Streets', icon: 'map-outline' },
    { key: 'satellite', label: 'Satellite', icon: 'planet-outline' },
    { key: 'hybrid', label: 'Hybrid', icon: 'layers-outline' },
    { key: 'outdoors', label: 'Outdoors', icon: 'trail-sign-outline' },
  ];

  useEffect(() => {
    async function loadMapbox() {
      // Check if running in Expo Go
      if (Constants.appOwnership === 'expo') {
        setIsSupported(false);
        return;
      }

      try {
        // Dynamically load Mapbox
        const Mapbox = require('@rnmapbox/maps');

        // Setup Mapbox with token from config
        const token = MAPBOX_CONFIG.ACCESS_TOKEN;
        console.log('Initializing Mapbox with token:', token?.substring(0, 20) + '...');
        Mapbox.setAccessToken(token);
        setMapboxGL(Mapbox);
      } catch (error) {
        console.warn('Mapbox native module not found. Falling back to placeholder.', error);
        setIsSupported(false);
      }
    }

    loadMapbox();
  }, []);

  // Get map style URL based on current style
  const getStyleURL = () => {
    return MAP_STYLES[currentStyle] || MAP_STYLES.streets;
  };

  // Handle region change (viewport movement)
  const handleRegionDidChange = useCallback(async () => {
    if (!mapRef.current) return;

    try {
      const bounds = await mapRef.current.getVisibleBounds();
      const center = await mapRef.current.getCenter();
      const zoom = await mapRef.current.getZoom();

      if (bounds && bounds.length === 2) {
        const [sw, ne] = bounds;
        const boundsObj: Bounds = {
          minLat: sw[1],
          maxLat: ne[1],
          minLng: sw[0],
          maxLng: ne[0],
        };

        setBounds(boundsObj);
        onRegionChange?.(boundsObj);
      }

      if (center) {
        setViewState({
          ...viewState,
          latitude: center[1],
          longitude: center[0],
          zoom: zoom || viewState.zoom,
        });
      }
    } catch (error) {
      console.error('Error getting map bounds:', error);
    }
  }, [setBounds, setViewState, viewState, onRegionChange]);

  // Initial map load (only if supported)
  useEffect(() => {
    if (!isSupported || !MapboxGL) return;

    // Trigger initial bounds calculation after map loads
    const timer = setTimeout(() => {
      handleRegionDidChange();
    }, 1000);

    return () => clearTimeout(timer);
  }, [isSupported, MapboxGL]);

  if (!isSupported) {
    return (
      <View style={styles.fallbackContainer}>
        <Text style={styles.fallbackTitle}>Map Not Available</Text>
        <Text style={styles.fallbackText}>
          Mapbox requires custom native code and cannot run in Expo Go.
        </Text>
        <Text style={styles.fallbackSubText}>
          Please use a Development Build (EAS Build) or test on a simulator with the native app installed.
        </Text>
      </View>
    );
  }

  if (!MapboxGL) {
    return (
      <View style={styles.fallbackContainer}>
        <Text>Loading Map...</Text>
      </View>
    );
  }

  // Render Map using the dynamically loaded module
  const { MapView: NativeMapView, Camera, UserLocation } = MapboxGL;

  const renderedChildren = typeof children === 'function' ? children({ MapboxGL }) : children;

  return (
    <View style={styles.container}>
      <NativeMapView
        ref={mapRef}
        style={styles.map}
        styleURL={getStyleURL()}
        onRegionDidChange={handleRegionDidChange}
        compassEnabled
        scaleBarEnabled={false}
        attributionEnabled={false}
        logoEnabled={false}
      >
        <Camera
          ref={cameraRef}
          zoomLevel={viewState.zoom}
          centerCoordinate={[viewState.longitude, viewState.latitude]}
          pitch={viewState.pitch}
          heading={viewState.heading}
          animationMode="flyTo"
          animationDuration={1000}
        />

        {/* User Location */}
        {showUserLocation && (
          <UserLocation
            visible
            showsUserHeadingIndicator
            minDisplacement={10}
          />
        )}

        {renderedChildren}
      </NativeMapView>

      {/* Floating Style Picker Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowStylePicker(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="layers" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Style Picker Modal */}
      <Modal
        visible={showStylePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowStylePicker(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowStylePicker(false)}
        >
          <View style={styles.stylePickerContainer}>
            <Text style={styles.stylePickerTitle}>Map Style</Text>
            {styleOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.styleOption,
                  currentStyle === option.key && styles.styleOptionActive,
                ]}
                onPress={() => {
                  setMapStyle(option.key);
                  setShowStylePicker(false);
                }}
              >
                <Ionicons
                  name={option.icon}
                  size={20}
                  color={currentStyle === option.key ? '#3b82f6' : '#6b7280'}
                />
                <Text
                  style={[
                    styles.styleOptionText,
                    currentStyle === option.key && styles.styleOptionTextActive,
                  ]}
                >
                  {option.label}
                </Text>
                {currentStyle === option.key && (
                  <Ionicons name="checkmark" size={20} color="#3b82f6" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f3f4f6',
  },
  fallbackTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  fallbackText: {
    fontSize: 16,
    color: '#4b5563',
    textAlign: 'center',
    marginBottom: 8,
  },
  fallbackSubText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stylePickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    width: '80%',
    maxWidth: 300,
  },
  stylePickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  styleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  styleOptionActive: {
    backgroundColor: '#eff6ff',
  },
  styleOptionText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#4b5563',
  },
  styleOptionTextActive: {
    color: '#3b82f6',
    fontWeight: '500',
  },
});
