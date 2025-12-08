import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePropertyDetails } from '@/hooks/useProperties';
import { useMapStore } from '@/stores/mapStore';
import { Property } from '@/models/types';
import { formatDate, getRelativeTime } from '@/utils/dateUtils';

interface PropertyDetailsDrawerProps {
  property: Property;
  onClose: () => void;
  onKnockDoor: () => void;
  onCreateLead: () => void;
}

export function PropertyDetailsDrawer({ 
  property, 
  onClose,
  onKnockDoor,
  onCreateLead,
}: PropertyDetailsDrawerProps) {
  const { data: details, isLoading } = usePropertyDetails(property.Id);

  if (isLoading) {
    return (
      <View className="bg-white h-1/2 rounded-t-3xl p-6">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      </View>
    );
  }

  const fullProperty = details?.property || property;
  const events = details?.events || [];
  const leads = details?.leads || [];
  const recentEvent = events[0];
  
  // Format address
  const address = [
    fullProperty.Street__c,
    fullProperty.City__c,
    fullProperty.State__c,
  ].filter(Boolean).join(', ');

  return (
    <View className="bg-white h-2/3 rounded-t-3xl shadow-2xl">
      {/* Header */}
      <View className="flex-row justify-between items-center px-6 pt-4 pb-2 border-b border-gray-200">
        <Text className="text-xl font-bold text-gray-900 flex-1" numberOfLines={2}>
          {address}
        </Text>
        <TouchableOpacity onPress={onClose} className="ml-2">
          <Ionicons name="close" size={28} color="#6b7280" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Property Info */}
        <View className="px-6 py-4 border-b border-gray-200">
          <View className="flex-row items-center mb-2">
            <Ionicons name="location" size={16} color="#6b7280" />
            <Text className="text-sm text-gray-600 ml-2">
              {fullProperty.City__c}, {fullProperty.State__c} {fullProperty.Postal_Code__c}
            </Text>
          </View>
          
          {fullProperty.Owner_1_Name_Full__c && (
            <View className="flex-row items-center mb-2">
              <Ionicons name="person" size={16} color="#6b7280" />
              <Text className="text-sm text-gray-600 ml-2">
                Owner: {fullProperty.Owner_1_Name_Full__c}
              </Text>
            </View>
          )}

          {fullProperty.Year_Built_Primary_Structure__c && (
            <View className="flex-row items-center">
              <Ionicons name="home" size={16} color="#6b7280" />
              <Text className="text-sm text-gray-600 ml-2">
                Built: {fullProperty.Year_Built_Primary_Structure__c}
              </Text>
            </View>
          )}
        </View>

        {/* Recent Activity */}
        {recentEvent && (
          <View className="px-6 py-4 border-b border-gray-200">
            <Text className="text-lg font-semibold text-gray-900 mb-2">
              Recent Activity
            </Text>
            <View className="bg-gray-50 p-3 rounded-lg">
              <Text className="text-sm font-medium text-gray-900">
                {recentEvent.Subject}
              </Text>
              <Text className="text-xs text-gray-500 mt-1">
                {getRelativeTime(recentEvent.CreatedDate)}
              </Text>
              {recentEvent.Description && (
                <Text className="text-sm text-gray-600 mt-2">
                  {recentEvent.Description}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Property Details */}
        <View className="px-6 py-4 border-b border-gray-200">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Property Details
          </Text>
          
          {fullProperty.Existing_Roof_Type__c && (
            <DetailRow 
              label="Roof Type" 
              value={fullProperty.Existing_Roof_Type__c} 
            />
          )}
          
          {fullProperty.Existing_Siding__c && (
            <DetailRow 
              label="Siding" 
              value={fullProperty.Existing_Siding__c} 
            />
          )}
          
          {fullProperty.Has_Solar_On_Roof__c && (
            <DetailRow 
              label="Solar" 
              value={fullProperty.Has_Solar_On_Roof__c} 
            />
          )}
        </View>

        {/* Events History */}
        {events.length > 1 && (
          <View className="px-6 py-4 border-b border-gray-200">
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              Event History ({events.length})
            </Text>
            {events.slice(1, 4).map((event) => (
              <View key={event.Id} className="mb-3 pb-3 border-b border-gray-100">
                <Text className="text-sm text-gray-700">{event.Subject}</Text>
                <Text className="text-xs text-gray-500 mt-1">
                  {formatDate(event.CreatedDate)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Leads */}
        {leads.length > 0 && (
          <View className="px-6 py-4">
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              Leads ({leads.length})
            </Text>
            {leads.slice(0, 3).map((lead) => (
              <View key={lead.Id} className="mb-3 pb-3 border-b border-gray-100">
                <Text className="text-sm font-medium text-gray-900">
                  {lead.FirstName} {lead.LastName}
                </Text>
                <Text className="text-xs text-gray-500 mt-1">
                  Status: {lead.Status}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <TouchableOpacity
          className="bg-blue-600 rounded-lg py-4 mb-3 items-center"
          onPress={onKnockDoor}
        >
          <Text className="text-white text-base font-semibold">Knock Door</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          className="bg-white border border-blue-600 rounded-lg py-4 items-center"
          onPress={onCreateLead}
        >
          <Text className="text-blue-600 text-base font-semibold">Create Lead</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between mb-2">
      <Text className="text-sm text-gray-600">{label}:</Text>
      <Text className="text-sm text-gray-900 font-medium">{value}</Text>
    </View>
  );
}
