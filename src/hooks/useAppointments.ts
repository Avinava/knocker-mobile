import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentsApi } from '@/services/api/appointments';
import { CreateAppointmentRequest, UpdateAppointmentRequest, Appointment } from '@/models/types';

export const appointmentKeys = {
  all: ['appointments'] as const,
  upcoming: () => [...appointmentKeys.all, 'upcoming'] as const,
  today: () => [...appointmentKeys.all, 'today'] as const,
  thisWeek: () => [...appointmentKeys.all, 'thisWeek'] as const,
  byProperty: (propertyId: string) => [...appointmentKeys.all, 'property', propertyId] as const,
  byLead: (leadId: string) => [...appointmentKeys.all, 'lead', leadId] as const,
  byDateRange: (start: string, end: string) => [...appointmentKeys.all, 'range', start, end] as const,
};

/**
 * Get upcoming appointments
 */
export function useUpcomingAppointments() {
  return useQuery({
    queryKey: appointmentKeys.upcoming(),
    queryFn: () => appointmentsApi.getUpcoming(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get today's appointments
 */
export function useTodayAppointments() {
  return useQuery({
    queryKey: appointmentKeys.today(),
    queryFn: () => appointmentsApi.getToday(),
    staleTime: 2 * 60 * 1000, // 2 minutes - more frequent refresh for today
  });
}

/**
 * Get this week's appointments
 */
export function useThisWeekAppointments() {
  return useQuery({
    queryKey: appointmentKeys.thisWeek(),
    queryFn: () => appointmentsApi.getThisWeek(),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get appointments for a property
 */
export function usePropertyAppointments(propertyId: string | null) {
  return useQuery({
    queryKey: appointmentKeys.byProperty(propertyId || ''),
    queryFn: () => appointmentsApi.getByPropertyId(propertyId!),
    enabled: !!propertyId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get appointments for a lead
 */
export function useLeadAppointments(leadId: string | null) {
  return useQuery({
    queryKey: appointmentKeys.byLead(leadId || ''),
    queryFn: () => appointmentsApi.getByLeadId(leadId!),
    enabled: !!leadId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Create a new appointment
 */
export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAppointmentRequest) => appointmentsApi.create(data),
    onSuccess: () => {
      // Invalidate all appointment queries
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
    },
  });
}

/**
 * Update an appointment
 */
export function useUpdateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAppointmentRequest }) =>
      appointmentsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
    },
  });
}

/**
 * Delete an appointment
 */
export function useDeleteAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => appointmentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
    },
  });
}

/**
 * Helper to format appointment time
 */
export function formatAppointmentTime(appointment: Appointment): string {
  const start = new Date(appointment.StartDateTime);
  const end = new Date(appointment.EndDateTime);
  
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  };
  
  const startTime = start.toLocaleTimeString('en-US', timeOptions);
  const endTime = end.toLocaleTimeString('en-US', timeOptions);
  
  return `${startTime} - ${endTime}`;
}

/**
 * Helper to format appointment date
 */
export function formatAppointmentDate(appointment: Appointment): string {
  const start = new Date(appointment.StartDateTime);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  today.setHours(0, 0, 0, 0);
  tomorrow.setHours(0, 0, 0, 0);
  const appointmentDate = new Date(start);
  appointmentDate.setHours(0, 0, 0, 0);
  
  if (appointmentDate.getTime() === today.getTime()) {
    return 'Today';
  }
  if (appointmentDate.getTime() === tomorrow.getTime()) {
    return 'Tomorrow';
  }
  
  return start.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Check if appointment is happening soon (within 1 hour)
 */
export function isAppointmentSoon(appointment: Appointment): boolean {
  const start = new Date(appointment.StartDateTime);
  const now = new Date();
  const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
  
  return start >= now && start <= oneHourFromNow;
}
