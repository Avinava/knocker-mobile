import { create } from 'zustand';
import { Bounds, Property } from '@/models/types';
import { INITIAL_VIEW_STATE } from '@/config/mapbox';

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
  isKnockSheetOpen: boolean;
  clusteringEnabled: boolean;

  // Map settings
  currentStyle: 'streets' | 'satellite' | 'hybrid' | 'outdoors';
  showUserLocation: boolean;

  // Actions
  setViewState: (state: ViewState) => void;
  setBounds: (bounds: Bounds) => void;
  selectProperty: (property: Property | null) => void;
  hoverProperty: (property: Property | null) => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  openKnockSheet: () => void;
  closeKnockSheet: () => void;
  toggleClustering: () => void;
  setMapStyle: (style: 'streets' | 'satellite' | 'hybrid' | 'outdoors') => void;
  toggleUserLocation: () => void;
  reset: () => void;
}


export const useMapStore = create<MapState>((set) => ({
  // Initial state
  viewState: INITIAL_VIEW_STATE,
  bounds: null,
  selectedProperty: null,
  hoveredProperty: null,
  isDrawerOpen: false,
  isKnockSheetOpen: false,
  clusteringEnabled: true,
  currentStyle: 'streets',
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
    // selectedProperty: null, // Don't clear property when just closing drawer UI
  }),

  openKnockSheet: () => set({ isKnockSheetOpen: true }),

  closeKnockSheet: () => set({ isKnockSheetOpen: false }),

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
    isKnockSheetOpen: false,
  }),
}));
