# Ambient Encounters - Mobile Design Guidelines

## Brand Identity

**Purpose**: A mindful discovery app that helps users capture and reflect on meaningful encounters - whether people, places, moments, or experiences - in their daily life.

**Aesthetic Direction**: Soft/organic minimalism - breathing room with gentle curves, calming gradients, and subtle ambient textures. Think morning fog meets Japanese ma (negative space). The app should feel like a quiet sanctuary, not a productivity tool.

**Memorable Element**: Soft gradient overlays that shift subtly based on time of day, creating an ambient atmosphere unique to each user's journey.

## Navigation Architecture

**Root Navigation**: Tab Bar (4 tabs)
- Discover (home feed)
- Map (location-based encounters)
- Floating Action Button (+ Create Encounter)
- Journal (personal encounters)
- Profile

**Auth**: Optional SSO (Apple/Google Sign-In) for cloud sync. App works fully offline with local storage.

## Color Palette

- **Primary**: #6B7FD7 (soft periwinkle - calm, trustworthy)
- **Secondary**: #B8C5F2 (pale lavender)
- **Accent**: #FFB4A9 (warm coral - for moments of delight)
- **Background**: #F7F8FC (off-white with cool tint)
- **Surface**: #FFFFFF
- **Text Primary**: #2D3142 (near-black with warmth)
- **Text Secondary**: #6B7280
- **Success**: #7BC9A7 (soft sage)
- **Border**: #E5E7EB

## Typography

- **Primary Font**: Manrope (Google Font - geometric softness)
- **Scale**:
  - Hero: 32/Bold
  - Title: 24/Bold
  - Heading: 18/Semibold
  - Body: 16/Regular
  - Caption: 14/Regular
  - Label: 12/Medium

## Screen Specifications

### 1. Discover (Home)
- **Purpose**: Browse ambient encounters shared by community
- **Header**: Transparent, title "Discover", right: filter icon
- **Layout**: 
  - Scrollable feed of encounter cards
  - Top safe area: headerHeight + Spacing.xl
  - Bottom safe area: tabBarHeight + Spacing.xl
- **Components**: Search bar (sticky below header), masonry-style cards with gradient overlays, pull-to-refresh
- **Empty State**: empty-discover.png

### 2. Map
- **Purpose**: Explore encounters by location
- **Header**: Transparent, title "Nearby", right: layers icon (map style)
- **Layout**: Full-screen map with clustered pins, floating search bar at top, current location FAB at bottom-right
- **Safe Areas**: 
  - Top: headerHeight + Spacing.xl
  - Bottom: tabBarHeight + Spacing.xl
  - Floating elements: 16px from edges

### 3. Create Encounter (Modal)
- **Purpose**: Capture new encounter
- **Header**: Modal header, left: "Cancel", title: "New Encounter", right: "Save"
- **Layout**: Scrollable form
  - Photo/media upload area (top)
  - Title field
  - Location selector (optional)
  - Description textarea
  - Mood tags (horizontal scroll chips)
  - Privacy toggle
- **Safe Areas**: Top: Spacing.xl, Bottom: insets.bottom + Spacing.xl

### 4. Journal
- **Purpose**: Personal encounter timeline
- **Header**: Default, title "Journal", right: calendar icon
- **Layout**: Chronological list grouped by date
- **Safe Areas**: Top: Spacing.xl, Bottom: tabBarHeight + Spacing.xl
- **Empty State**: empty-journal.png

### 5. Profile
- **Purpose**: User settings and stats
- **Header**: Transparent, right: settings gear
- **Layout**: Scrollable
  - Avatar (large, centered)
  - Display name
  - Stats row (encounters, favorites, connections)
  - Section: Recent encounters (horizontal scroll)
  - Section: Preferences
- **Safe Areas**: Top: headerHeight + Spacing.xl, Bottom: tabBarHeight + Spacing.xl

### 6. Encounter Detail (Stack Modal)
- **Purpose**: View full encounter with interactions
- **Header**: Transparent overlay on image, left: back arrow, right: share/more menu
- **Layout**: Scrollable
  - Hero image (full width)
  - Title overlay on image
  - Content card (rounded top corners, slides over image)
  - Metadata (date, location, mood)
  - Description
  - Comment section
- **Safe Areas**: Edges to screen bounds

## Visual Design

- **Card Style**: 16px border radius, subtle elevation (shadowOffset: {0, 1}, opacity: 0.05, radius: 4)
- **Floating Action Button**: Accent color (#FFB4A9), circular, 56px diameter
  - Shadow: {0, 2}, opacity: 0.10, radius: 2
- **Touchable Feedback**: Scale down to 0.97 on press, 150ms duration
- **Icons**: Feather icon set, 24px default size
- **Spacing Scale**: xs: 4, sm: 8, md: 12, lg: 16, xl: 24, 2xl: 32

## Assets to Generate

1. **icon.png** - Soft gradient circle (periwinkle to lavender) with abstract constellation dots | WHERE: App icon
2. **splash-icon.png** - Same as icon.png but larger | WHERE: Splash screen
3. **empty-discover.png** - Soft illustration of person looking at floating geometric shapes | WHERE: Discover tab when no encounters
4. **empty-journal.png** - Open journal with soft light rays | WHERE: Journal tab when no encounters
5. **default-avatar-1.png** - Abstract gradient blob (cool tones) | WHERE: User profiles
6. **default-avatar-2.png** - Abstract gradient blob (warm tones) | WHERE: User profiles
7. **onboarding-1.png** - Minimal illustration showing location pin with ambient glow | WHERE: Onboarding screen 1
8. **onboarding-2.png** - Person capturing moment with phone (soft, dreamy style) | WHERE: Onboarding screen 2