import React, { useMemo, useEffect } from 'react';
import { Property, DispositionType } from '@/models/types';
import { PropertyMarker } from './PropertyMarker';
import { useMapStore } from '@/stores/mapStore';
import { MAP_SETTINGS } from '@/config/mapbox';

interface PropertyLayerProps {
  properties: Property[];
  onPropertyPress: (property: Property) => void;
  MapboxGL: any;
  dispositionType?: DispositionType;
}

// Helper function to extract coordinates from property
function getPropertyCoordinates(property: Property): [number, number] | null {
  // Try Geolocation__c first
  if (property.Geolocation__c?.latitude && property.Geolocation__c?.longitude) {
    return [property.Geolocation__c.longitude, property.Geolocation__c.latitude];
  }
  // Fall back to Latitude__c and Longitude__c
  if (property.Latitude__c != null && property.Longitude__c != null) {
    return [property.Longitude__c, property.Latitude__c];
  }
  return null;
}

export function PropertyLayer({ properties, onPropertyPress, MapboxGL, dispositionType = 'Insurance Restoration' }: PropertyLayerProps) {
  const { clusteringEnabled, selectedProperty } = useMapStore();

  // Filter properties with valid coordinates and create GeoJSON for clustering
  const { validProperties, geoJSON } = useMemo(() => {
    const valid = properties.filter(p => getPropertyCoordinates(p) !== null);

    console.log('[PropertyLayer] Total:', properties.length, 'Valid:', valid.length);

    // Create GeoJSON for clustering overlay
    const features = valid.map((property) => {
      const coords = getPropertyCoordinates(property)!;
      return {
        type: 'Feature' as const,
        id: property.Id,
        geometry: {
          type: 'Point' as const,
          coordinates: coords,
        },
        properties: {
          id: property.Id,
        },
      };
    });

    return {
      validProperties: valid,
      geoJSON: {
        type: 'FeatureCollection' as const,
        features,
      },
    };
  }, [properties]);

  useEffect(() => {
    console.log('[PropertyLayer] Rendering', validProperties.length, 'markers');
  }, [validProperties.length]);

  if (!MapboxGL) {
    return null;
  }

  if (validProperties.length === 0) {
    return null;
  }

  // Limit markers for performance (max 300)
  const markersToRender = validProperties.slice(0, 300);

  // Show clustering overlay when there are many points
  const showClustering = clusteringEnabled && validProperties.length > 100;

  return (
    <>
      {/* Clustering layer - only shows cluster circles, individual points are hidden */}
      {showClustering && (
        <MapboxGL.ShapeSource
          id="properties-cluster-source"
          shape={geoJSON}
          cluster
          clusterRadius={MAP_SETTINGS.CLUSTER_RADIUS}
          clusterMaxZoomLevel={MAP_SETTINGS.CLUSTER_MAX_ZOOM}
        >
          {/* Cluster circles */}
          <MapboxGL.CircleLayer
            id="clusters"
            filter={['has', 'point_count']}
            style={{
              circleColor: '#3B82F6',
              circleRadius: [
                'step',
                ['get', 'point_count'],
                22,
                10, 26,
                50, 30,
                100, 36,
              ],
              circleOpacity: 0.9,
              circleStrokeWidth: 3,
              circleStrokeColor: '#FFFFFF',
            }}
          />

          {/* Cluster count labels */}
          <MapboxGL.SymbolLayer
            id="cluster-count"
            filter={['has', 'point_count']}
            style={{
              textField: ['get', 'point_count_abbreviated'],
              textSize: 15,
              textColor: '#FFFFFF',
              textFont: ['DIN Pro Bold', 'Arial Unicode MS Bold'],
              textAllowOverlap: true,
            }}
          />
        </MapboxGL.ShapeSource>
      )}

      {/* Always render individual custom markers with proper shapes */}
      {markersToRender.map((property) => (
        <PropertyMarker
          key={property.Id}
          property={property}
          onPress={onPropertyPress}
          isSelected={selectedProperty?.Id === property.Id}
          MapboxGL={MapboxGL}
          dispositionType={dispositionType}
        />
      ))}
    </>
  );
}
