import apiClient from './client';
import { API_ENDPOINTS } from '@/config/api';
import { Lead, CreateLeadRequest, UpdateLeadRequest } from '@/models/types';

interface AccessibleLeadsResponse {
  leads: Lead[];
  nextPageToken?: string;
  hasMore?: boolean;
  totalReturned?: number;
}

export const leadsApi = {
  /**
   * Create a new lead
   */
  async create(data: CreateLeadRequest): Promise<Lead> {
    return apiClient.post<Lead>(API_ENDPOINTS.LEADS, data);
  },

  /**
   * Get a lead by ID (with detail)
   */
  async getById(leadId: string): Promise<Lead> {
    return apiClient.get<Lead>(`${API_ENDPOINTS.LEADS}/${leadId}/detail`);
  },

  /**
   * Update a lead
   */
  async update(leadId: string, data: UpdateLeadRequest): Promise<Lead> {
    return apiClient.put<Lead>(`${API_ENDPOINTS.LEADS}/${leadId}`, data);
  },

  /**
   * Get leads for a property
   */
  async getByPropertyId(propertyId: string): Promise<Lead[]> {
    return apiClient.get<Lead[]>(API_ENDPOINTS.LEADS, {
      params: { propertyId },
    });
  },

  /**
   * Get accessible leads for the current user
   * Uses /data/leads/accessible endpoint with pagination support
   */
  async getMyLeads(params?: {
    pageSize?: number;
    orderBy?: string;
    orderDirection?: 'ASC' | 'DESC';
    searchTerm?: string;
    status?: string;
    nextPageToken?: string;
  }): Promise<Lead[]> {
    const response = await apiClient.get<AccessibleLeadsResponse>(
      API_ENDPOINTS.LEADS_ACCESSIBLE,
      {
        params: {
          pageSize: params?.pageSize || 200,
          orderBy: params?.orderBy || 'CreatedDate',
          orderDirection: params?.orderDirection || 'DESC',
          ...params,
        },
      }
    );
    return response.leads || [];
  },

  /**
   * Batch sync leads (for offline sync)
   */
  async batchSync(leads: CreateLeadRequest[]): Promise<Lead[]> {
    return apiClient.post<Lead[]>(`${API_ENDPOINTS.LEADS}/batch`, {
      leads,
    });
  },
};
