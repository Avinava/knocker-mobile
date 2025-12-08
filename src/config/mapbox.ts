import ENV from './env';

export const MAPBOX_CONFIG = {
  ACCESS_TOKEN: ENV.mapboxToken,
  STYLE_STREET: 'mapbox://styles/mapbox/streets-v12',
  STYLE_SATELLITE: 'mapbox://styles/mapbox/satellite-streets-v12',
  STYLE_OUTDOORS: 'mapbox://styles/mapbox/outdoors-v12',
};

export const MAP_DEFAULTS = {
  LATITUDE: 40.7128,
  LONGITUDE: -74.0060,
  ZOOM: 14,
  MIN_ZOOM: 10,
  MAX_ZOOM: 20,
  PITCH: 0,
  HEADING: 0,
};

export const MAP_SETTINGS = {
  CLUSTER_RADIUS: 50,
  CLUSTER_MAX_ZOOM: 14,
  MAX_MARKERS: 1000,
  BOUNDS_BUFFER: 0.1,
  DEBOUNCE_TIME: 300,
};
