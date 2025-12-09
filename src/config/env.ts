import Constants from 'expo-constants';

// Fallback values for development
const FALLBACK_MAPBOX_TOKEN = 'pk.eyJ1IjoiYXZpY2FsOTkiLCJhIjoiY21peGhoOGtqMDMwdjNnczZuazk0bGFtMiJ9.TjQD8Lu71aIHrLYlzd1Z8A';

const ENV = {
  dev: {
    apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.0.102:3000',
    apiVersion: process.env.EXPO_PUBLIC_API_VERSION || 'v1',
    mapboxToken: process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || FALLBACK_MAPBOX_TOKEN,
  },
  staging: {
    apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || 'https://staging-api.knocker.com',
    apiVersion: process.env.EXPO_PUBLIC_API_VERSION || 'v1',
    mapboxToken: process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || FALLBACK_MAPBOX_TOKEN,
  },
  prod: {
    apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.knocker.com',
    apiVersion: process.env.EXPO_PUBLIC_API_VERSION || 'v1',
    mapboxToken: process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || FALLBACK_MAPBOX_TOKEN,
  },
};

const getEnvVars = (env = Constants.expoConfig?.extra?.environment || 'dev') => {
  if (env === 'prod') return ENV.prod;
  if (env === 'staging') return ENV.staging;
  return ENV.dev;
};

export default getEnvVars();
