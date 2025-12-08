import apiClient from './client';
import { API_ENDPOINTS } from '@/config/api';
import { Lead, CreateLeadRequest, UpdateLeadRequest } from '@/models/types';

export const leadsApi = {
  /**
   * Create a new lead
   */
  async create(data: CreateLeadRequest): Promise<Lead> {
    return apiClient.post<Lead>(API_ENDPOINTS.LEADS, data);
  },

  /**
   * Get a lead by ID
   */
  async getById(leadId: string): Promise<Lead> {
    return apiClient.get<Lead>(`${API_ENDPOINTS.LEADS}/${leadId}`);
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
   * Get leads for the current user
   */
  async getMyLeads(): Promise<Lead[]> {
    return apiClient.get<Lead[]>(`${API_ENDPOINTS.LEADS}/my`);
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
