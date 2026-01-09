# Ambient Encounters

## Overview

Ambient Encounters is a cross-platform mobile application built with React Native and Expo designed to help users with ADHD focus through ambient soundscapes and encouraging voice affirmations. The app plays calming background sounds (Nature, Office, Café, City) while periodically delivering motivational phrases using Eleven Labs voice synthesis.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React Native with Expo SDK 54, using the new architecture (Fabric/TurboModules enabled)

**Navigation**: Two-page swipe navigation using react-native-reanimated gestures:
- Player screen: Main ambient sound player with environment selection, volume controls, and voice settings
- Phrases screen: View and customize encouragement phrases by voice mode

**State Management**: 
- TanStack React Query for server state and data fetching
- Local component state with React hooks for UI state
- AsyncStorage for persistent settings storage

**Styling Approach**:
- Custom theme system with light/dark mode support via `useTheme` hook
- Centralized design tokens in `client/constants/theme.ts` (colors, spacing, typography, shadows)
- StyleSheet-based component styling
- Manrope font family from Google Fonts

**Animation**: React Native Reanimated for performant gesture-based swipe navigation and pulse animations

**Audio**: expo-av for background ambient sound playback and voice affirmation audio

### Backend Architecture

**Server**: Express.js with TypeScript, running on Node.js

**API Structure**: 
- `/api/tts` - Text-to-speech endpoint that proxies to Eleven Labs API

**Environment Variables**:
- `ELEVENLABS_API_KEY` - Required for voice synthesis

### Data Flow

1. User settings persist to AsyncStorage via `client/lib/storage.ts`
2. React Query hooks provide reactive access to settings
3. TTS requests go through `/api/tts` endpoint to proxy Eleven Labs calls
4. Audio playback handled by expo-av with looping background sounds

### Build & Development

**Development**: 
- `npm run expo:dev` - Starts Expo development server
- `npm run server:dev` - Runs Express server with tsx for TypeScript support

### Key Features

1. **Ambient Sound Player**: Four environment soundscapes (Nature, Office, Café, City) with looping playback
2. **Voice Encouragement**: Eleven Labs TTS integration with multiple voice characters (Sarah, Bill, George, Charlie, Random)
3. **Voice Modes**: Gentle, Motivating, or Calm phrase styles
4. **Frequency Control**: Configurable encouragement intervals (1, 3, 5, 10, 15 minutes)
5. **Volume Control**: Independent sliders for background and voice volume
6. **Swipe Navigation**: Gesture-based page switching between Player and Phrases screens
7. **Settings Persistence**: All preferences saved locally via AsyncStorage

### External Dependencies

- **expo-av**: Audio playback for ambient sounds and TTS voice
- **@react-native-community/slider**: Volume control sliders
- **react-native-reanimated**: Gesture-based swipe navigation
- **react-native-gesture-handler**: Pan gesture detection
- **@tanstack/react-query**: Data fetching and caching
- **@expo-google-fonts/manrope**: Brand typography

### Environment Requirements

- `ELEVENLABS_API_KEY`: Required for voice synthesis (stored as secret)
- `EXPO_PUBLIC_DOMAIN`: API domain for client-server communication
