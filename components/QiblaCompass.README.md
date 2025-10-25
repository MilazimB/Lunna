# Qibla Direction Feature

## Overview
The Qibla Direction feature provides Muslim users with a dedicated, full-screen compass view to determine the direction to Mecca for prayer. This feature has been separated from the prayer time cards to provide a more prominent and accessible experience.

## Components

### QiblaView
A standalone full-screen view that displays:
- Large, professional compass showing Qibla direction
- Current location information with coordinates
- Distance to Mecca (calculated using Haversine formula)
- Usage instructions
- Responsive design for mobile, tablet, and desktop

**Location:** `components/QiblaView.tsx`

### QiblaCompass
A reusable compass component that visualizes the Qibla direction with:
- Circular design with cardinal direction markers (N, S, E, W)
- Degree tick marks at regular intervals
- Prominent green arrow pointing toward Mecca
- Numeric degree value and directional label (e.g., "137° SE")
- Smooth rotation animation
- Responsive sizing

**Location:** `components/QiblaCompass.tsx`

## Navigation

The Qibla feature is accessible via:
1. A dedicated button in the main navigation (🧭 Qibla Direction)
2. The button appears alongside Astronomical, Religious Schedule, and Calendar views
3. On mobile devices, it's available in the dropdown navigation menu

## Usage

Users can access the Qibla direction by:
1. Clicking the "Qibla Direction" button in the navigation
2. The view automatically calculates the direction based on the user's current location
3. The compass updates automatically when the location changes

## Technical Details

### Calculation
- Uses the Islamic Calendar Service to calculate Qibla direction
- Mecca coordinates: 21.4225° N, 39.8262° E
- Distance calculated using the Haversine formula
- Direction calculated using great circle bearing

### Responsive Design
- Mobile: 280px compass
- Tablet: 350px compass
- Desktop: 400px compass
- Full-screen layout with gradient background
- Touch-friendly interface

### Accessibility
- Proper ARIA labels for screen readers
- High contrast colors (green on dark background)
- Clear visual hierarchy
- Keyboard navigation support

## Changes from Previous Implementation

### Before
- Qibla compass was embedded in each prayer time card
- Smaller compass size (180px)
- Less prominent display
- Mixed with other prayer information

### After
- Dedicated full-screen view for Qibla direction
- Larger compass (280-400px depending on device)
- Prominent, focused experience
- Additional context (location, distance to Mecca)
- Accessible via main navigation

## Files Modified

1. **Created:**
   - `components/QiblaView.tsx` - Main Qibla view component
   - `components/__tests__/QiblaView.test.tsx` - Tests for QiblaView

2. **Modified:**
   - `components/PrayerTimeCard.tsx` - Removed Qibla compass integration
   - `components/__tests__/PrayerTimeCard.test.tsx` - Removed Qibla-related tests
   - `components/religious/ReligiousSchedulePanel.tsx` - Removed showQibla prop
   - `components/ResponsiveNavigation.tsx` - Added Qibla navigation button
   - `App.tsx` - Added Qibla view routing
   - `types.ts` - Added optional `name` property to Location interface
   - `.kiro/specs/religious-celestial-enhancements/requirements.md` - Updated requirements
   - `.kiro/specs/religious-celestial-enhancements/design.md` - Updated design
   - `.kiro/specs/religious-celestial-enhancements/tasks.md` - Added implementation tasks

## Future Enhancements

Potential improvements for future iterations:
- Device compass integration for real-time orientation
- Augmented reality overlay
- Prayer time reminders with Qibla direction
- Offline support with cached calculations
- Multiple calculation methods (different madhabs)
