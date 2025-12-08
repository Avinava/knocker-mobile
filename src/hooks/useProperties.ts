import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { propertiesApi } from '@/services/api/properties';
import { Bounds, Property, PropertySearchParams } from '@/models/types';

/**
 * Fetch properties within map bounds
 */
export function usePropertiesInBounds(bounds: Bounds | null) {
  return useQuery({
    queryKey: ['properties', 'bounds', bounds],
    queryFn: () => propertiesApi.getWithinBounds(bounds!),
    enabled: !!bounds,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Search properties by criteria
 */
export function usePropertySearch(params: PropertySearchParams) {
  return useQuery({
    queryKey: ['properties', 'search', params],
    queryFn: () => propertiesApi.search(params),
    enabled: !!params.query || !!params.address || !!params.owner,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Get property details by ID
 */
export function usePropertyDetails(propertyId: string | null) {
  return useQuery({
    queryKey: ['properties', propertyId],
    queryFn: () => propertiesApi.getById(propertyId!),
    enabled: !!propertyId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Prefetch property details (for hover/tap optimization)
 */
export function usePrefetchProperty() {
  const queryClient = useQueryClient();

  return (propertyId: string) => {
    queryClient.prefetchQuery({
      queryKey: ['properties', propertyId],
      queryFn: () => propertiesApi.getById(propertyId),
      staleTime: 5 * 60 * 1000,
    });
  };
}
