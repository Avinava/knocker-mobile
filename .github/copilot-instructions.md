# Knocker Mobile - Copilot Development Guide

This file guides AI assistants (GitHub Copilot, Cursor, etc.) on how to work effectively in this React Native Expo mobile application.

---

## Project Context

**Knocker Mobile** is a standalone React Native Expo app for door-to-door canvassing and lead capture. It's extracted from the Knocker web application, focusing exclusively on the **map/canvassing module**.

### Core Documentation
Always read these files for context:
1. **README.md** - Project structure, tech stack, architecture decisions
2. **plan.md** - Complete implementation plan with phases and tasks

### Related Project (Source Reference)
The original Knocker web app at `/Users/avi/Workspace/gitlab/knocker` contains:
- **Map component patterns**: `src/client/components/map/Map.jsx`
- **Knock door flow**: `src/client/components/knock/KnockDoorModal.jsx`
- **Property model**: `src/client/models/PropertyMarker.js`
- **API services**: `src/client/services/api/`
- **Backend routes**: `src/server/routes/v1/data/`

Use these as reference for business logic and API contracts, but implement with React Native patterns.

---

## Tech Stack Summary

| Category | Technology | Notes |
|----------|------------|-------|
| Framework | React Native + Expo SDK 51 | Use Expo APIs where available |
| Routing | Expo Router v3 | File-based routing in `app/` |
| Maps | @rnmapbox/maps | Native Mapbox implementation |
| State | Zustand | Prefer over Context for global state |
| Data Fetching | TanStack Query v5 | For server state management |
| Forms | React Hook Form + Zod | Type-safe form validation |
| Styling | NativeWind v4 | Tailwind CSS for React Native |
| Offline DB | expo-sqlite | For structured offline data |
| Key-Value | react-native-mmkv | For fast settings/cache |
| Auth Storage | expo-secure-store | For sensitive credentials |

---

## Coding Standards

### TypeScript
- All new files should be TypeScript (`.tsx`, `.ts`)
- Define explicit types for props, state, and API responses
- Use Zod schemas for runtime validation

```typescript
// ✅ Good
interface PropertyMarkerProps {
  property: Property;
  onPress: (property: Property) => void;
  isSelected?: boolean;
}

// ❌ Avoid
const PropertyMarker = ({ property, onPress, isSelected }: any) => { ... }
```

### Component Patterns
- Use functional components with hooks
- Prefer composition over inheritance
- Keep components focused and small
- Extract business logic into custom hooks

```typescript
// ✅ Good - Logic in hook, component is presentation
function MapView() {
  const { properties, isLoading, refetch } = useProperties();
  const { viewState, setViewState } = useMapStore();
  
  return (
    <Map viewState={viewState} onMoveEnd={setViewState}>
      {properties.map(p => <PropertyMarker key={p.id} property={p} />)}
    </Map>
  );
}

// ❌ Avoid - All logic in component
function MapView() {
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  // ... 100 lines of data fetching logic
}
```

### File Naming
- Components: `PascalCase.tsx` (e.g., `PropertyMarker.tsx`)
- Hooks: `camelCase.ts` with `use` prefix (e.g., `useProperties.ts`)
- Stores: `camelCase.ts` with `Store` suffix (e.g., `mapStore.ts`)
- Services: `camelCase.ts` (e.g., `properties.ts`)
- Types: `PascalCase.ts` or in `types.ts`

### Styling with NativeWind
```typescript
// ✅ Use NativeWind classes
<View className="flex-1 bg-white p-4">
  <Text className="text-lg font-semibold text-gray-900">Title</Text>
</View>

// ❌ Avoid inline StyleSheet when NativeWind works
<View style={styles.container}>
  <Text style={styles.title}>Title</Text>
</View>
```

---

## State Management Patterns

### Zustand Stores
```typescript
// src/stores/mapStore.ts
import { create } from 'zustand';

interface MapState {
  viewState: ViewState;
  selectedMarker: Property | null;
  clusteringEnabled: boolean;
  
  // Actions
  setViewState: (state: ViewState) => void;
  selectMarker: (property: Property | null) => void;
  toggleClustering: () => void;
}

export const useMapStore = create<MapState>((set) => ({
  viewState: INITIAL_VIEW_STATE,
  selectedMarker: null,
  clusteringEnabled: true,
  
  setViewState: (viewState) => set({ viewState }),
  selectMarker: (selectedMarker) => set({ selectedMarker }),
  toggleClustering: () => set((state) => ({ 
    clusteringEnabled: !state.clusteringEnabled 
  })),
}));
```

### TanStack Query for API Data
```typescript
// src/hooks/useProperties.ts
import { useQuery } from '@tanstack/react-query';
import { propertiesApi } from '@/services/api/properties';

export function usePropertiesInBounds(bounds: Bounds | null) {
  return useQuery({
    queryKey: ['properties', 'bounds', bounds],
    queryFn: () => propertiesApi.getWithinBounds(bounds!),
    enabled: !!bounds,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

---

## Offline-First Patterns

### Creating Offline-Compatible Operations
```typescript
// Example: Creating a door knock event
async function createKnockEvent(data: CreateEventRequest): Promise<Event> {
  const localId = uuid();
  const event: PendingEvent = {
    ...data,
    localId,
    status: 'pending',
    createdAt: Date.now(),
  };
  
  // 1. Save locally first
  await database.saveEvent(event);
  
  // 2. Queue for sync
  await database.queueAction({
    entityType: 'event',
    entityId: localId,
    action: 'create',
    payload: data,
  });
  
  // 3. Try to sync immediately if online
  if (isOnline) {
    syncService.processQueue();
  }
  
  return event;
}
```

### Sync Queue Processing
```typescript
async function processQueue(): Promise<void> {
  const actions = await database.getQueuedActions();
  
  for (const action of actions) {
    try {
      await processAction(action);
      await database.removeFromQueue(action.id);
    } catch (error) {
      action.attempts++;
      action.lastAttempt = Date.now();
      
      if (action.attempts >= MAX_RETRIES) {
        await database.markActionFailed(action.id);
      }
    }
  }
}
```

---

## Map Implementation Guide

### Mapbox Setup
```typescript
// src/components/map/MapView.tsx
import Mapbox from '@rnmapbox/maps';

Mapbox.setAccessToken(MAPBOX_TOKEN);

export function MapView() {
  const mapRef = useRef<Mapbox.MapView>(null);
  const { viewState, setViewState } = useMapStore();
  
  return (
    <Mapbox.MapView
      ref={mapRef}
      style={{ flex: 1 }}
      styleURL={Mapbox.StyleURL.Street}
      onRegionDidChange={(feature) => {
        const { geometry, properties } = feature;
        setViewState({
          longitude: geometry.coordinates[0],
          latitude: geometry.coordinates[1],
          zoom: properties.zoomLevel,
        });
      }}
    >
      <Mapbox.Camera
        centerCoordinate={[viewState.longitude, viewState.latitude]}
        zoomLevel={viewState.zoom}
      />
      <PropertyMarkers />
    </Mapbox.MapView>
  );
}
```

### Marker Clustering with GeoJSON
```typescript
// Convert properties to GeoJSON for clustering
function propertiesToGeoJSON(properties: Property[]): FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: properties.map(p => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [p.longitude, p.latitude],
      },
      properties: {
        id: p.id,
        icon: p.getMarkerIcon(),
        color: p.getMarkerColor(),
      },
    })),
  };
}
```

---

## API Integration

### Base API Client Pattern
```typescript
// src/services/api/client.ts
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle token refresh or logout
      await handleAuthError();
    }
    throw error;
  }
);
```

### API Endpoints (from Knocker Backend)
Key endpoints the mobile app needs:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/auth/login` | POST | User authentication |
| `/api/v1/data/properties/within-bounds` | GET | Properties in map viewport |
| `/api/v1/data/properties/search` | GET | Search by address/owner |
| `/api/v1/data/properties/:id` | GET | Property details with related records |
| `/api/v1/data/events` | POST | Create door knock event |
| `/api/v1/data/leads` | POST | Create new lead |
| `/api/v1/data/leads/:id` | PUT | Update lead |
| `/api/v1/data/schema/value-sets` | GET | Picklist values |

---

## Business Logic Reference

### Disposition Types and Values
From the Knocker web app, dispositions determine marker appearance and knock status options:

```typescript
type DispositionType = 
  | 'Insurance Restoration'
  | 'Solar Replacement'
  | 'Community Solar';

// Value sets (picklists) by disposition:
const DISPOSITION_VALUE_SETS = {
  'Insurance Restoration': 'Storm_Inspection_Knock_Status',
  'Solar Replacement': 'Solar_Knock_Status',
  'Community Solar': 'Community_Solar_Knock_Status',
};
```

### Property Marker Logic
Reference: `knocker/src/client/models/PropertyMarker.js`

```typescript
class PropertyMarker {
  getMarkerIcon(dispositionType: DispositionType, status: string): string {
    // Return icon name based on disposition status
  }
  
  getMarkerColor(dispositionType: DispositionType, status: string): string {
    // Return color hex based on disposition status
  }
  
  getMostRecentEvent(dispositionType: DispositionType): Event | null {
    // Filter and sort events by disposition type
  }
}
```

### Knock Event Data Structure
```typescript
interface CreateEventRequest {
  Subject: string;  // "Door Knock: {DispositionType}"
  Description: string;
  Type: 'Door Knock';
  WhatId: string;  // Property ID
  Disposition_Type__c: DispositionType;
  Disposition_Status__c: string;
  Existing_Roof_Type__c: string;
  Existing_Siding__c: string;
  Solar_On_Property__c: string;
  Event_Location__Latitude__s: number;
  Event_Location__Longitude__s: number;
}
```

---

## Development Workflow

### Running the App
```bash
# Start Expo dev server
npm start

# iOS Simulator
npm run ios

# Android Emulator
npm run android

# Create development build (required for native modules like Mapbox)
npx expo prebuild
npx expo run:ios  # or run:android
```

### Testing
```bash
# Run tests
npm test

# Lint
npm run lint
```

### Building for Production
```bash
# EAS Build
eas build --platform ios --profile production
eas build --platform android --profile production
```

---

## Common Tasks

### Adding a New Screen
1. Create file in `app/` following Expo Router conventions
2. Add to navigation if needed
3. Create components in `src/components/`
4. Add API service if fetching data
5. Add to store if managing state

### Adding a New API Endpoint
1. Add method to appropriate service in `src/services/api/`
2. Create TanStack Query hook in `src/hooks/`
3. Add offline support in `src/services/offline/`
4. Add to sync queue for mutations

### Adding Offline Support for Entity
1. Add table schema in `src/services/offline/schema.sql`
2. Add CRUD methods in `database.ts`
3. Add sync logic in `sync.ts`
4. Update components to use local-first pattern

---

## Error Handling

### API Errors
```typescript
try {
  await api.createEvent(data);
} catch (error) {
  if (error instanceof NetworkError) {
    // Queue for offline sync
    await queueOfflineAction(data);
    showToast('Saved offline. Will sync when connected.');
  } else if (error instanceof ValidationError) {
    // Show validation errors
    setErrors(error.details);
  } else {
    // Generic error handling
    showToast('Something went wrong. Please try again.');
    logError(error);
  }
}
```

---

## Tips for AI Assistants

1. **Check existing patterns first** - Look at similar components/services before creating new ones
2. **Use the tech stack** - Prefer Zustand, TanStack Query, NativeWind as documented
3. **Offline-first** - Consider offline scenarios for all data operations
4. **TypeScript** - Always provide proper types, avoid `any`
5. **Reference Knocker web** - Use `/Users/avi/Workspace/gitlab/knocker` for business logic reference
6. **Small, focused changes** - Make incremental changes, test frequently
7. **Follow the plan** - Check `plan.md` for current phase and tasks
