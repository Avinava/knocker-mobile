import { create } from 'zustand';
import { Bounds, Property } from '@/models/types';

interface ViewState {
  latitude: number;
  longitude: number;
  zoom: number;
  pitch: number;
  heading: number;
}

interface MapState {
  // View state
  viewState: ViewState;
  bounds: Bounds | null;
  
  // Selected/active items
  selectedProperty: Property | null;
  hoveredProperty: Property | null;
  
  // UI state
  isDrawerOpen: boolean;
  isKnockModalOpen: boolean;
  clusteringEnabled: boolean;
  
  // Map settings
  currentStyle: 'street' | 'satellite' | 'outdoors';
  showUserLocation: boolean;
  
  // Actions
  setViewState: (state: ViewState) => void;
  setBounds: (bounds: Bounds) => void;
  selectProperty: (property: Property | null) => void;
  hoverProperty: (property: Property | null) => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  openKnockModal: () => void;
  closeKnockModal: () => void;
  toggleClustering: () => void;
  setMapStyle: (style: 'street' | 'satellite' | 'outdoors') => void;
  toggleUserLocation: () => void;
  reset: () => void;
}

const INITIAL_VIEW_STATE: ViewState = {
  latitude: 40.7128, // NYC default
  longitude: -74.0060,
  zoom: 14,
  pitch: 0,
  heading: 0,
};

export const useMapStore = create<MapState>((set) => ({
  // Initial state
  viewState: INITIAL_VIEW_STATE,
  bounds: null,
  selectedProperty: null,
  hoveredProperty: null,
  isDrawerOpen: false,
  isKnockModalOpen: false,
  clusteringEnabled: true,
  currentStyle: 'street',
  showUserLocation: true,

  // Actions
  setViewState: (viewState) => set({ viewState }),
  
  setBounds: (bounds) => set({ bounds }),
  
  selectProperty: (property) => set({ 
    selectedProperty: property,
    isDrawerOpen: !!property,
  }),
  
  hoverProperty: (property) => set({ hoveredProperty: property }),
  
  openDrawer: () => set({ isDrawerOpen: true }),
  
  closeDrawer: () => set({ 
    isDrawerOpen: false,
    selectedProperty: null,
  }),
  
  openKnockModal: () => set({ isKnockModalOpen: true }),
  
  closeKnockModal: () => set({ isKnockModalOpen: false }),
  
  toggleClustering: () => set((state) => ({ 
    clusteringEnabled: !state.clusteringEnabled 
  })),
  
  setMapStyle: (style) => set({ currentStyle: style }),
  
  toggleUserLocation: () => set((state) => ({ 
    showUserLocation: !state.showUserLocation 
  })),
  
  reset: () => set({
    viewState: INITIAL_VIEW_STATE,
    bounds: null,
    selectedProperty: null,
    hoveredProperty: null,
    isDrawerOpen: false,
    isKnockModalOpen: false,
  }),
}));
