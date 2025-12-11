import ENV from './env';

export const API_CONFIG = {
  BASE_URL: ENV.apiBaseUrl,
  VERSION: ENV.apiVersion,
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REFRESH_TOKEN: '/auth/refresh',
  
  // Properties
  PROPERTIES: '/data/properties',
  PROPERTIES_WITHIN_BOUNDS: '/data/properties/within-bounds',
  PROPERTIES_SEARCH: '/data/properties/search',
  PROPERTY_BY_ID: (id: string) => `/data/properties/${id}`,
  
  // Events
  EVENTS: '/data/events',
  EVENT_BY_ID: (id: string) => `/data/events/${id}`,
  
  // Leads
  LEADS: '/data/leads',
  LEAD_BY_ID: (id: string) => `/data/leads/${id}`,
  LEADS_ACCESSIBLE: '/data/leads/accessible',
  
  // Schema
  SCHEMA_VALUE_SETS: '/data/schema/valuesets',
  SCHEMA_FIELDS: (objectName: string) => `/data/schema/fields/${objectName}`,
};
