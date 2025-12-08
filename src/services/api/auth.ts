import apiClient from './client';
import { API_ENDPOINTS } from '@/config/api';
import { LoginCredentials, AuthResponse, User } from '@/models/types';

export const authApi = {
  /**
   * Login with username and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>(API_ENDPOINTS.LOGIN, credentials);
  },

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    return apiClient.post(API_ENDPOINTS.LOGOUT);
  },

  /**
   * Refresh auth token
   */
  async refreshToken(refreshToken: string): Promise<{ token: string }> {
    return apiClient.post(API_ENDPOINTS.REFRESH_TOKEN, { refreshToken });
  },

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    return apiClient.get<User>('/auth/me');
  },
};
