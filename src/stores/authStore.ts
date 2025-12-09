import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '@/services/api/auth';
import { User, LoginCredentials } from '@/models/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.login(credentials);

      // Store token securely if present
      const token = response.token;
      if (token) {
        await SecureStore.setItemAsync('authToken', token);
      }

      // Store user in AsyncStorage
      await AsyncStorage.setItem('user', JSON.stringify(response.user));

      set({
        user: response.user,
        token: token || null,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      set({
        error: errorMessage,
        isLoading: false,
        isAuthenticated: false,
      });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear all auth data
      await SecureStore.deleteItemAsync('authToken');
      await SecureStore.deleteItemAsync('refreshToken');
      await AsyncStorage.removeItem('user');

      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  restoreSession: async () => {
    set({ isLoading: true });
    try {
      const token = await SecureStore.getItemAsync('authToken');
      const userJson = await AsyncStorage.getItem('user');

      console.log('Restoring session:', { hasToken: !!token, hasUser: !!userJson });

      // Restore session if we have user data (token is optional for cookie-based auth)
      if (userJson) {
        const user = JSON.parse(userJson);
        set({
          user,
          token: token || null,
          isAuthenticated: true,
          isLoading: false,
        });
        console.log('Session restored successfully for user:', user.email || user.username);
      } else {
        console.log('No saved session found');
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Session restore error:', error);
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
