import apiClient from './client';
import { API_ENDPOINTS } from '@/config/api';
import { SchemaValueSet, FieldDefinition } from '@/models/types';

// API response type for value sets from the backend
interface ValueSetApiResponse {
  fullName: string;
  customValue: Array<{
    fullName: string;
    label: string;
    default?: boolean;
  }>;
}

// Value set names for the different disposition types
export const VALUE_SET_NAMES = {
  STORM_KNOCK_STATUS: 'Storm_Inspection_Knock_Status',
  SOLAR_KNOCK_STATUS: 'Solar_Knock_Status',
  COMMUNITY_SOLAR_KNOCK_STATUS: 'Community_Solar_Knock_Status',
} as const;

// Task field names for picklist values
export const TASK_FIELD_NAMES = [
  'Solar_Knock_Status__c',
  'Storm_Inspection_Disposition__c',
  'Type',
  'Solar_On_Property__c',
  'Existing_Roof_Type__c',
  'Existing_Siding__c',
  'Community_Solar_Disposition__c',
] as const;

// Default value set names to fetch for the knock door form
const DEFAULT_VALUE_SET_NAMES = [
  'Solar_Knock_Status',
  'Community_Solar_Knock_Status',
  'Storm_Inspection_Knock_Status',
];

export const schemaApi = {
  /**
   * Get all picklist value sets (disposition statuses, roof types, etc.)
   * The API returns an array of value sets that we transform into a map
   */
  async getValueSets(setNames: string[] = DEFAULT_VALUE_SET_NAMES): Promise<Record<string, SchemaValueSet>> {
    const params = { sets: setNames.join(',') };
    const response = await apiClient.get<ValueSetApiResponse[]>(
      API_ENDPOINTS.SCHEMA_VALUE_SETS,
      { params }
    );
    
    // Transform array response into a map keyed by fullName
    const valueSetMap: Record<string, SchemaValueSet> = {};
    for (const item of response) {
      valueSetMap[item.fullName] = {
        name: item.fullName,
        values: item.customValue.map((cv) => ({
          label: cv.label,
          value: cv.fullName,
          default: cv.default || false,
        })),
      };
    }
    return valueSetMap;
  },

  /**
   * Get a specific value set by name
   */
  async getValueSet(name: string): Promise<SchemaValueSet> {
    return apiClient.get<SchemaValueSet>(
      `${API_ENDPOINTS.SCHEMA_VALUE_SETS}/${name}`
    );
  },

  /**
   * Get field definitions for an object (includes picklist values)
   * Note: The backend expects multiple 'fields' query params, not comma-separated
   */
  async getFieldDefinitions(objectName: string, fields?: string[]): Promise<Record<string, FieldDefinition>> {
    const endpoint = API_ENDPOINTS.SCHEMA_FIELDS(objectName);
    
    // Build query string with repeated 'fields' params like the web app does
    let url = endpoint;
    if (fields?.length) {
      const queryParams = new URLSearchParams();
      fields.forEach(field => queryParams.append('fields', field));
      url = `${endpoint}?${queryParams.toString()}`;
    }
    
    return apiClient.get<Record<string, FieldDefinition>>(url);
  },

  /**
   * Get Task field definitions (for door knock form)
   */
  async getTaskFieldDefinitions(): Promise<Record<string, FieldDefinition>> {
    return this.getFieldDefinitions('Task', [...TASK_FIELD_NAMES]);
  },
};
