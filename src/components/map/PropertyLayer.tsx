import React, { useMemo } from 'react';
import Mapbox from '@rnmapbox/maps';
import { Property } from '@/models/types';
import { PropertyMarker } from './PropertyMarker';
import { useMapStore } from '@/stores/mapStore';
import { MAP_SETTINGS } from '@/config/mapbox';

interface PropertyLayerProps {
  properties: Property[];
  onPropertyPress: (property: Property) => void;
}

export function PropertyLayer({ properties, onPropertyPress }: PropertyLayerProps) {
  const { clusteringEnabled, selectedProperty } = useMapStore();

  // Convert properties to GeoJSON for clustering
  const geoJSON = useMemo(() => {
    return {
      type: 'FeatureCollection' as const,
      features: properties.map((property) => ({
        type: 'Feature' as const,
        id: property.Id,
        geometry: {
          type: 'Point' as const,
          coordinates: [
            property.Geolocation__c.longitude,
            property.Geolocation__c.latitude,
          ],
        },
        properties: {
          id: property.Id,
          address: property.Street__c || '',
          // Store full property data for access
          propertyData: JSON.stringify(property),
        },
      })),
    };
  }, [properties]);

  if (!clusteringEnabled) {
    // Render individual markers without clustering
    return (
      <>
        {properties.map((property) => (
          <PropertyMarker
            key={property.Id}
            property={property}
            onPress={onPropertyPress}
            isSelected={selectedProperty?.Id === property.Id}
          />
        ))}
      </>
    );
  }

  // Render with clustering
  return (
    <Mapbox.ShapeSource
      id="properties-source"
      shape={geoJSON}
      cluster
      clusterRadius={MAP_SETTINGS.CLUSTER_RADIUS}
      clusterMaxZoomLevel={MAP_SETTINGS.CLUSTER_MAX_ZOOM}
    >
      {/* Cluster circles */}
      <Mapbox.CircleLayer
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
      <Mapbox.SymbolLayer
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
      <Mapbox.CircleLayer
        id="unclustered-point"
        filter={['!', ['has', 'point_count']]}
        style={{
          circleColor: '#ef4444',
          circleRadius: 8,
          circleStrokeWidth: 2,
          circleStrokeColor: '#ffffff',
        }}
      />
    </Mapbox.ShapeSource>
  );
}
