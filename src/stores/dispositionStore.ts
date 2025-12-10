import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import { DispositionType, DISPOSITION_TYPES } from '@/utils/constants';

interface DispositionState {
  // Current selected disposition type
  selectedDisposition: DispositionType;

  // Actions
  setDisposition: (disposition: DispositionType) => void;

  // Helper to get the next disposition (for cycling)
  cycleDisposition: () => void;
}

// Custom storage adapter for SecureStore
const secureStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return await SecureStore.getItemAsync(name);
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await SecureStore.setItemAsync(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await SecureStore.deleteItemAsync(name);
  },
};

export const useDispositionStore = create<DispositionState>()(
  persist(
    (set, get) => ({
      selectedDisposition: 'Insurance Restoration',

      setDisposition: (disposition) => {
        set({ selectedDisposition: disposition });
      },

      cycleDisposition: () => {
        const { selectedDisposition } = get();
        const currentIndex = DISPOSITION_TYPES.indexOf(selectedDisposition);
        const nextIndex = (currentIndex + 1) % DISPOSITION_TYPES.length;
        set({ selectedDisposition: DISPOSITION_TYPES[nextIndex] });
      },
    }),
    {
      name: 'disposition-storage',
      storage: createJSONStorage(() => secureStorage),
    }
  )
);
