import apiClient from './client';
import { API_ENDPOINTS } from '@/config/api';
import { Appointment, CreateAppointmentRequest, UpdateAppointmentRequest } from '@/models/types';

export const appointmentsApi = {
  /**
   * Get all upcoming appointments for the current user
   */
  async getUpcoming(): Promise<Appointment[]> {
    const now = new Date().toISOString();
    const events = await apiClient.get<Appointment[]>(API_ENDPOINTS.EVENTS, {
      params: {
        startDateTimeAfter: now,
        hasScheduledTime: true,
        orderBy: 'StartDateTime',
        orderDirection: 'ASC',
      },
    });
    // Filter to only include events with StartDateTime (scheduled appointments)
    return events.filter((e) => e.StartDateTime);
  },

  /**
   * Get appointments within a date range
   */
  async getByDateRange(startDate: Date, endDate: Date): Promise<Appointment[]> {
    const events = await apiClient.get<Appointment[]>(API_ENDPOINTS.EVENTS, {
      params: {
        startDateTimeAfter: startDate.toISOString(),
        startDateTimeBefore: endDate.toISOString(),
        hasScheduledTime: true,
        orderBy: 'StartDateTime',
        orderDirection: 'ASC',
      },
    });
    return events.filter((e) => e.StartDateTime);
  },

  /**
   * Get today's appointments
   */
  async getToday(): Promise<Appointment[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return this.getByDateRange(today, tomorrow);
  },

  /**
   * Get this week's appointments
   */
  async getThisWeek(): Promise<Appointment[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() + 7);
    return this.getByDateRange(today, weekEnd);
  },

  /**
   * Create a new appointment
   */
  async create(data: CreateAppointmentRequest): Promise<Appointment> {
    return apiClient.post<Appointment>(API_ENDPOINTS.EVENTS, data);
  },

  /**
   * Update an appointment
   */
  async update(appointmentId: string, data: UpdateAppointmentRequest): Promise<Appointment> {
    return apiClient.put<Appointment>(`${API_ENDPOINTS.EVENTS}/${appointmentId}`, data);
  },

  /**
   * Delete an appointment
   */
  async delete(appointmentId: string): Promise<void> {
    return apiClient.delete(`${API_ENDPOINTS.EVENTS}/${appointmentId}`);
  },

  /**
   * Get appointments for a specific property
   */
  async getByPropertyId(propertyId: string): Promise<Appointment[]> {
    const events = await apiClient.get<Appointment[]>(API_ENDPOINTS.EVENTS, {
      params: {
        propertyId,
        hasScheduledTime: true,
        orderBy: 'StartDateTime',
        orderDirection: 'ASC',
      },
    });
    return events.filter((e) => e.StartDateTime);
  },

  /**
   * Get appointments for a specific lead
   */
  async getByLeadId(leadId: string): Promise<Appointment[]> {
    const events = await apiClient.get<Appointment[]>(API_ENDPOINTS.EVENTS, {
      params: {
        leadId,
        hasScheduledTime: true,
        orderBy: 'StartDateTime',
        orderDirection: 'ASC',
      },
    });
    return events.filter((e) => e.StartDateTime);
  },
};
