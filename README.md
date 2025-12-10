# Knocker Mobile

A React Native Expo mobile application for door-to-door canvassing, lead capture, and map-based field operations with offline-first capabilities.

## Overview

Knocker Mobile is a standalone mobile app extracted from the Knocker web application, focused exclusively on the canvassing/mapping module. The app provides:

- **Offline-First Maps**: Mapbox-powered maps with offline tile caching
- **Door Knocking**: Track and record door knock events with dispositions
- **Lead Capture**: Create and manage leads directly from the field
- **Location Tracking**: GPS-based location for property visits
- **Sync Capabilities**: Background sync when connectivity is available

## Project Structure

```
knocker-mobile/
├── app/                          # Expo Router file-based routing
│   ├── (auth)/                   # Authentication screens
│   │   ├── login.tsx
│   │   └── _layout.tsx
│   ├── (tabs)/                   # Main tab navigation
│   │   ├── map.tsx               # Main map/canvassing screen
│   │   ├── leads.tsx             # Leads list screen
│   │   ├── activity.tsx          # Recent activity/timeline
│   │   ├── settings.tsx          # App settings
│   │   └── _layout.tsx
│   ├── property/                 # Property detail screens
│   │   └── [id].tsx
│   ├── knock/                    # Knock door flow
│   │   └── [propertyId].tsx
│   ├── lead/                     # Lead detail/edit screens
│   │   ├── [id].tsx
│   │   └── new.tsx
│   ├── _layout.tsx               # Root layout
│   └── index.tsx                 # Entry redirect
├── src/
│   ├── components/               # Reusable UI components
│   │   ├── map/                  # Map-specific components
│   │   │   ├── MapView.tsx       # Main Mapbox map component
│   │   │   ├── PropertyMarker.tsx# Custom map markers
│   │   │   ├── ClusterLayer.tsx  # Marker clustering
│   │   │   ├── MapControls.tsx   # Floating map controls
│   │   │   └── SearchBar.tsx     # Property search
│   │   ├── knock/                # Knock door components
│   │   │   ├── KnockDoorSheet.tsx# Door knock form modal
│   │   │   ├── DispositionPicker.tsx
│   │   │   └── PropertyFields.tsx
│   │   ├── lead/                 # Lead management components
│   │   │   ├── LeadForm.tsx
│   │   │   ├── LeadCard.tsx
│   │   │   └── LeadList.tsx
│   │   ├── property/             # Property components
│   │   │   ├── PropertyDetail.tsx
│   │   │   ├── PropertySheet.tsx # Bottom sheet property details
│   │   │   ├── EventTimeline.tsx # Activity timeline
│   │   │   └── RelatedContent.tsx
│   │   └── ui/                   # Base UI components
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Select.tsx
│   │       ├── Modal.tsx
│   │       ├── BottomSheet.tsx
│   │       ├── Toast.tsx
│   │       └── Skeleton.tsx
│   ├── services/                 # API and data services
│   │   ├── api/                  # API client services
│   │   │   ├── client.ts         # Base axios client with auth
│   │   │   ├── properties.ts     # Properties API
│   │   │   ├── events.ts         # Events/knock API
│   │   │   ├── leads.ts          # Leads API
│   │   │   ├── schema.ts         # Field schemas/picklists
│   │   │   └── auth.ts           # Authentication API
│   │   ├── offline/              # Offline data management
│   │   │   ├── database.ts       # SQLite database setup
│   │   │   ├── sync.ts           # Background sync logic
│   │   │   ├── queue.ts          # Offline action queue
│   │   │   └── storage.ts        # MMKV key-value storage
│   │   └── map/                  # Map-specific services
│   │       ├── tiles.ts          # Offline tile management
│   │       ├── geocoding.ts      # Address search
│   │       └── location.ts       # GPS location service
│   ├── stores/                   # Zustand state stores
│   │   ├── authStore.ts          # Authentication state
│   │   ├── mapStore.ts           # Map view state
│   │   ├── propertyStore.ts      # Properties/markers state
│   │   ├── offlineStore.ts       # Offline mode state
│   │   └── dispositionStore.ts   # Current disposition context
│   ├── hooks/                    # Custom React hooks
│   │   ├── useAuth.ts            # Authentication hook
│   │   ├── useLocation.ts        # GPS location tracking
│   │   ├── useProperties.ts      # Properties data hook
│   │   ├── useOffline.ts         # Offline status hook
│   │   ├── useSync.ts            # Sync operations hook
│   │   └── useMap.ts             # Map controls hook
│   ├── models/                   # Data models/types
│   │   ├── Property.ts           # Property model
│   │   ├── Event.ts              # Door knock event model
│   │   ├── Lead.ts               # Lead model
│   │   └── types.ts              # Shared TypeScript types
│   ├── utils/                    # Utility functions
│   │   ├── dateUtils.ts          # Date formatting
│   │   ├── formatters.ts         # Data formatting
│   │   ├── validators.ts         # Form validation
│   │   └── constants.ts          # App constants
│   └── config/                   # App configuration
│       ├── env.ts                # Environment variables
│       ├── mapbox.ts             # Mapbox configuration
│       └── api.ts                # API endpoints config
├── assets/                       # Static assets
│   ├── images/
│   ├── icons/
│   └── fonts/
├── app.json                      # Expo app configuration
├── eas.json                      # EAS Build configuration
├── tailwind.config.js            # NativeWind config
├── tsconfig.json                 # TypeScript config
├── babel.config.js               # Babel config
└── package.json
```

## Tech Stack

| Category | Technology | Purpose |
|----------|------------|---------|
| **Framework** | React Native + Expo SDK 51 | Cross-platform mobile |
| **Routing** | Expo Router | File-based navigation |
| **Maps** | @rnmapbox/maps | Mapbox GL native maps |
| **State** | Zustand | Global state management |
| **Data Fetching** | TanStack Query | Server state + caching |
| **Forms** | React Hook Form + Zod | Form handling + validation |
| **Styling** | NativeWind (Tailwind) | Utility-first styling |
| **Offline DB** | expo-sqlite | Local SQLite storage |
| **Key-Value** | react-native-mmkv | Fast sync storage |
| **Auth Storage** | expo-secure-store | Secure credential storage |
| **Location** | expo-location | GPS services |
| **Network** | expo-network | Connectivity detection |

## Key Features

### 1. Offline-First Architecture
- SQLite database for local property/event/lead storage
- MMKV for fast key-value storage (auth tokens, settings)
- Background sync queue for pending operations
- Mapbox offline tile packs for map viewing without connectivity

### 2. Map & Canvassing
- Property markers with disposition-based icons/colors
- Marker clustering for performance
- Geolocation-based property loading
- Search by address/owner name
- Multiple map styles (streets, satellite, hybrid)

### 3. Door Knocking Workflow
- Disposition selection (Contact Made, Not Home, Lead, etc.)
- Property attribute capture (roof type, siding, solar)
- Comments/notes capture
- GPS location stamping on events
- Automatic sync when online

### 4. Lead Management
- Create leads from property context
- Multiple lead types (Insurance, Solar, Community Solar)
- Lead status tracking
- Photo attachment for utility bills

## Backend API Integration

The mobile app communicates with a Node.js/Express backend. Key endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/auth/login` | POST | User authentication |
| `/api/v1/data/properties/within-bounds` | GET | Properties in map bounds |
| `/api/v1/data/properties/search` | GET | Search properties |
| `/api/v1/data/properties/:id` | GET | Property details |
| `/api/v1/data/events` | POST | Create door knock event |
| `/api/v1/data/leads` | POST | Create lead |
| `/api/v1/data/leads/:id` | PUT | Update lead |
| `/api/v1/data/schema/value-sets` | GET | Picklist values |
| `/api/v1/data/schema/fields/:object` | GET | Field definitions |

## Environment Variables

```bash
# API Configuration
API_BASE_URL=https://your-knocker-api.com
API_VERSION=v1

# Mapbox
MAPBOX_ACCESS_TOKEN=pk.your_mapbox_token

# App Config
OFFLINE_SYNC_INTERVAL=300000  # 5 minutes
MAX_OFFLINE_TILES_MB=500
DEFAULT_ZOOM_LEVEL=14
```

## Development

### Prerequisites
- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- EAS CLI (`npm install -g eas-cli`)
- Xcode (iOS) / Android Studio (Android)

### Getting Started

```bash
# Install dependencies
npm install

# Start Expo development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Create development build
npx expo prebuild
```

### Building for Production

```bash
# Configure EAS (first time)
eas build:configure

# Build for Android
eas build --platform android --profile production

# Build for iOS
eas build --platform ios --profile production
```

## Documentation

- [plan.md](./plan.md) - Detailed implementation plan
- [.github/copilot-instructions.md](./.github/copilot-instructions.md) - AI assistant guidelines

## Related Projects

- **Knocker Web** - Full-featured web application (React + Express)
  - Source: `/Users/avi/Workspace/gitlab/knocker`
  - Contains: FlexiPage, ListView, Chatter, Workflow modules
  - Backend: Shared with mobile app

## Architecture Decisions

1. **Expo over bare React Native**: Simplified build/deploy, OTA updates
2. **Zustand over Redux**: Simpler API, better TypeScript support
3. **SQLite for offline**: Relational queries, complex sync scenarios
4. **MMKV for settings**: Faster than AsyncStorage, synchronous reads
5. **Expo Router**: File-based routing matches web patterns
6. **TanStack Query**: Automatic cache invalidation, optimistic updates