import apiClient from './client';
import { API_ENDPOINTS } from '@/config/api';
import { Event, CreateEventRequest, UpdateEventRequest } from '@/models/types';

export const eventsApi = {
  /**
   * Create a new door knock event
   */
  async create(data: CreateEventRequest): Promise<Event> {
    return apiClient.post<Event>(API_ENDPOINTS.EVENTS, data);
  },

  /**
   * Get events for a property
   */
  async getByPropertyId(propertyId: string): Promise<Event[]> {
    return apiClient.get<Event[]>(`${API_ENDPOINTS.EVENTS}`, {
      params: { propertyId },
    });
  },

  /**
   * Update an event
   */
  async update(eventId: string, data: UpdateEventRequest): Promise<Event> {
    return apiClient.put<Event>(`${API_ENDPOINTS.EVENTS}/${eventId}`, data);
  },

  /**
   * Delete an event
   */
  async delete(eventId: string): Promise<void> {
    return apiClient.delete(`${API_ENDPOINTS.EVENTS}/${eventId}`);
  },

  /**
   * Batch sync events (for offline sync)
   */
  async batchSync(events: CreateEventRequest[]): Promise<Event[]> {
    return apiClient.post<Event[]>(`${API_ENDPOINTS.EVENTS}/batch`, {
      events,
    });
  },
};
