import apiClient from './client';
import { API_ENDPOINTS } from '@/config/api';
import { SchemaValueSet } from '@/models/types';

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
};
