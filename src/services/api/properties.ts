import apiClient from './client';
import { API_ENDPOINTS } from '@/config/api';
import { 
  Property, 
  PropertySearchParams, 
  PropertyDetailsResponse,
  Bounds,
} from '@/models/types';

export const propertiesApi = {
  /**
   * Get properties within map bounds
   */
  async getWithinBounds(bounds: Bounds): Promise<Property[]> {
    const params = new URLSearchParams({
      nelat: bounds.maxLat.toString(),
      nelng: bounds.maxLng.toString(),
      swlat: bounds.minLat.toString(),
      swlng: bounds.minLng.toString(),
    });
    
    return apiClient.get<Property[]>(
      `${API_ENDPOINTS.PROPERTIES}?${params.toString()}`
    );
  },

  /**
   * Search properties by address, owner name, or other criteria
   */
  async search(params: PropertySearchParams): Promise<Property[]> {
    return apiClient.get<Property[]>(`${API_ENDPOINTS.PROPERTIES}/search`, {
      params,
    });
  },

  /**
   * Get property details with all related records
   */
  async getById(propertyId: string): Promise<PropertyDetailsResponse> {
    return apiClient.get<PropertyDetailsResponse>(
      `${API_ENDPOINTS.PROPERTIES}/${propertyId}`
    );
  },

  /**
   * Get properties by IDs (for offline sync)
   */
  async getByIds(propertyIds: string[]): Promise<Property[]> {
    return apiClient.post<Property[]>(`${API_ENDPOINTS.PROPERTIES}/batch`, {
      ids: propertyIds,
    });
  },
};
