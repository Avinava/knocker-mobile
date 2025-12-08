import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/authStore';
import ENV_CONFIG from '@/config/env';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
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
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white pt-16 pb-6 px-6 border-b border-gray-200">
        <Text className="text-3xl font-bold text-gray-900">Settings</Text>
      </View>

      {/* User Info */}
      <View className="bg-white mt-4 px-6 py-4 border-b border-gray-200">
        <Text className="text-sm text-gray-500 mb-1">Logged in as</Text>
        <Text className="text-lg font-semibold text-gray-900">{user?.Name || 'User'}</Text>
        {user?.Email && (
          <Text className="text-sm text-gray-600 mt-1">{user.Email}</Text>
        )}
      </View>

      {/* Settings Options */}
      <View className="bg-white mt-4">
        <TouchableOpacity className="px-6 py-4 border-b border-gray-200 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Ionicons name="notifications-outline" size={24} color="#6b7280" />
            <Text className="text-base text-gray-900 ml-4">Notifications</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity className="px-6 py-4 border-b border-gray-200 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Ionicons name="cloud-offline-outline" size={24} color="#6b7280" />
            <Text className="text-base text-gray-900 ml-4">Offline Data</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity className="px-6 py-4 border-b border-gray-200 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Ionicons name="help-circle-outline" size={24} color="#6b7280" />
            <Text className="text-base text-gray-900 ml-4">Help & Support</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>
      </View>

      {/* App Info */}
      <View className="bg-white mt-4 px-6 py-4">
        <Text className="text-sm text-gray-500 mb-1">Version</Text>
        <Text className="text-base text-gray-900">1.0.0</Text>
        
        {__DEV__ && (
          <>
            <Text className="text-sm text-gray-500 mt-3 mb-1">API URL</Text>
            <Text className="text-xs text-gray-600">{ENV_CONFIG.apiBaseUrl}</Text>
          </>
        )}
      </View>

      {/* Logout Button */}
      <View className="px-6 mt-6 mb-6">
        <TouchableOpacity
          className="bg-red-600 rounded-lg py-4 items-center"
          onPress={handleLogout}
        >
          <Text className="text-white text-base font-semibold">Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
