import ENV from './env';

export const MAPBOX_CONFIG = {
  ACCESS_TOKEN: ENV.mapboxToken,
};

// Map style URLs
export const MAP_STYLES = {
  streets: 'mapbox://styles/mapbox/streets-v12',
  satellite: 'mapbox://styles/mapbox/satellite-v9',
  hybrid: 'mapbox://styles/mapbox/satellite-streets-v12',
  outdoors: 'mapbox://styles/mapbox/outdoors-v12',
};

// Initial view state
export const INITIAL_VIEW_STATE = {
  longitude: -77.4033116,
  latitude: 39.4262437,
  zoom: 14,
  pitch: 0,
  heading: 0,
};

export const MAP_DEFAULTS = {
  MIN_ZOOM: 10,
  MAX_ZOOM: 20,
};

export const MAP_SETTINGS = {
  CLUSTER_RADIUS: 50,
  CLUSTER_MAX_ZOOM: 14,
  MAX_MARKERS: 1000,
  BOUNDS_BUFFER: 0.1,
  DEBOUNCE_TIME: 300,
};
