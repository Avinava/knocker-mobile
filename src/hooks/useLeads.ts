import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leadsApi } from '@/services/api/leads';
import { CreateLeadRequest, UpdateLeadRequest } from '@/models/types';

/**
 * Get leads for a property
 */
export function usePropertyLeads(propertyId: string | null) {
  return useQuery({
    queryKey: ['leads', 'property', propertyId],
    queryFn: () => leadsApi.getByPropertyId(propertyId!),
    enabled: !!propertyId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get user's leads
 */
export function useMyLeads() {
  return useQuery({
    queryKey: ['leads', 'my'],
    queryFn: () => leadsApi.getMyLeads(),
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Create a new lead
 */
export function useCreateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLeadRequest) => leadsApi.create(data),
    onSuccess: (newLead) => {
      // Invalidate property details
      if (newLead.Property__c) {
        queryClient.invalidateQueries({ 
          queryKey: ['properties', newLead.Property__c] 
        });
      }
      // Invalidate my leads list
      queryClient.invalidateQueries({ queryKey: ['leads', 'my'] });
    },
  });
}

/**
 * Update a lead
 */
export function useUpdateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ leadId, data }: { leadId: string; data: UpdateLeadRequest }) =>
      leadsApi.update(leadId, data),
    onSuccess: (updatedLead) => {
      if (updatedLead.Property__c) {
        queryClient.invalidateQueries({ 
          queryKey: ['properties', updatedLead.Property__c] 
        });
      }
      queryClient.invalidateQueries({ queryKey: ['leads', 'my'] });
    },
  });
}
