import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateEvent } from '@/hooks/useEvents';
import { useValueSets } from '@/hooks/useSchema';
import { useMapStore } from '@/stores/mapStore';
import { useCurrentLocation } from '@/hooks/useCurrentLocation';
import { DispositionType, CreateEventRequest } from '@/models/types';
import { DISPOSITION_TYPES } from '@/utils/constants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const knockDoorSchema = z.object({
  dispositionType: z.enum(['Insurance Restoration', 'Solar Replacement', 'Community Solar']),
  dispositionStatus: z.string().min(1, 'Status is required'),
  roofType: z.string().optional(),
  siding: z.string().optional(),
  solar: z.string().optional(),
  notes: z.string().optional(),
});

type KnockDoorFormData = z.infer<typeof knockDoorSchema>;

export function KnockDoorSheet() {
  const insets = useSafeAreaInsets();
  const { selectedProperty, isKnockModalOpen, closeKnockModal } = useMapStore();
  const { mutate: createEvent, isPending } = useCreateEvent();
  const { data: valueSets } = useValueSets();
  const { getCurrentPosition, location: deviceLocation, loading: locationLoading } = useCurrentLocation();

  const [selectedDisposition, setSelectedDisposition] = useState<DispositionType>('Insurance Restoration');

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<KnockDoorFormData>({
    resolver: zodResolver(knockDoorSchema),
    defaultValues: {
      dispositionType: 'Insurance Restoration',
      dispositionStatus: '',
      roofType: '',
      siding: '',
      solar: '',
      notes: '',
    },
  });

  // Pre-populate form when property changes
  useEffect(() => {
    if (selectedProperty) {
      // Auto-fill existing data
      setValue('roofType', selectedProperty.Existing_Roof_Type__c || '');
      setValue('siding', selectedProperty.Existing_Siding__c || '');

      // Handle Solar mapping
      let solarValue = '';
      if (selectedProperty.Has_Solar_On_Roof__c === true || selectedProperty.Has_Solar_On_Roof__c === 'true') {
        solarValue = 'Yes';
      } else if (selectedProperty.Has_Solar_On_Roof__c === false || selectedProperty.Has_Solar_On_Roof__c === 'false') {
        solarValue = 'No';
      } else {
        solarValue = (selectedProperty.Has_Solar_On_Roof__c as string) || '';
      }
      setValue('solar', solarValue);
    }
  }, [selectedProperty, setValue]);

  // Capture location when modal opens
  useEffect(() => {
    if (isKnockModalOpen) {
      getCurrentPosition();
    }
  }, [isKnockModalOpen, getCurrentPosition]);

  const handleClose = () => {
    reset();
    closeKnockModal();
  };

  const onSubmit = async (data: KnockDoorFormData) => {
    if (!selectedProperty) return;

    // Use device location if available, otherwise fall back to property location
    const latitude = deviceLocation?.latitude || selectedProperty.Geolocation__c?.latitude || selectedProperty.Latitude__c;
    const longitude = deviceLocation?.longitude || selectedProperty.Geolocation__c?.longitude || selectedProperty.Longitude__c;

    const eventData: CreateEventRequest = {
      Subject: `Door Knock: ${data.dispositionType}`,
      Description: data.notes,
      Type: 'Door Knock',
      WhatId: selectedProperty.Id,
      Disposition_Type__c: data.dispositionType,
      Disposition_Status__c: data.dispositionStatus,
      Existing_Roof_Type__c: data.roofType,
      Existing_Siding__c: data.siding,
      Solar_On_Property__c: data.solar,
      Event_Location__Latitude__s: latitude,
      Event_Location__Longitude__s: longitude,
    };

    createEvent(eventData, {
      onSuccess: () => {
        // Alert.alert('Success', 'Door knock recorded successfully');
        handleClose();
      },
      onError: (error: any) => {
        Alert.alert('Error', error.message || 'Failed to record door knock');
      },
    });
  };

  // Get status options based on selected disposition type
  const getStatusOptions = () => {
    if (!valueSets) return [];

    const valueSetName = selectedDisposition === 'Insurance Restoration'
      ? 'Storm_Inspection_Knock_Status'
      : selectedDisposition === 'Solar Replacement'
        ? 'Solar_Knock_Status'
        : 'Community_Solar_Knock_Status';

    return valueSets[valueSetName]?.values || [];
  };

  if (!selectedProperty) return null;

  return (
    <Modal
      visible={isKnockModalOpen}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { height: SCREEN_HEIGHT * 0.90 }]}>
          {/* Handle Bar */}
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Knock Door</Text>
              <Text style={styles.headerSubtitle} numberOfLines={1}>
                {selectedProperty.Street__c || 'Unknown Address'}
              </Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close-circle" size={30} color="#E5E7EB" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Location Status */}
            {locationLoading && (
              <View style={styles.locationLoading}>
                <ActivityIndicator size="small" color="#3b82f6" />
                <Text style={styles.locationText}>Acquiring location...</Text>
              </View>
            )}

            {/* Disposition Type */}
            <View style={styles.section}>
              <Text style={styles.label}>
                Disposition Type <Text style={styles.required}>*</Text>
              </Text>
              <Controller
                control={control}
                name="dispositionType"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.chipContainer}>
                    {DISPOSITION_TYPES.map((type) => (
                      <TouchableOpacity
                        key={type}
                        style={[
                          styles.chip,
                          value === type && styles.chipSelected
                        ]}
                        onPress={() => {
                          onChange(type);
                          setSelectedDisposition(type as DispositionType);
                        }}
                      >
                        <Text style={[
                          styles.chipText,
                          value === type && styles.chipTextSelected
                        ]}>
                          {type}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              />
            </View>

            {/* Disposition Status */}
            <View style={styles.section}>
              <Text style={styles.label}>
                Status <Text style={styles.required}>*</Text>
              </Text>
              <Controller
                control={control}
                name="dispositionStatus"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.statusList}>
                    {getStatusOptions().map((option, index) => {
                      const isSelected = value === option.value;
                      return (
                        <TouchableOpacity
                          key={option.value}
                          style={[
                            styles.statusItem,
                            index < getStatusOptions().length - 1 && styles.statusItemBorder,
                            isSelected && styles.statusItemSelected
                          ]}
                          onPress={() => onChange(option.value)}
                        >
                          <Text style={[
                            styles.statusText,
                            isSelected && styles.statusTextSelected
                          ]}>
                            {option.label}
                          </Text>
                          {isSelected && (
                            <Ionicons name="checkmark-circle" size={24} color="#3b82f6" />
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              />
              {errors.dispositionStatus && (
                <Text style={styles.errorText}>
                  {errors.dispositionStatus.message}
                </Text>
              )}
            </View>

            {/* Property Details Grid */}
            <View style={styles.gridSection}>
              <View style={styles.gridRow}>
                {/* Roof Type */}
                <View style={styles.gridItem}>
                  <Text style={styles.label}>Roof Type</Text>
                  <Controller
                    control={control}
                    name="roofType"
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        style={styles.input}
                        placeholder="e.g. Asphalt"
                        value={value}
                        onChangeText={onChange}
                      />
                    )}
                  />
                </View>

                {/* Siding */}
                <View style={[styles.gridItem, { marginLeft: 12 }]}>
                  <Text style={styles.label}>Siding</Text>
                  <Controller
                    control={control}
                    name="siding"
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        style={styles.input}
                        placeholder="e.g. Vinyl"
                        value={value}
                        onChangeText={onChange}
                      />
                    )}
                  />
                </View>
              </View>

              {/* Solar */}
              <View style={styles.section}>
                <Text style={styles.label}>Solar on Property</Text>
                <Controller
                  control={control}
                  name="solar"
                  render={({ field: { onChange, value } }) => (
                    <View style={styles.segmentContainer}>
                      {['Yes', 'No', 'Unknown'].map((option) => (
                        <TouchableOpacity
                          key={option}
                          style={[
                            styles.segmentButton,
                            value === option && styles.segmentButtonSelected
                          ]}
                          onPress={() => onChange(option)}
                        >
                          <Text style={[
                            styles.segmentText,
                            value === option && styles.segmentTextSelected
                          ]}>
                            {option}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                />
              </View>
            </View>

            {/* Notes */}
            <View style={styles.section}>
              <Text style={styles.label}>Notes</Text>
              <Controller
                control={control}
                name="notes"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Add comments..."
                    value={value}
                    onChangeText={onChange}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                )}
              />
            </View>

            {/* Bottom Padding for scroll */}
            <View style={{ height: 40 }} />
          </ScrollView>

          {/* Footer / Submit Button */}
          <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
            <TouchableOpacity
              style={[
                styles.submitButton,
                isPending && styles.submitButtonDisabled
              ]}
              onPress={handleSubmit(onSubmit)}
              disabled={isPending}
            >
              {isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Ionicons name="location-sharp" size={20} color="white" />
                  <Text style={styles.submitButtonText}>Submit Knock</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  section: {
    marginBottom: 24,
  },
  gridSection: {
    marginBottom: 24,
  },
  gridRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  gridItem: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  required: {
    color: '#EF4444',
  },
  locationLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#EFF6FF',
    padding: 8,
    borderRadius: 8,
  },
  locationText: {
    marginLeft: 8,
    fontSize: 13,
    color: '#3B82F6',
    fontWeight: '500',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chipSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  chipText: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#2563EB',
  },
  statusList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  statusItemSelected: {
    backgroundColor: '#F9FAFB',
  },
  statusItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  statusText: {
    fontSize: 16,
    color: '#111827',
  },
  statusTextSelected: {
    fontWeight: '600',
    color: '#3B82F6',
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#111827',
  },
  textArea: {
    minHeight: 100,
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  segmentButtonSelected: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  segmentTextSelected: {
    color: '#111827',
    fontWeight: '600',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    marginTop: 4,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#fff',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
});
