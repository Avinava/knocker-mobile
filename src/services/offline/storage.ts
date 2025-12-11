import AsyncStorage from '@react-native-async-storage/async-storage';

class StorageService {
    private static instance: StorageService;

    private constructor() { }

    static getInstance(): StorageService {
        if (!StorageService.instance) {
            StorageService.instance = new StorageService();
        }
        return StorageService.instance;
    }

    // Auth Tokens
    async getAuthToken(): Promise<string | null> {
        return AsyncStorage.getItem('auth_token');
    }

    async setAuthToken(token: string): Promise<void> {
        await AsyncStorage.setItem('auth_token', token);
    }

    async removeAuthToken(): Promise<void> {
        await AsyncStorage.removeItem('auth_token');
    }

    // Settings
    async getSettings<T>(key: string): Promise<T | null> {
        const data = await AsyncStorage.getItem(`settings_${key}`);
        return data ? JSON.parse(data) : null;
    }

    async setSettings<T>(key: string, value: T): Promise<void> {
        await AsyncStorage.setItem(`settings_${key}`, JSON.stringify(value));
    }

    // Cache/State
    async getItem(key: string): Promise<string | null> {
        return AsyncStorage.getItem(key);
    }

    async setItem(key: string, value: string): Promise<void> {
        await AsyncStorage.setItem(key, value);
    }

    async removeItem(key: string): Promise<void> {
        await AsyncStorage.removeItem(key);
    }
}

export const storageService = StorageService.getInstance();
