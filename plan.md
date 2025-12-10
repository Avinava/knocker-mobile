# Knocker Mobile - Implementation Plan

This document outlines the complete executable plan for building the Knocker Mobile canvassing application.

---

## Phase 1: Project Foundation (Week 1)

### 1.1 Project Setup & Configuration

**Objective**: Establish the Expo project structure with all necessary dependencies.

#### Tasks:

- [ ] **1.1.1** Initialize Expo Router with TypeScript
  ```bash
  npx create-expo-app@latest knocker-mobile --template tabs
  ```

- [ ] **1.1.2** Install core dependencies
  ```bash
  npx expo install @rnmapbox/maps expo-location expo-sqlite expo-secure-store expo-network expo-file-system
  npm install zustand @tanstack/react-query react-hook-form zod nativewind axios react-native-mmkv
  npm install react-native-reanimated react-native-gesture-handler
  ```

- [ ] **1.1.3** Configure NativeWind (Tailwind CSS)
  - Create `tailwind.config.js`
  - Update `babel.config.js` with NativeWind preset
  - Create global styles in `app/globals.css`

- [ ] **1.1.4** Configure Mapbox
  - Add Mapbox access token to environment
  - Configure `@rnmapbox/maps` in `app.json`
  - Set up iOS/Android native Mapbox config
  - Test basic map rendering

- [ ] **1.1.5** Set up TypeScript paths
  - Configure `tsconfig.json` with path aliases (`@/components`, `@/services`, etc.)
  - Update `babel.config.js` with module-resolver

**Deliverables**:
- Working Expo development build
- Basic map displaying on screen
- TypeScript compilation passing
- NativeWind styling working

---

### 1.2 Authentication Foundation

**Objective**: Implement secure authentication flow with token persistence.

#### Tasks:

- [ ] **1.2.1** Create auth store with Zustand
  ```typescript
  // src/stores/authStore.ts
  interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => Promise<void>;
    restoreSession: () => Promise<void>;
  }
  ```

- [ ] **1.2.2** Implement secure token storage
  - Use `expo-secure-store` for auth tokens
  - Store user profile in MMKV for fast access
  - Implement token refresh logic

- [ ] **1.2.3** Create API client with auth interceptors
  ```typescript
  // src/services/api/client.ts
  - Axios instance with base URL
  - Request interceptor to attach token
  - Response interceptor for 401 handling
  - Automatic token refresh
  ```

- [ ] **1.2.4** Build login screen
  - Email/username input
  - Password input with show/hide
  - Login button with loading state
  - Error message display
  - Remember me option

- [ ] **1.2.5** Configure Expo Router auth protection
  - Auth layout group `(auth)`
  - Protected routes in `(tabs)`
  - Redirect logic in root layout

**Deliverables**:
- Working login flow
- Persistent authentication
- Protected route navigation
- Logout functionality

---

## Phase 2: Core Map Features (Week 2)

### 2.1 Map Component Implementation

**Objective**: Build the main map view with property markers.

#### Tasks:

- [ ] **2.1.1** Create MapView component
  ```typescript
  // src/components/map/MapView.tsx
  - Mapbox MapView with initial viewport
  - GeolocateControl (hidden, triggered programmatically)
  - Attribution control
  - Map style configuration
  ```

- [ ] **2.1.2** Implement map controls
  ```typescript
  // src/components/map/MapControls.tsx
  - My location button
  - Refresh markers button
  - Map style toggle (streets/satellite)
  - Clustering toggle
  - Disposition filter button
  ```

- [ ] **2.1.3** Create property marker component
  ```typescript
  // src/components/map/PropertyMarker.tsx
  - Custom marker based on disposition
  - Icon + color from disposition status
  - Tap handler to open property drawer
  - Animation for selected marker
  ```

- [ ] **2.1.4** Implement marker clustering
  ```typescript
  // src/components/map/ClusterLayer.tsx
  - GeoJSON source with clustering enabled
  - Cluster circles with count labels
  - Tap to expand clusters
  - Smooth zoom transitions
  ```

- [ ] **2.1.5** Build map store
  ```typescript
  // src/stores/mapStore.ts
  interface MapState {
    viewState: ViewState;
    selectedMarker: Property | null;
    clusteringEnabled: boolean;
    mapStyle: MapStyle;
    followMode: boolean;
    setViewState: (state: ViewState) => void;
    selectMarker: (property: Property | null) => void;
    toggleClustering: () => void;
    setMapStyle: (style: MapStyle) => void;
  }
  ```

**Deliverables**:
- Interactive map with zoom/pan
- Current location button working
- Map style switching
- Basic marker display

---

### 2.2 Property Data Loading

**Objective**: Load and display properties based on map viewport.

#### Tasks:

- [ ] **2.2.1** Create properties API service
  ```typescript
  // src/services/api/properties.ts
  - getPropertiesWithinBounds(bounds)
  - getPropertyById(id)
  - searchProperties(term)
  - updateProperty(id, data)
  ```

- [ ] **2.2.2** Implement property store
  ```typescript
  // src/stores/propertyStore.ts
  interface PropertyState {
    properties: Property[];
    isLoading: boolean;
    error: Error | null;
    loadPropertiesInBounds: (bounds: Bounds) => Promise<void>;
    updateProperty: (id: string, data: Partial<Property>) => void;
    clearProperties: () => void;
  }
  ```

- [ ] **2.2.3** Build Property model
  ```typescript
  // src/models/Property.ts
  class PropertyMarker {
    id: string;
    location: { latitude: number; longitude: number };
    address: string;
    owner: string;
    events: Event[];
    
    getMarkerIcon(): string;
    getMarkerColor(): string;
    getMostRecentEvent(dispositionType: string): Event | null;
    toGeoJSON(): Feature;
  }
  ```

- [ ] **2.2.4** Implement bounds-based loading
  - Debounced load on map move end
  - Cache cleanup for out-of-bounds markers
  - Loading indicator during fetch
  - Error toast on failure

- [ ] **2.2.5** Add property search
  ```typescript
  // src/components/map/SearchBar.tsx
  - Search input with debounce
  - Results dropdown
  - Tap result to navigate map
  - Clear search button
  ```

**Deliverables**:
- Properties loading on map pan
- Markers displaying with correct icons
- Property search working
- Performance optimized for many markers

---

### 2.3 Property Detail Drawer

**Objective**: Display property details in a bottom sheet.

#### Tasks:

- [ ] **2.3.1** Create bottom sheet component
  ```typescript
  // src/components/ui/BottomSheet.tsx
  - Gesture-based drag to expand/collapse
  - Snap points (collapsed, half, full)
  - Handle indicator
  - Backdrop with tap to close
  ```

- [x] **2.3.2** Build PropertySheet component
  ```typescript
  // src/components/property/PropertySheet.tsx
  - Property address/title header
  - Owner name
  - Property attributes (roof, siding, solar, year built)
  - Most recent door knock info
  - Action buttons (Knock Door, More)
  ```

- [ ] **2.3.3** Implement related content tabs
  ```typescript
  // src/components/property/RelatedContent.tsx
  - Events tab with timeline
  - Leads tab with lead cards
  - Projects tab (if applicable)
  - Badge counts on tabs
  ```

- [ ] **2.3.4** Create event timeline
  ```typescript
  // src/components/property/EventTimeline.tsx
  - Chronological event list
  - Event card with subject, date, status
  - Disposition badges
  - Submitted by info
  ```

- [ ] **2.3.5** Create lead card component
  ```typescript
  // src/components/lead/LeadCard.tsx
  - Lead name and type icon
  - Status badge
  - Contact info (phone, email)
  - Edit and Mark as Sold actions
  ```

**Deliverables**:
- Property drawer opening on marker tap
- Gesture-based expand/collapse
- Tabbed related content
- Events and leads displayed

---

## Phase 3: Door Knocking (Week 3)

### 3.1 Knock Door Flow

**Objective**: Implement the complete door knock capture workflow.

#### Tasks:

- [ ] **3.1.1** Create disposition context/store
  ```typescript
  // src/stores/dispositionStore.ts
  interface DispositionState {
    selectedDisposition: DispositionType;
    setDisposition: (type: DispositionType) => void;
  }
  
  type DispositionType = 
    | 'Insurance Restoration'
    | 'Solar Replacement'
    | 'Community Solar';
  ```

- [ ] **3.1.2** Build disposition chooser modal
  ```typescript
  // src/components/knock/DispositionChooser.tsx
  - List of disposition types
  - Icons for each type
  - Current selection indicator
  - Confirm button
  ```

- [ ] **3.1.3** Fetch schema/picklist values
  ```typescript
  // src/services/api/schema.ts
  - getValueSets(names: string[]): Promise<ValueSet[]>
  - getFieldDefinitions(object: string): Promise<FieldDefinition[]>
  - Cache value sets locally
  ```

- [ ] **3.1.4** Create KnockDoorSheet component
  ```typescript
  // src/components/knock/KnockDoorSheet.tsx
  - Form with React Hook Form + Zod
  - Disposition status picker (dynamic based on type)
  - Comments textarea
  - Existing roof type picker
  - Existing siding picker
  - Solar on property picker
  - Submit and Cancel buttons
  ```

- [ ] **3.1.5** Implement event creation
  ```typescript
  // src/services/api/events.ts
  - createEvent(event: CreateEventRequest): Promise<EventResponse>
  - Include GPS coordinates from current location
  - Handle offline queueing
  ```

- [ ] **3.1.6** Add location capture during knock
  - Request location permission if needed
  - Get current GPS coordinates
  - Show location status indicator
  - Store coordinates with event

**Deliverables**:
- Knock door modal opening from property drawer
- Disposition-based status options
- Event creation with GPS stamp
- Property update on knock complete

---

### 3.2 Lead Capture

**Objective**: Enable lead creation from property context.

#### Tasks:

- [ ] **3.2.1** Create lead form component
  ```typescript
  // src/components/lead/LeadForm.tsx
  - First name, Last name
  - Email, Phone
  - Company
  - Address fields (pre-filled from property)
  - Lead type selector
  - Insurance company picker (for Insurance Restoration)
  - Utility fields (for Community Solar)
  - Status picker
  - Comments
  ```

- [ ] **3.2.2** Build lead creation flow
  - After "Lead" disposition → prompt to create lead
  - Pre-populate property address
  - Validate required fields
  - Submit to API or queue offline

- [ ] **3.2.3** Implement leads API service
  ```typescript
  // src/services/api/leads.ts
  - createLead(lead: CreateLeadRequest): Promise<LeadResponse>
  - updateLead(id: string, data: Partial<Lead>): Promise<LeadResponse>
  - getLeadDetail(id: string): Promise<Lead>
  ```

- [ ] **3.2.4** Create lead modal variations
  - Standard lead modal (Insurance Restoration)
  - Community Solar lead modal (utility info)
  - Solar Replacement lead modal

- [ ] **3.2.5** Add photo capture for utility bills
  - Camera permission request
  - Photo capture UI
  - Image preview
  - Upload to server

**Deliverables**:
- Lead creation from knock workflow
- Multiple lead types supported
- Photo attachment capability
- Lead editing from related content

---

## Phase 4: Offline Capabilities (Week 4)

### 4.1 Local Database Setup

**Objective**: Implement SQLite storage for offline data.

#### Tasks:

- [ ] **4.1.1** Design database schema
  ```sql
  -- src/services/offline/schema.sql
  
  CREATE TABLE properties (
    id TEXT PRIMARY KEY,
    data TEXT NOT NULL,  -- JSON blob
    latitude REAL,
    longitude REAL,
    updated_at INTEGER,
    synced_at INTEGER
  );
  
  CREATE TABLE events (
    id TEXT PRIMARY KEY,
    local_id TEXT UNIQUE,
    property_id TEXT,
    data TEXT NOT NULL,
    status TEXT DEFAULT 'pending',  -- pending, synced, failed
    created_at INTEGER,
    synced_at INTEGER
  );
  
  CREATE TABLE leads (
    id TEXT PRIMARY KEY,
    local_id TEXT UNIQUE,
    property_id TEXT,
    data TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at INTEGER,
    synced_at INTEGER
  );
  
  CREATE TABLE sync_queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    action TEXT NOT NULL,  -- create, update, delete
    payload TEXT NOT NULL,
    attempts INTEGER DEFAULT 0,
    last_attempt INTEGER,
    created_at INTEGER
  );
  
  CREATE TABLE value_sets (
    name TEXT PRIMARY KEY,
    data TEXT NOT NULL,
    fetched_at INTEGER
  );
  
  CREATE INDEX idx_properties_location ON properties(latitude, longitude);
  CREATE INDEX idx_events_property ON events(property_id);
  CREATE INDEX idx_sync_queue_status ON sync_queue(entity_type, action);
  ```

- [ ] **4.1.2** Create database service
  ```typescript
  // src/services/offline/database.ts
  class DatabaseService {
    private db: SQLite.SQLiteDatabase;
    
    async initialize(): Promise<void>;
    async runMigrations(): Promise<void>;
    
    // Properties
    async saveProperty(property: Property): Promise<void>;
    async getProperty(id: string): Promise<Property | null>;
    async getPropertiesInBounds(bounds: Bounds): Promise<Property[]>;
    
    // Events
    async saveEvent(event: Event): Promise<void>;
    async getPendingEvents(): Promise<Event[]>;
    async markEventSynced(id: string, serverId: string): Promise<void>;
    
    // Leads
    async saveLead(lead: Lead): Promise<void>;
    async getPendingLeads(): Promise<Lead[]>;
    async markLeadSynced(id: string, serverId: string): Promise<void>;
    
    // Sync Queue
    async queueAction(action: SyncAction): Promise<void>;
    async getQueuedActions(): Promise<SyncAction[]>;
    async removeFromQueue(id: number): Promise<void>;
  }
  ```

- [ ] **4.1.3** Implement MMKV storage
  ```typescript
  // src/services/offline/storage.ts
  class StorageService {
    // Auth tokens (use Secure Store instead for sensitive)
    getAuthToken(): string | null;
    setAuthToken(token: string): void;
    
    // Settings
    getSettings(): AppSettings;
    setSettings(settings: Partial<AppSettings>): void;
    
    // Cache
    getCachedValueSets(): Record<string, ValueSet>;
    setCachedValueSets(sets: Record<string, ValueSet>): void;
    
    // Map state
    getLastViewport(): ViewState | null;
    setLastViewport(state: ViewState): void;
  }
  ```

**Deliverables**:
- SQLite database initialized
- Schema migrations running
- CRUD operations for all entities
- MMKV for settings/cache

---

### 4.2 Offline Sync System

**Objective**: Implement background sync for offline operations.

#### Tasks:

- [x] **4.2.1** Create location tracking hook
  ```typescript
  // src/hooks/useLocation.ts
  function useOffline() {
    const [isOnline, setIsOnline] = useState(true);
    const [isConnected, setIsConnected] = useState(true);
    
    useEffect(() => {
      const unsubscribe = NetInfo.addEventListener(state => {
        setIsOnline(state.isInternetReachable ?? false);
        setIsConnected(state.isConnected ?? false);
      });
      return () => unsubscribe();
    }, []);
    
    return { isOnline, isConnected };
  }
  ```

- [ ] **4.2.2** Build sync queue processor
  ```typescript
  // src/services/offline/sync.ts
  class SyncService {
    private isProcessing = false;
    
    async processQueue(): Promise<SyncResult>;
    async syncEvents(): Promise<void>;
    async syncLeads(): Promise<void>;
    async fetchUpdates(): Promise<void>;
    
    startBackgroundSync(intervalMs: number): void;
    stopBackgroundSync(): void;
  }
  ```

- [ ] **4.2.3** Implement offline-first data operations
  ```typescript
  // When creating event:
  1. Generate local UUID
  2. Save to SQLite with status='pending'
  3. Add to sync queue
  4. Update UI immediately
  5. When online, process queue
  6. On success, update status to 'synced'
  7. On failure, increment attempts, retry later
  ```

- [ ] **4.2.4** Add offline indicator UI
  - Banner or badge showing offline status
  - Pending sync count indicator
  - Manual sync trigger button
  - Sync status in settings

- [ ] **4.2.5** Handle conflict resolution
  - Last-write-wins for simple fields
  - Merge strategy for events (additive)
  - User notification for conflicts
  - Retry queue for failed syncs

**Deliverables**:
- Offline event creation working
- Background sync when online
- Offline indicator in UI
- Sync queue management

---

### 4.3 Offline Maps

**Objective**: Enable map tile caching for offline use.

#### Tasks:

- [ ] **4.3.1** Configure Mapbox offline packs
  ```typescript
  // src/services/map/tiles.ts
  class TileService {
    async downloadRegion(bounds: Bounds, zoom: ZoomRange): Promise<string>;
    async getDownloadedRegions(): Promise<OfflineRegion[]>;
    async deleteRegion(id: string): Promise<void>;
    async getStorageUsage(): Promise<number>;
  }
  ```

- [ ] **4.3.2** Build download manager UI
  - Current location download button
  - Download progress indicator
  - Storage usage display
  - Delete cached tiles option

- [ ] **4.3.3** Implement automatic tile caching
  - Cache tiles as user pans
  - Limit cache size (configurable)
  - LRU eviction policy
  - Background download for current area

- [ ] **4.3.4** Add offline map settings
  - Max storage limit setting
  - Clear cache button
  - Download quality (map style) selection
  - Auto-download toggle

**Deliverables**:
- Map tiles cached for offline viewing
- Storage management UI
- Configurable cache limits
- Manual region download option

---

## Phase 5: Polish & Production (Week 5)

### 5.1 UI/UX Refinement

**Objective**: Polish the user interface and experience.

#### Tasks:

- [ ] **5.1.1** Implement consistent design system
  - Color tokens (matching web app)
  - Typography scale
  - Spacing scale
  - Component variants

- [ ] **5.1.2** Add loading states
  - Skeleton screens for lists
  - Spinner overlays for actions
  - Pull-to-refresh where appropriate
  - Optimistic UI updates

- [ ] **5.1.3** Implement toast notifications
  ```typescript
  // src/components/ui/Toast.tsx
  - Success, error, warning, info variants
  - Auto-dismiss with configurable duration
  - Action button support
  - Queue multiple toasts
  ```

- [ ] **5.1.4** Add haptic feedback
  - Button press feedback
  - Success/error haptics
  - Gesture completion feedback

- [ ] **5.1.5** Implement empty states
  - No properties in view
  - No search results
  - No leads/events
  - Offline mode messages

**Deliverables**:
- Consistent visual design
- Smooth loading experiences
- Clear feedback on actions
- Accessible empty states

---

### 5.2 Error Handling & Logging

**Objective**: Implement robust error handling and diagnostics.

#### Tasks:

- [ ] **5.2.1** Create error boundary component
  - Catch render errors
  - Display fallback UI
  - Report to error service
  - Retry/reset options

- [ ] **5.2.2** Implement API error handling
  ```typescript
  class APIError extends Error {
    status: number;
    code: string;
    details?: Record<string, unknown>;
    
    static fromResponse(response: AxiosError): APIError;
    
    isNetworkError(): boolean;
    isAuthError(): boolean;
    isValidationError(): boolean;
  }
  ```

- [ ] **5.2.3** Add logging service
  - Local log storage
  - Log levels (debug, info, warn, error)
  - Remote log submission (when online)
  - Crash reporting integration

- [ ] **5.2.4** Implement retry logic
  - Exponential backoff for API calls
  - Max retry attempts
  - User notification after failures
  - Manual retry option

**Deliverables**:
- Graceful error handling
- User-friendly error messages
- Debug logging for troubleshooting
- Crash reporting configured

---

### 5.3 Testing & Quality

**Objective**: Ensure app quality through testing.

#### Tasks:

- [ ] **5.3.1** Set up Jest for unit tests
  ```bash
  npm install --save-dev jest @testing-library/react-native
  ```

- [ ] **5.3.2** Write unit tests for core logic
  - Property model methods
  - Store actions
  - Utility functions
  - Form validation

- [ ] **5.3.3** Add component tests
  - Key UI components
  - Form interactions
  - Navigation flows

- [ ] **5.3.4** Manual test checklist
  - [ ] Login/logout flow
  - [ ] Map navigation and markers
  - [ ] Property search
  - [ ] Door knock creation
  - [ ] Lead creation
  - [ ] Offline mode
  - [ ] Sync operations
  - [ ] Settings persistence

**Deliverables**:
- Unit tests passing
- Component tests for key flows
- Manual QA completed
- Bug fixes applied

---

### 5.4 Build & Deployment

**Objective**: Configure production builds and deployment.

#### Tasks:

- [ ] **5.4.1** Configure EAS Build
  ```json
  // eas.json
  {
    "build": {
      "development": {
        "developmentClient": true,
        "distribution": "internal"
      },
      "preview": {
        "distribution": "internal"
      },
      "production": {
        "autoIncrement": true
      }
    }
  }
  ```

- [ ] **5.4.2** Set up environment management
  - Development, staging, production configs
  - Environment-specific API URLs
  - Feature flags

- [ ] **5.4.3** Configure app icons and splash screen
  - App icon for iOS and Android
  - Adaptive icon for Android
  - Splash screen with logo

- [ ] **5.4.4** Set up OTA updates
  - Configure expo-updates
  - Update channel management
  - Rollback capability

- [ ] **5.4.5** Submit to app stores
  - Apple App Store submission
  - Google Play Store submission
  - Beta testing distribution

**Deliverables**:
- Production builds for iOS and Android
- App store submissions prepared
- OTA update capability
- CI/CD pipeline configured

---

## Backend Considerations

### Standalone Backend Option

If deploying as a separate service:

```
knocker-mobile-api/
├── src/
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── properties.routes.ts
│   │   ├── events.routes.ts
│   │   ├── leads.routes.ts
│   │   └── schema.routes.ts
│   ├── services/
│   │   ├── salesforce.service.ts
│   │   ├── properties.service.ts
│   │   ├── events.service.ts
│   │   └── leads.service.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   └── rateLimit.middleware.ts
│   └── index.ts
├── prisma/
│   └── schema.prisma
└── package.json
```

Key endpoints needed:
- Authentication (from knocker auth)
- Properties within bounds
- Property search
- Property details
- Event creation
- Lead CRUD
- Schema/picklist values

---

## Success Metrics

### Performance Targets
- Map render: < 2s initial load
- Property load: < 500ms for viewport
- Knock submission: < 1s (online), instant (offline)
- App launch: < 3s to interactive
- Offline storage: < 100MB for typical use

### Quality Targets
- Crash-free rate: > 99.5%
- API success rate: > 99%
- Offline sync success: > 95%
- User rating: > 4.5 stars

---

## Timeline Summary

| Week | Phase | Focus |
|------|-------|-------|
| 1 | Foundation | Project setup, auth, basic map |
| 2 | Map Features | Markers, clustering, property details |
| 3 | Knocking | Door knock flow, lead capture |
| 4 | Offline | SQLite, sync, tile caching |
| 5 | Production | Polish, testing, deployment |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Mapbox native complexity | Start with basic map, iterate |
| Offline sync conflicts | Simple last-write-wins strategy |
| Large datasets | Pagination, viewport-based loading |
| App store rejection | Follow guidelines, thorough testing |
| Performance issues | Profile early, optimize iteratively |

---

## Next Steps

1. Review and approve this plan
2. Set up development environment
3. Begin Phase 1.1 (Project Setup)
4. Schedule weekly check-ins for progress review
