import apiClient from './client';
import { API_ENDPOINTS } from '@/config/api';
import {
  Property,
  PropertySearchParams,
  PropertyDetailsResponse,
  Bounds,
} from '@/models/types';

interface PaginatedPropertiesResponse {
  records: Property[];
  nextPageToken?: string;
  hasMore?: boolean;
  totalReturned?: number;
}

export const propertiesApi = {
  /**
   * Get properties within map bounds
   * Uses /data/properties/within-bounds endpoint
   */
  async getWithinBounds(bounds: Bounds): Promise<Property[]> {
    const params = {
      minLat: bounds.minLat.toString(),
      maxLat: bounds.maxLat.toString(),
      minLng: bounds.minLng.toString(),
      maxLng: bounds.maxLng.toString(),
    };

    console.log('[propertiesApi] getWithinBounds called with bounds:', bounds);
    console.log('[propertiesApi] Sending params:', params);
    console.log('[propertiesApi] Endpoint:', API_ENDPOINTS.PROPERTIES_WITHIN_BOUNDS);

    const result = await apiClient.get<Property[]>(
      API_ENDPOINTS.PROPERTIES_WITHIN_BOUNDS,
      { params }
    );

    console.log('[propertiesApi] Response received, count:', Array.isArray(result) ? result.length : 'not array');
    return result;
  },


  /**
   * Get paginated properties
   * Uses /data/properties/paginated endpoint
   */
  async getPaginated(params?: {
    pageSize?: number;
    orderBy?: string;
    orderDirection?: 'ASC' | 'DESC';
    searchTerm?: string;
    nextPageToken?: string;
  }): Promise<PaginatedPropertiesResponse> {
    return apiClient.get<PaginatedPropertiesResponse>(
      `${API_ENDPOINTS.PROPERTIES}/paginated`,
      {
        params: {
          pageSize: params?.pageSize || 20,
          orderBy: params?.orderBy || 'LastModifiedDate',
          orderDirection: params?.orderDirection || 'DESC',
          ...params,
        },
      }
    );
  },

  /**
   * Search properties by address, owner name, or other criteria
   */
  async search(params: PropertySearchParams): Promise<Property[]> {
    return apiClient.get<Property[]>(`${API_ENDPOINTS.PROPERTIES}/search`, {
      params: {
        term: params.query || params.address,
        ...params,
      },
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
   * Update a property
   */
  async update(propertyId: string, data: Partial<Property>): Promise<{ id: string; success: boolean }> {
    return apiClient.put<{ id: string; success: boolean }>(
      `${API_ENDPOINTS.PROPERTIES}/${propertyId}`,
      data
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
