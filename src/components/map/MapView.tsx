import React, { useRef, useEffect, useCallback, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import * as Location from 'expo-location';
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

      console.log('[MapView] Region changed - bounds:', bounds, 'zoom:', zoom);

      if (bounds && bounds.length === 2) {
        // Mapbox returns [[ne_lng, ne_lat], [sw_lng, sw_lat]] or vice versa
        // Use Math.min/max to ensure correct values regardless of order
        const [coord1, coord2] = bounds;
        const boundsObj: Bounds = {
          minLat: Math.min(coord1[1], coord2[1]),
          maxLat: Math.max(coord1[1], coord2[1]),
          minLng: Math.min(coord1[0], coord2[0]),
          maxLng: Math.max(coord1[0], coord2[0]),
        };

        console.log('[MapView] Calculated bounds:', boundsObj);
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

  // Zoom in handler
  const handleZoomIn = useCallback(() => {
    if (cameraRef.current) {
      const newZoom = viewState.zoom + 1;
      cameraRef.current.setCamera({
        zoomLevel: newZoom,
        animationDuration: 300,
      });
      setViewState({ ...viewState, zoom: newZoom });
    }
  }, [viewState, setViewState]);

  // Zoom out handler
  const handleZoomOut = useCallback(() => {
    if (cameraRef.current) {
      const newZoom = Math.max(viewState.zoom - 1, 1);
      cameraRef.current.setCamera({
        zoomLevel: newZoom,
        animationDuration: 300,
      });
      setViewState({ ...viewState, zoom: newZoom });
    }
  }, [viewState, setViewState]);

  // Go to user location handler
  const handleGoToMyLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        if (cameraRef.current) {
          cameraRef.current.setCamera({
            centerCoordinate: [location.coords.longitude, location.coords.latitude],
            zoomLevel: 16,
            animationDuration: 1000,
          });
        }
      }
    } catch (error) {
      console.error('Error getting location:', error);
    }
  }, []);

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
        zoomEnabled
        scrollEnabled
        rotateEnabled
        pitchEnabled
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

      {/* Map Controls Toolbar */}
      {/* Map Controls have been moved to parent component */}
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
