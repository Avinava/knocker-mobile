import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Property } from '@/models/types';
import { BaseMarker } from './BaseMarker';

// Disposition status to marker style mapping
const DISPOSITION_ICON_MAPPINGS: Record<string, {
  name: string;
  markerColor: string;
  color: string;
  shape: 'balloon' | 'circle' | 'square';
}> = {
  'Contact Made': {
    name: 'History',
    markerColor: 'teal',
    color: '#fff',
    shape: 'square',
  },
  'Call Back': {
    name: 'PhoneForwarded',
    markerColor: 'blue',
    color: '#fff',
    shape: 'square',
  },
  'Lead': {
    name: 'CalendarCheck',
    markerColor: 'orange',
    color: '#fff',
    shape: 'square',
  },
  'Sold': {
    name: 'HeartHandshake',
    markerColor: 'green',
    color: '#fff',
    shape: 'square',
  },
  'Enrolled (Sold)': {
    name: 'HeartHandshake',
    markerColor: 'green',
    color: '#fff',
    shape: 'circle',
  },
  'Not Interested': {
    name: 'UserRoundX',
    markerColor: 'yellow',
    color: '#fff',
    shape: 'square',
  },
  'Pitch Miss': {
    name: 'ArchiveX',
    markerColor: 'darkgrey',
    color: '#fff',
    shape: 'square',
  },
  'No Soliciting': {
    name: 'Frown',
    markerColor: 'grey',
    color: '#fff',
    shape: 'square',
  },
  'Do Not Return': {
    name: 'Ban',
    markerColor: 'black',
    color: '#fff',
    shape: 'square',
  },
  'Do Not Knock': {
    name: 'ShieldAlert',
    markerColor: 'maroon',
    color: '#fff',
    shape: 'square',
  },
  'Already Contracted': {
    name: 'Container',
    markerColor: 'pink',
    color: '#fff',
    shape: 'square',
  },
  'No Answer': {
    name: 'LogIn',
    markerColor: 'red',
    color: '#fff',
    shape: 'square',
  },
  'Not Home': {
    name: 'House',
    markerColor: 'red',
    color: '#fff',
    shape: 'square',
  },
  'Rental': {
    name: 'PenOff',
    markerColor: 'purple',
    color: '#fff',
    shape: 'square',
  },
  'Completed Project': {
    name: 'CircleCheck',
    markerColor: 'green',
    color: '#fff',
    shape: 'square',
  },
  'Already Has Community Solar / Panels': {
    name: 'Container',
    markerColor: 'pink',
    color: '#fff',
    shape: 'circle',
  },
  'Canceled': {
    name: 'ArchiveX',
    markerColor: 'darkgrey',
    color: '#fff',
    shape: 'square',
  },
  'Canceled While Enrolling': {
    name: 'CircleX',
    markerColor: 'cyan',
    color: '#fff',
    shape: 'square',
  },
  'Inspected - No Damage': {
    name: 'CloudOff',
    markerColor: 'grey',
    color: '#fff',
    shape: 'square',
  },
  'Post Storm Prospect': {
    name: 'CloudOff',
    markerColor: 'cyan',
    color: '#fff',
    shape: 'square',
  },
  'Logging - No Knock': {
    name: 'ClipboardList',
    markerColor: 'grey',
    color: '#fff',
    shape: 'square',
  },
};

const DEFAULT_ICON = {
  name: 'Circle',
  markerColor: 'red',
  color: '#fff',
  shape: 'balloon' as const,
};

interface PropertyMarkerProps {
  property: Property;
  onPress?: (property: Property) => void;
  isSelected?: boolean;
  MapboxGL: any;
  dispositionType?: 'Insurance Restoration' | 'Community Solar';
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

// Get disposition status from property events
function getDispositionStatus(property: Property, dispositionType: string): string | null {
  if (!property.Events?.records || property.Events.records.length === 0) {
    return null;
  }

  const event = property.Events.records.find(
    (e) => e.Disposition_Type__c === dispositionType
  );

  return event?.Disposition_Status__c || null;
}

// Get marker style based on disposition
function getMarkerStyle(property: Property, dispositionType: string) {
  const status = getDispositionStatus(property, dispositionType);

  if (status && DISPOSITION_ICON_MAPPINGS[status]) {
    return DISPOSITION_ICON_MAPPINGS[status];
  }

  return DEFAULT_ICON;
}

export function PropertyMarker({
  property,
  onPress,
  isSelected = false,
  MapboxGL,
  dispositionType = 'Insurance Restoration',
}: PropertyMarkerProps) {
  if (!MapboxGL) return null;

  const coords = getPropertyCoordinates(property);
  if (!coords) return null;

  const markerStyle = getMarkerStyle(property, dispositionType);

  const handlePress = () => {
    onPress?.(property);
  };

  return (
    <MapboxGL.MarkerView
      id={property.Id}
      coordinate={coords}
      anchor={{ x: 0.5, y: 1 }}
    >
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.8}
        style={isSelected ? styles.selectedMarker : undefined}
      >
        <BaseMarker
          color={markerStyle.markerColor}
          shape={markerStyle.shape}
          iconName={markerStyle.name}
          iconColor={markerStyle.color}
          size={isSelected ? 40 : 32}
        />
      </TouchableOpacity>
    </MapboxGL.MarkerView>
  );
}

const styles = StyleSheet.create({
  selectedMarker: {
    transform: [{ scale: 1.2 }],
  },
});

export default PropertyMarker;
