import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateEvent } from '@/hooks/useEvents';
import { useValueSets } from '@/hooks/useSchema';
import { useMapStore } from '@/stores/mapStore';
import { DispositionType, CreateEventRequest } from '@/models/types';
import { DISPOSITION_TYPES } from '@/utils/constants';

const knockDoorSchema = z.object({
  dispositionType: z.enum(['Insurance Restoration', 'Solar Replacement', 'Community Solar']),
  dispositionStatus: z.string().min(1, 'Status is required'),
  roofType: z.string().optional(),
  siding: z.string().optional(),
  solar: z.string().optional(),
  notes: z.string().optional(),
});

type KnockDoorFormData = z.infer<typeof knockDoorSchema>;

export function KnockDoorModal() {
  const { selectedProperty, isKnockModalOpen, closeKnockModal } = useMapStore();
  const { mutate: createEvent, isPending } = useCreateEvent();
  const { data: valueSets } = useValueSets();
  const [selectedDisposition, setSelectedDisposition] = useState<DispositionType>('Insurance Restoration');

  const {
    control,
    handleSubmit,
    reset,
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

  const handleClose = () => {
    reset();
    closeKnockModal();
  };

  const onSubmit = async (data: KnockDoorFormData) => {
    if (!selectedProperty) return;

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
      Event_Location__Latitude__s: selectedProperty.Geolocation__c.latitude,
      Event_Location__Longitude__s: selectedProperty.Geolocation__c.longitude,
    };

    createEvent(eventData, {
      onSuccess: () => {
        Alert.alert('Success', 'Door knock recorded successfully');
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
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl max-h-[90%]">
          {/* Header */}
          <View className="flex-row justify-between items-center px-6 pt-6 pb-4 border-b border-gray-200">
            <Text className="text-2xl font-bold text-gray-900">Knock Door</Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={28} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 px-6 py-4" showsVerticalScrollIndicator={false}>
            {/* Property Address */}
            <View className="bg-gray-50 p-4 rounded-lg mb-4">
              <Text className="text-sm text-gray-600 mb-1">Property</Text>
              <Text className="text-base font-semibold text-gray-900">
                {selectedProperty.Street__c || 'Unknown Address'}
              </Text>
            </View>

            {/* Disposition Type */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Disposition Type *
              </Text>
              <Controller
                control={control}
                name="dispositionType"
                render={({ field: { onChange, value } }) => (
                  <View className="flex-row flex-wrap gap-2">
                    {DISPOSITION_TYPES.map((type) => (
                      <TouchableOpacity
                        key={type}
                        className={`px-4 py-2 rounded-lg border ${
                          value === type
                            ? 'bg-blue-600 border-blue-600'
                            : 'bg-white border-gray-300'
                        }`}
                        onPress={() => {
                          onChange(type);
                          setSelectedDisposition(type as DispositionType);
                        }}
                      >
                        <Text
                          className={`text-sm font-medium ${
                            value === type ? 'text-white' : 'text-gray-700'
                          }`}
                        >
                          {type}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              />
            </View>

            {/* Disposition Status */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Status *
              </Text>
              <Controller
                control={control}
                name="dispositionStatus"
                render={({ field: { onChange, value } }) => (
                  <View className="border border-gray-300 rounded-lg">
                    {getStatusOptions().map((option, index) => (
                      <TouchableOpacity
                        key={option.value}
                        className={`p-4 flex-row items-center justify-between ${
                          index < getStatusOptions().length - 1 ? 'border-b border-gray-200' : ''
                        } ${value === option.value ? 'bg-blue-50' : ''}`}
                        onPress={() => onChange(option.value)}
                      >
                        <Text className="text-base text-gray-900">{option.label}</Text>
                        {value === option.value && (
                          <Ionicons name="checkmark-circle" size={24} color="#3b82f6" />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              />
              {errors.dispositionStatus && (
                <Text className="text-red-500 text-sm mt-1">
                  {errors.dispositionStatus.message}
                </Text>
              )}
            </View>

            {/* Roof Type */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Roof Type
              </Text>
              <Controller
                control={control}
                name="roofType"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                    placeholder="e.g., Asphalt Shingle"
                    value={value}
                    onChangeText={onChange}
                  />
                )}
              />
            </View>

            {/* Siding */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Siding
              </Text>
              <Controller
                control={control}
                name="siding"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                    placeholder="e.g., Vinyl"
                    value={value}
                    onChangeText={onChange}
                  />
                )}
              />
            </View>

            {/* Solar */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Solar on Property
              </Text>
              <Controller
                control={control}
                name="solar"
                render={({ field: { onChange, value } }) => (
                  <View className="flex-row gap-2">
                    {['Yes', 'No', 'Unknown'].map((option) => (
                      <TouchableOpacity
                        key={option}
                        className={`flex-1 px-4 py-3 rounded-lg border ${
                          value === option
                            ? 'bg-blue-600 border-blue-600'
                            : 'bg-white border-gray-300'
                        }`}
                        onPress={() => onChange(option)}
                      >
                        <Text
                          className={`text-center text-sm font-medium ${
                            value === option ? 'text-white' : 'text-gray-700'
                          }`}
                        >
                          {option}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              />
            </View>

            {/* Notes */}
            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Notes
              </Text>
              <Controller
                control={control}
                name="notes"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                    placeholder="Add any additional notes..."
                    value={value}
                    onChangeText={onChange}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                )}
              />
            </View>
          </ScrollView>

          {/* Submit Button */}
          <View className="px-6 py-4 border-t border-gray-200">
            <TouchableOpacity
              className={`bg-blue-600 rounded-lg py-4 items-center ${
                isPending ? 'opacity-50' : ''
              }`}
              onPress={handleSubmit(onSubmit)}
              disabled={isPending}
            >
              {isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-base font-semibold">
                  Record Door Knock
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
