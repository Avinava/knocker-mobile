import apiClient from './client';
import { API_ENDPOINTS } from '@/config/api';
import { SchemaValueSet, FieldDefinition } from '@/models/types';

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

export const schemaApi = {
  /**
   * Get all picklist value sets (disposition statuses, roof types, etc.)
   */
  async getValueSets(): Promise<Record<string, SchemaValueSet>> {
    return apiClient.get<Record<string, SchemaValueSet>>(
      API_ENDPOINTS.SCHEMA_VALUE_SETS
    );
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
   */
  async getFieldDefinitions(objectName: string, fields?: string[]): Promise<Record<string, FieldDefinition>> {
    const endpoint = API_ENDPOINTS.SCHEMA_FIELDS(objectName);
    const params = fields?.length ? { fields: fields.join(',') } : {};
    return apiClient.get<Record<string, FieldDefinition>>(endpoint, { params });
  },

  /**
   * Get Task field definitions (for door knock form)
   */
  async getTaskFieldDefinitions(): Promise<Record<string, FieldDefinition>> {
    return this.getFieldDefinitions('Task', [...TASK_FIELD_NAMES]);
  },
};
