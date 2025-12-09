import React, { useMemo } from 'react';
// import Mapbox from '@rnmapbox/maps'; // Removed to avoid crash
import { Property } from '@/models/types';
import { PropertyMarker } from './PropertyMarker';
import { useMapStore } from '@/stores/mapStore';
import { MAP_SETTINGS } from '@/config/mapbox';

interface PropertyLayerProps {
  properties: Property[];
  onPropertyPress: (property: Property) => void;
  MapboxGL: any; // Injected dependency
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

export function PropertyLayer({ properties, onPropertyPress, MapboxGL }: PropertyLayerProps) {
  const { clusteringEnabled, selectedProperty } = useMapStore();

  // Filter properties with valid coordinates and convert to GeoJSON
  const { validProperties, geoJSON } = useMemo(() => {
    const valid = properties.filter(p => getPropertyCoordinates(p) !== null);

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
          address: property.Property_Street__c || property.Street__c || property.Name || '',
          // Store full property data for access
          propertyData: JSON.stringify(property),
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


  if (!MapboxGL) return null;

  if (!clusteringEnabled) {
    // Render individual markers without clustering
    return (
      <>
        {validProperties.map((property) => (
          <PropertyMarker
            key={property.Id}
            property={property}
            onPress={onPropertyPress}
            isSelected={selectedProperty?.Id === property.Id}
            MapboxGL={MapboxGL}
          />
        ))}
      </>
    );
  }


  // Render with clustering
  return (
    <MapboxGL.ShapeSource
      id="properties-source"
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
          circleColor: '#3b82f6',
          circleRadius: [
            'step',
            ['get', 'point_count'],
            20, // radius for clusters with < 10 points
            10,
            30, // radius for clusters with 10-99 points
            100,
            40, // radius for clusters with 100+ points
          ],
          circleOpacity: 0.7,
          circleStrokeWidth: 2,
          circleStrokeColor: '#ffffff',
        }}
      />

      {/* Cluster count labels */}
      <MapboxGL.SymbolLayer
        id="cluster-count"
        filter={['has', 'point_count']}
        style={{
          textField: ['get', 'point_count_abbreviated'],
          textSize: 14,
          textColor: '#ffffff',
          textFont: ['Arial Unicode MS Bold'],
        }}
      />

      {/* Individual property markers */}
      <MapboxGL.CircleLayer
        id="unclustered-point"
        filter={['!', ['has', 'point_count']]}
        style={{
          circleColor: '#ef4444',
          circleRadius: 8,
          circleStrokeWidth: 2,
          circleStrokeColor: '#ffffff',
        }}
      />
    </MapboxGL.ShapeSource>
  );
}
