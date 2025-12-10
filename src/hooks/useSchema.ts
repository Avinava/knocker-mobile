import { useQuery } from '@tanstack/react-query';
import { schemaApi } from '@/services/api/schema';

/**
 * Get all picklist value sets
 */
export function useValueSets() {
  return useQuery({
    queryKey: ['schema', 'valueSets'],
    queryFn: () => schemaApi.getValueSets(),
    staleTime: 60 * 60 * 1000, // 1 hour - rarely changes
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
  });
}

/**
 * Get a specific value set by name
 */
export function useValueSet(name: string | null) {
  return useQuery({
    queryKey: ['schema', 'valueSet', name],
    queryFn: () => schemaApi.getValueSet(name!),
    enabled: !!name,
    staleTime: 60 * 60 * 1000,
  });
}

/**
 * Get Task field definitions (for door knock form)
 * This includes picklist values for roof type, siding, solar, etc.
 */
export function useTaskFieldDefinitions() {
  return useQuery({
    queryKey: ['schema', 'taskFields'],
    queryFn: () => schemaApi.getTaskFieldDefinitions(),
    staleTime: 60 * 60 * 1000, // 1 hour - rarely changes
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
  });
}

/**
 * Get field definitions for a specific object
 */
export function useFieldDefinitions(objectName: string, fields?: string[]) {
  return useQuery({
    queryKey: ['schema', 'fields', objectName, fields],
    queryFn: () => schemaApi.getFieldDefinitions(objectName, fields),
    enabled: !!objectName,
    staleTime: 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
  });
}
