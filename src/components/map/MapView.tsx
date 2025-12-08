import React, { useRef, useEffect, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import { MAPBOX_CONFIG, MAP_DEFAULTS } from '@/config/mapbox';
import { useMapStore } from '@/stores/mapStore';
import { Bounds } from '@/models/types';

// Initialize Mapbox
Mapbox.setAccessToken(MAPBOX_CONFIG.ACCESS_TOKEN);

interface MapViewProps {
  onRegionChange?: (bounds: Bounds) => void;
}

export function MapView({ onRegionChange }: MapViewProps) {
  const mapRef = useRef<Mapbox.MapView>(null);
  const cameraRef = useRef<Mapbox.Camera>(null);
  
  const { 
    viewState, 
    setViewState, 
    setBounds,
    currentStyle,
    showUserLocation,
  } = useMapStore();

  // Get map style URL based on current style
  const getStyleURL = () => {
    switch (currentStyle) {
      case 'satellite':
        return MAPBOX_CONFIG.STYLE_SATELLITE;
      case 'outdoors':
        return MAPBOX_CONFIG.STYLE_OUTDOORS;
      default:
        return MAPBOX_CONFIG.STYLE_STREET;
    }
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

  // Initial map load
  useEffect(() => {
    // Trigger initial bounds calculation after map loads
    const timer = setTimeout(() => {
      handleRegionDidChange();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Mapbox.MapView
        ref={mapRef}
        style={styles.map}
        styleURL={getStyleURL()}
        onRegionDidChange={handleRegionDidChange}
        compassEnabled
        scaleBarEnabled={false}
        attributionEnabled={false}
        logoEnabled={false}
      >
        <Mapbox.Camera
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
          <Mapbox.UserLocation
            visible
            showsUserHeadingIndicator
            minDisplacement={10}
          />
        )}

        {/* Property markers will be added here */}
      </Mapbox.MapView>
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
});
