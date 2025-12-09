import React from 'react';
// import Mapbox from '@rnmapbox/maps'; // Removed to avoid crash
import PropertyMarkerClass from '@/models/Property';
import { Property } from '@/models/types';

interface PropertyMarkerProps {
  property: Property;
  onPress?: (property: Property) => void;
  isSelected?: boolean;
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

export function PropertyMarker({
  property,
  onPress,
  isSelected = false,
  MapboxGL,
}: PropertyMarkerProps) {
  if (!MapboxGL) return null;

  const coords = getPropertyCoordinates(property);
  if (!coords) return null;

  const propertyModel = new PropertyMarkerClass(property);

  // Get marker details based on disposition
  const { icon, color } = propertyModel.getDispositionIconDetails();

  const handlePress = () => {
    onPress?.(property);
  };

  const title = property.Property_Street__c || property.Street__c || property.Name || 'Property';

  return (
    <MapboxGL.PointAnnotation
      id={property.Id}
      coordinate={coords}
      onSelected={handlePress}
    >
      <MapboxGL.Callout title={title} />
    </MapboxGL.PointAnnotation>
  );
}

