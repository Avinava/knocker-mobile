import Constants from 'expo-constants';

const ENV = {
  dev: {
    apiBaseUrl: 'http://localhost:3000',
    apiVersion: 'v1',
    mapboxToken: process.env.MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoiYXZpY2FsOTkiLCJhIjoiY20ybWJ1NHBtMGpteTJpcjJlbXZvNWRlcSJ9.uXNyHy-mKBwW58k-_3GMPQ',
  },
  staging: {
    apiBaseUrl: 'https://staging-api.knocker.com',
    apiVersion: 'v1',
    mapboxToken: process.env.MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoiYXZpY2FsOTkiLCJhIjoiY20ybWJ1NHBtMGpteTJpcjJlbXZvNWRlcSJ9.uXNyHy-mKBwW58k-_3GMPQ',
  },
  prod: {
    apiBaseUrl: 'https://api.knocker.com',
    apiVersion: 'v1',
    mapboxToken: process.env.MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoiYXZpY2FsOTkiLCJhIjoiY20ybWJ1NHBtMGpteTJpcjJlbXZvNWRlcSJ9.uXNyHy-mKBwW58k-_3GMPQ',
  },
};

const getEnvVars = (env = Constants.expoConfig?.extra?.environment || 'dev') => {
  if (env === 'prod') return ENV.prod;
  if (env === 'staging') return ENV.staging;
  return ENV.dev;
};

export default getEnvVars();
