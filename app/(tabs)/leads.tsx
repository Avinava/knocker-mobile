import React from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMyLeads } from '@/hooks/useLeads';
import { formatDate } from '@/utils/dateUtils';
import { Lead } from '@/models/types';

export default function LeadsScreen() {
  const { data: leads = [], isLoading, refetch, isRefetching } = useMyLeads();

  const renderLead = ({ item: lead }: { item: Lead }) => (
    <TouchableOpacity className="bg-white p-4 mb-2 mx-4 rounded-lg border border-gray-200">
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-900">
            {lead.FirstName} {lead.LastName}
          </Text>
          {lead.Company && (
            <Text className="text-sm text-gray-600 mt-1">{lead.Company}</Text>
          )}
        </View>
        <View
          className={`px-3 py-1 rounded-full ${
            lead.Status === 'New'
              ? 'bg-green-100'
              : lead.Status === 'Contacted'
              ? 'bg-blue-100'
              : 'bg-gray-100'
          }`}
        >
          <Text
            className={`text-xs font-medium ${
              lead.Status === 'New'
                ? 'text-green-800'
                : lead.Status === 'Contacted'
                ? 'text-blue-800'
                : 'text-gray-800'
            }`}
          >
            {lead.Status}
          </Text>
        </View>
      </View>

      {lead.Email && (
        <View className="flex-row items-center mb-1">
          <Ionicons name="mail" size={14} color="#6b7280" />
          <Text className="text-sm text-gray-600 ml-2">{lead.Email}</Text>
        </View>
      )}

      {lead.Phone && (
        <View className="flex-row items-center mb-1">
          <Ionicons name="call" size={14} color="#6b7280" />
          <Text className="text-sm text-gray-600 ml-2">{lead.Phone}</Text>
        </View>
      )}

      <View className="flex-row items-center justify-between mt-2 pt-2 border-t border-gray-100">
        <Text className="text-xs text-gray-500">
          {formatDate(lead.CreatedDate)}
        </Text>
        {lead.Lead_Type__c && (
          <Text className="text-xs text-gray-500">{lead.Lead_Type__c}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white pt-16 pb-4 px-6 border-b border-gray-200">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-3xl font-bold text-gray-900">Leads</Text>
            <Text className="text-sm text-gray-600 mt-1">
              {leads.length} total leads
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => refetch()}
            disabled={isRefetching}
            className="bg-blue-600 px-4 py-2 rounded-lg"
          >
            {isRefetching ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="refresh" size={20} color="white" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {leads.length === 0 ? (
        <View className="flex-1 justify-center items-center px-6">
          <Ionicons name="people-outline" size={64} color="#9ca3af" />
          <Text className="text-xl font-semibold text-gray-900 mt-4">
            No Leads Yet
          </Text>
          <Text className="text-center text-gray-600 mt-2">
            Start knocking doors and capturing leads to see them here
          </Text>
        </View>
      ) : (
        <FlatList
          data={leads}
          renderItem={renderLead}
          keyExtractor={(item) => item.Id}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 16 }}
          refreshing={isRefetching}
          onRefresh={refetch}
        />
      )}
    </View>
  );
}
