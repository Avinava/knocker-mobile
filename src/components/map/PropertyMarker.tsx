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

export function PropertyMarker({
  property,
  onPress,
  isSelected = false,
  MapboxGL,
}: PropertyMarkerProps) {
  if (!MapboxGL) return null;

  const propertyModel = new PropertyMarkerClass(property);

  // Get marker details based on disposition
  const { icon, color } = propertyModel.getDispositionIconDetails();

  const handlePress = () => {
    onPress?.(property);
  };

  const title = property.Street__c || 'Property';

  return (
    <MapboxGL.PointAnnotation
      id={property.Id}
      coordinate={[
        property.Geolocation__c.longitude,
        property.Geolocation__c.latitude,
      ]}
      onSelected={handlePress}
    >
      <MapboxGL.Callout title={title} />
    </MapboxGL.PointAnnotation>
  );
}
