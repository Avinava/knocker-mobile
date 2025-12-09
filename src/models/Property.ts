import { Property as PropertyType, Event, Location } from './types';
import { DispositionType, DISPOSITION_TYPE_MAP } from '@/utils/constants';

export interface MarkerStyle {
  name: string;
  color: string;
  markerColor: string;
  scale: number;
  shape: 'circle' | 'square';
  animate: boolean;
}

// Helper function to extract location from property
function getLocationFromProperty(record: PropertyType): Location {
  // Try Geolocation__c first
  if (record.Geolocation__c?.latitude != null && record.Geolocation__c?.longitude != null) {
    return {
      latitude: record.Geolocation__c.latitude,
      longitude: record.Geolocation__c.longitude,
    };
  }
  // Fall back to Latitude__c and Longitude__c
  return {
    latitude: record.Latitude__c || 0,
    longitude: record.Longitude__c || 0,
  };
}

export default class PropertyMarker {
  public record: PropertyType;
  public location: Location;
  public marker: MarkerStyle;
  public fromSearch: boolean = false;
  private currentDisposition: DispositionType;

  constructor(
    record: PropertyType,
    dispositionType: DispositionType = DISPOSITION_TYPE_MAP.INSURANCE_RESTORATION
  ) {
    this.record = record;
    this.currentDisposition = dispositionType;
    this.location = getLocationFromProperty(record);
    this.marker = this.calculateMarkerStyle();
  }


  private calculateMarkerStyle(): MarkerStyle {
    const event = this.getMostRecentEvent(this.currentDisposition);
    const status = event?.Disposition_Status__c;

    const iconDetails = PropertyMarker.getDispositionIconDetails(
      this.currentDisposition,
      status || 'Not Knocked'
    );

    return {
      name: iconDetails.name,
      color: iconDetails.color,
      markerColor: iconDetails.markerColor,
      scale: 1,
      shape: iconDetails.shape,
      animate: false,
    };
  }

  getMostRecentEvent(dispositionType: DispositionType): Event | null {
    if (!this.record.Events?.records || this.record.Events.records.length === 0) {
      return null;
    }

    const relevantEvents = this.record.Events.records.filter(
      (event) => event.Disposition_Type__c === dispositionType
    );

    if (relevantEvents.length === 0) return null;

    return relevantEvents.reduce((latest, event) => {
      const latestDate = new Date(latest.CreatedDate).getTime();
      const eventDate = new Date(event.CreatedDate).getTime();
      return eventDate > latestDate ? event : latest;
    });
  }

  addEvent(event: Event): void {
    if (!this.record.Events) {
      this.record.Events = { records: [] };
    }
    this.record.Events.records.unshift(event);
    this.marker = this.calculateMarkerStyle();
  }

  getDispositionIconDetails(): { icon: string; color: string } {
    const mostRecentEvent = this.getMostRecentEvent(this.currentDisposition);
    const status = mostRecentEvent?.Disposition_Status__c || '';
    const details = PropertyMarker.getDispositionIconDetails(this.currentDisposition, status);
    return {
      icon: details.name,
      color: details.color,
    };
  }

  static getDispositionIconDetails(
    dispositionType: DispositionType,
    status: string
  ): { name: string; color: string; markerColor: string; shape: 'circle' | 'square' } {
    // Default values
    let iconName = 'home';
    let color = '#6B7280'; // gray
    let markerColor = '#9CA3AF'; // lighter gray
    let shape: 'circle' | 'square' = 'circle';

    if (dispositionType === DISPOSITION_TYPE_MAP.INSURANCE_RESTORATION) {
      switch (status) {
        case 'Contact Made':
          iconName = 'user-check';
          color = '#3B82F6'; // blue
          markerColor = '#60A5FA';
          break;
        case 'Lead':
        case 'Got Utility Bill (Lead)':
          iconName = 'star';
          color = '#F59E0B'; // amber
          markerColor = '#FBBF24';
          shape = 'square';
          break;
        case 'Not Home':
          iconName = 'home';
          color = '#6B7280'; // gray
          markerColor = '#9CA3AF';
          break;
        case 'Not Interested':
          iconName = 'x-circle';
          color = '#EF4444'; // red
          markerColor = '#F87171';
          break;
        case 'Already Replaced':
          iconName = 'check-circle';
          color = '#10B981'; // green
          markerColor = '#34D399';
          break;
        default:
          iconName = 'home';
          color = '#6B7280';
          markerColor = '#9CA3AF';
      }
    } else if (dispositionType === DISPOSITION_TYPE_MAP.SOLAR_REPLACEMENT) {
      switch (status) {
        case 'Contact Made':
          iconName = 'sun';
          color = '#3B82F6';
          markerColor = '#60A5FA';
          break;
        case 'Lead':
          iconName = 'zap';
          color = '#F59E0B';
          markerColor = '#FBBF24';
          shape = 'square';
          break;
        case 'Not Home':
          iconName = 'home';
          color = '#6B7280';
          markerColor = '#9CA3AF';
          break;
        case 'Not Interested':
          iconName = 'x-circle';
          color = '#EF4444';
          markerColor = '#F87171';
          break;
        default:
          iconName = 'sun';
          color = '#6B7280';
          markerColor = '#9CA3AF';
      }
    } else if (dispositionType === DISPOSITION_TYPE_MAP.COMMUNITY_SOLAR) {
      switch (status) {
        case 'Contact Made':
          iconName = 'users';
          color = '#3B82F6';
          markerColor = '#60A5FA';
          break;
        case 'Lead':
        case 'Got Utility Bill (Lead)':
          iconName = 'briefcase';
          color = '#F59E0B';
          markerColor = '#FBBF24';
          shape = 'square';
          break;
        case 'Not Home':
          iconName = 'home';
          color = '#6B7280';
          markerColor = '#9CA3AF';
          break;
        case 'Not Interested':
          iconName = 'x-circle';
          color = '#EF4444';
          markerColor = '#F87171';
          break;
        default:
          iconName = 'users';
          color = '#6B7280';
          markerColor = '#9CA3AF';
      }
    }

    return { name: iconName, color, markerColor, shape };
  }

  static toGeoJSON(markers: PropertyMarker[]): GeoJSON.FeatureCollection {
    return {
      type: 'FeatureCollection',
      features: markers.map((marker) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [marker.location.longitude, marker.location.latitude],
        },
        properties: {
          id: marker.record.Id,
          icon: marker.marker.name,
          color: marker.marker.color,
          markerColor: marker.marker.markerColor,
          shape: marker.marker.shape,
        },
      })),
    };
  }

  getDetails() {
    return {
      title: this.record.Name,
      address: this.record.Address__c,
      owner: [this.record.Owner_1_Name_Full__c, this.record.Owner_2_Name_Full__c]
        .filter(Boolean)
        .join(' & ') || 'Unknown',
    };
  }
}
