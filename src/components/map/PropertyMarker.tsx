import React from 'react';
import Mapbox from '@rnmapbox/maps';
import PropertyMarkerClass from '@/models/Property';
import { Property } from '@/models/types';

interface PropertyMarkerProps {
  property: Property;
  onPress?: (property: Property) => void;
  isSelected?: boolean;
}

export function PropertyMarker({ 
  property, 
  onPress,
  isSelected = false,
}: PropertyMarkerProps) {
  const propertyModel = new PropertyMarkerClass(property);
  
  // Get marker details based on disposition
  const { icon, color } = propertyModel.getDispositionIconDetails();

  const handlePress = () => {
    onPress?.(property);
  };
  
  const title = property.Street__c || 'Property';

  return (
    <Mapbox.PointAnnotation
      id={property.Id}
      coordinate={[
        property.Geolocation__c.longitude,
        property.Geolocation__c.latitude,
      ]}
      onSelected={handlePress}
    >
      <Mapbox.Callout title={title} />
    </Mapbox.PointAnnotation>
  );
}
