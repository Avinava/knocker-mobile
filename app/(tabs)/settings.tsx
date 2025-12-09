import { View, Text, TouchableOpacity, ScrollView, Alert, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/authStore';
import ENV_CONFIG from '@/config/env';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

type SettingsItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
  value?: string;
  isDestructive?: boolean;
  showChevron?: boolean;
};

const SettingsItem = ({ icon, label, onPress, value, isDestructive, showChevron = true }: SettingsItemProps) => (
  <TouchableOpacity
    className="px-4 py-4 flex-row items-center justify-between bg-white active:bg-gray-50"
    onPress={onPress}
    disabled={!onPress}
  >
    <View className="flex-row items-center">
      <View className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${isDestructive ? 'bg-red-100' : 'bg-blue-50'}`}>
        <Ionicons name={icon} size={18} color={isDestructive ? '#DC2626' : '#3B82F6'} />
      </View>
      <Text className={`text-base font-medium ${isDestructive ? 'text-red-600' : 'text-gray-900'}`}>{label}</Text>
    </View>
    <View className="flex-row items-center">
      {value && <Text className="text-gray-500 mr-2 text-sm">{value}</Text>}
      {showChevron && <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />}
    </View>
  </TouchableOpacity>
);

const SectionHeader = ({ title }: { title: string }) => (
  <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 mb-2 mt-6">
    {title}
  </Text>
);

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to exit?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-gray-100">
      <SafeAreaView className="flex-1" edges={['top']}>
        {/* Header */}
        <View className="px-6 py-4 bg-white border-b border-gray-200">
          <Text className="text-3xl font-extrabold text-gray-900">Settings</Text>
        </View>

        <ScrollView className="flex-1">
          {/* Profile Section */}
          <SectionHeader title="Profile" />
          <View className="bg-white border-y border-gray-200">
            <View className="px-4 py-4 flex-row items-center">
              <View className="w-14 h-14 bg-blue-100 rounded-full items-center justify-center mr-4">
                <Text className="text-xl font-bold text-blue-600">
                  {user?.Name?.[0]?.toUpperCase() || 'U'}
                </Text>
              </View>
              <View>
                <Text className="text-lg font-semibold text-gray-900">{user?.Name || 'User'}</Text>
                <Text className="text-sm text-gray-500">{user?.Email || 'No email'}</Text>
              </View>
            </View>
          </View>

          {/* Preferences */}
          <SectionHeader title="Preferences" />
          <View className="bg-white border-y border-gray-200 divide-y divide-gray-100">
            <SettingsItem
              icon="notifications-outline"
              label="Notifications"
              value="On"
              onPress={() => { }}
            />
            <SettingsItem
              icon="cloud-offline-outline"
              label="Offline Data"
              value="Synced"
              onPress={() => { }}
            />
            <SettingsItem
              icon="map-outline"
              label="Map Settings"
              onPress={() => { }}
            />
          </View>

          {/* Support */}
          <SectionHeader title="Support" />
          <View className="bg-white border-y border-gray-200 divide-y divide-gray-100">
            <SettingsItem
              icon="help-circle-outline"
              label="Help Center"
              onPress={() => { }}
            />
            <SettingsItem
              icon="document-text-outline"
              label="Terms of Service"
              onPress={() => { }}
            />
            <SettingsItem
              icon="information-circle-outline"
              label="About"
              value="v1.0.0"
              onPress={() => { }}
            />
          </View>

          {/* Account Actions */}
          <SectionHeader title="Account" />
          <View className="bg-white border-y border-gray-200 mb-10">
            <SettingsItem
              icon="log-out-outline"
              label="Log Out"
              isDestructive
              showChevron={false}
              onPress={handleLogout}
            />
          </View>

          {/* Dev Info */}
          {__DEV__ && (
            <View className="px-6 mb-8">
              <Text className="text-xs text-gray-400 text-center">
                Environment: {ENV_CONFIG.apiBaseUrl}
              </Text>
            </View>
          )}

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
