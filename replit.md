# Ambient Encounters

## Overview

Ambient Encounters is a cross-platform mobile application built with React Native and Expo that helps users capture and reflect on meaningful encounters in their daily life. Users can document people, places, moments, or experiences with photos, locations, mood tags, and personal reflections. The app features a mindful, organic minimalist design with soft gradients and calming aesthetics.

The application uses a client-server architecture with an Express backend and supports both local offline storage and optional cloud sync capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React Native with Expo SDK 54, using the new architecture (Fabric/TurboModules enabled)

**Navigation**: React Navigation v7 with a hybrid structure:
- Root stack navigator handles main flows and modals
- Bottom tab navigator provides primary navigation between Discover, Map, Journal, and Profile screens
- Floating action button overlays the tab bar for creating new encounters

**State Management**: 
- TanStack React Query for server state and data fetching
- Local component state with React hooks for UI state
- AsyncStorage for persistent local data storage

**Styling Approach**:
- Custom theme system with light/dark mode support via `useTheme` hook
- Centralized design tokens in `client/constants/theme.ts` (colors, spacing, typography, shadows)
- StyleSheet-based component styling
- Manrope font family from Google Fonts

**Animation**: React Native Reanimated for performant, gesture-based animations with spring physics

**Key Design Patterns**:
- Path aliases (`@/` for client, `@shared/` for shared code) configured via babel-plugin-module-resolver
- Custom hooks for reusable logic (`useTheme`, `useScreenOptions`, `useEncounters`)
- Compound component patterns for UI elements (ThemedText, ThemedView)
- Error boundary for graceful error handling

### Backend Architecture

**Server**: Express.js with TypeScript, running on Node.js

**API Structure**: RESTful endpoints prefixed with `/api` (routes defined in `server/routes.ts`)

**Storage Layer**: 
- Abstract storage interface (`IStorage`) in `server/storage.ts` for flexibility
- In-memory storage implementation (`MemStorage`) as default
- Designed for easy swap to database-backed storage

**Database Schema**: Drizzle ORM with PostgreSQL dialect
- Schema defined in `shared/schema.ts` using Drizzle's type-safe table definitions
- Zod integration via `drizzle-zod` for runtime validation
- Migration output configured to `./migrations` directory

### Data Flow

1. Client components use custom hooks (`useEncounters`, `useProfile`) that wrap React Query
2. For local-first features, data persists to AsyncStorage via `client/lib/storage.ts`
3. API requests go through `client/lib/query-client.ts` with automatic URL construction
4. Server processes requests and interacts with storage layer

### Build & Development

**Development**: 
- `npm run expo:dev` - Starts Expo development server with Replit-specific environment variables
- `npm run server:dev` - Runs Express server with tsx for TypeScript support

**Production**:
- Static web build via custom `scripts/build.js` that handles Metro bundling
- Server bundled with esbuild to `server_dist/`

## External Dependencies

### Mobile Platform Services
- **expo-location**: GPS and geocoding for tagging encounters with location
- **expo-image-picker**: Camera and photo library access for encounter photos
- **expo-haptics**: Tactile feedback for user interactions
- **react-native-maps**: Map visualization for location-based encounters

### UI/UX Libraries
- **expo-blur / expo-glass-effect**: Frosted glass effects for headers and overlays
- **expo-linear-gradient**: Gradient backgrounds for ambient aesthetic
- **expo-image**: Optimized image loading with caching
- **@expo-google-fonts/manrope**: Brand typography

### Data & Storage
- **@react-native-async-storage/async-storage**: Local persistent storage for offline-first functionality
- **@tanstack/react-query**: Data fetching, caching, and synchronization
- **drizzle-orm / pg**: PostgreSQL database ORM (schema prepared, database provisioning required)

### Navigation & Gestures
- **@react-navigation/native**: Core navigation library
- **@react-navigation/bottom-tabs**: Tab-based navigation
- **@react-navigation/native-stack**: Native stack navigation
- **react-native-gesture-handler**: Touch gesture system
- **react-native-screens**: Native screen containers

### Environment Requirements
- `DATABASE_URL`: PostgreSQL connection string (required for database features)
- `EXPO_PUBLIC_DOMAIN`: API domain for client-server communication
- `REPLIT_DEV_DOMAIN` / `REPLIT_DOMAINS`: Replit-specific domain configuration for CORS