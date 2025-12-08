# Knocker Mobile - Quick Start Guide

## Prerequisites

1. **Node.js** (v18 or later)
2. **npm** or **yarn**
3. **Expo CLI**: `npm install -g expo-cli`
4. **iOS Simulator** (macOS) or **Android Emulator**
5. **EAS CLI** (for building): `npm install -g eas-cli`

## Installation

```bash
# Navigate to project directory
cd /Users/avi/Workspace/github/knocker-mobile

# Install dependencies (already done)
npm install

# Create .env file from example
cp .env.example .env

# Edit .env with your values
# - Set API_BASE_URL to your Knocker backend
# - Set MAPBOX_ACCESS_TOKEN (get from https://mapbox.com)
```

## Development

### Start Development Server

```bash
# Start Expo dev server
npm start

# Or use specific platform
npm run ios      # iOS Simulator
npm run android  # Android Emulator
```

### TypeScript Check

```bash
# Run TypeScript compiler (no emit)
npx tsc --noEmit
```

### Linting

```bash
# Run ESLint
npm run lint
```

## Project Status

✅ **Phase 1.1 & 1.2 Complete**
- Authentication flow implemented
- API services ready
- Navigation structure complete
- All configuration files in place

📍 **Current State**
- Login screen functional (form validation works)
- API client configured with auth interceptors
- Settings screen with logout
- Placeholder screens for Map and Leads

⏭️ **Next Steps**
- Connect to Knocker backend (set API_BASE_URL in .env)
- Test authentication flow
- Implement map view (Phase 2)

## Backend Setup

The mobile app requires the Knocker backend to be running:

```bash
# Start Knocker backend (in separate terminal)
cd /Users/avi/Workspace/gitlab/knocker
npm run dev
```

Default backend URL: `http://localhost:3000`

## Building for Devices

### Development Build (Required for Mapbox)

```bash
# Login to EAS
eas login

# Configure project
eas build:configure

# Create development build
npx expo prebuild
npx expo run:ios     # or run:android
```

### Production Build

```bash
# iOS
eas build --platform ios --profile production

# Android
eas build --platform android --profile production
```

## Project Structure

```
knocker-mobile/
├── app/                    # Expo Router screens
│   ├── (auth)/            # Authentication flow
│   └── (tabs)/            # Main app tabs
├── src/
│   ├── config/            # Environment & API config
│   ├── models/            # TypeScript types & models
│   ├── services/          # API services
│   ├── stores/            # Zustand state management
│   └── utils/             # Utility functions
├── README.md              # Project overview
├── plan.md                # 5-week implementation plan
├── PROGRESS.md            # Current implementation status
└── QUICKSTART.md          # This file
```

## Testing Authentication

1. Start the backend: `cd ../knocker && npm run dev`
2. Start mobile app: `npm start` then press `i` for iOS
3. Login screen should appear
4. Enter credentials (from Knocker backend)
5. Should navigate to Map tab on successful login
6. Settings tab should show user info
7. Logout should return to login screen

## Troubleshooting

### "Module not found" errors
```bash
npm install
rm -rf node_modules && npm install  # If still issues
```

### TypeScript errors
```bash
npx tsc --noEmit  # Check for type errors
```

### Metro bundler issues
```bash
npm start -- --clear  # Clear Metro cache
```

### Mapbox not working in Expo Go
Mapbox requires a development build, not Expo Go:
```bash
npx expo prebuild
npx expo run:ios  # or run:android
```

## Key Files to Configure

1. **`.env`** - API URL and Mapbox token
2. **`src/config/env.ts`** - Environment configuration
3. **`src/config/api.ts`** - API endpoint definitions
4. **`app.json`** - App name, bundle identifier, etc.

## Documentation

- **README.md** - Complete project documentation
- **plan.md** - 5-week phased implementation plan
- **PROGRESS.md** - Current implementation status
- **.github/copilot-instructions.md** - AI assistant guide

## Next Phase: Map Implementation

See `plan.md` Phase 2.1 for map implementation steps:
1. Configure Mapbox
2. Create MapView component
3. Implement property markers
4. Add clustering
5. Property details drawer

## Support

- Check `PROGRESS.md` for current implementation status
- Review `plan.md` for upcoming features
- See `.github/copilot-instructions.md` for development patterns

---

**Ready to start developing!** 🚀
