import { useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsApi } from '@/services/api/events';
import { CreateEventRequest, UpdateEventRequest } from '@/models/types';

/**
 * Create a new door knock event
 */
export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEventRequest) => eventsApi.create(data),
    onSuccess: (newEvent) => {
      // Invalidate property details to refresh events list
      queryClient.invalidateQueries({ 
        queryKey: ['properties', newEvent.WhatId] 
      });
      // Invalidate properties list to update marker color
      queryClient.invalidateQueries({ 
        queryKey: ['properties', 'bounds'] 
      });
    },
  });
}

/**
 * Update an existing event
 */
export function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, data }: { eventId: string; data: UpdateEventRequest }) =>
      eventsApi.update(eventId, data),
    onSuccess: (updatedEvent) => {
      queryClient.invalidateQueries({ 
        queryKey: ['properties', updatedEvent.WhatId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['properties', 'bounds'] 
      });
    },
  });
}

/**
 * Delete an event
 */
export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: string) => eventsApi.delete(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });
}
