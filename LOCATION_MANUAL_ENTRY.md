# Manual Location Entry Feature

## Problem Solved

Previously, when `showCityName={true}` was enabled in the LocationInput component, users could only use the "Use my location" GPS button. There was no way to manually enter coordinates on tablets or computers where GPS might not work or be accurate.

## Solution

Added an **"Edit" button** that reveals the manual coordinate input fields, allowing users to enter their location manually even when the city name display mode is active.

## How It Works

### Default View (City Name Mode)

```
┌─────────────────────────────────────────────────┐
│ Current Location                                │
│ ┌─────────────────────────────────────────────┐ │
│ │ New York, United States                     │ │
│ │ 40.7128°N, 74.0060°W                        │ │
│ └─────────────────────────────────────────────┘ │
│ [📍 GPS] [✏️ Edit]                              │
└─────────────────────────────────────────────────┘
```

### Manual Entry Mode (After Clicking Edit)

```
┌─────────────────────────────────────────────────┐
│ Your Latitude (°N)                              │
│ ┌─────────────────────────────────────────────┐ │
│ │ 40.7128                                     │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ Your Longitude (°E)                             │
│ ┌─────────────────────────────────────────────┐ │
│ │ -74.0060                                    │ │
│ └─────────────────────────────────────────────┘ │
│ [📍 GPS] [Update] [Cancel]                      │
└─────────────────────────────────────────────────┘
```

## User Flow

### Step 1: Click Edit Button
1. Look for the LocationInput at the top of the page
2. You'll see your current location displayed as a city name
3. Click the **"Edit"** button (pencil icon)

### Step 2: Enter Coordinates
1. Two input fields appear:
   - **Latitude**: Enter your latitude (-90 to +90)
   - **Longitude**: Enter your longitude (-180 to +180)
2. Example coordinates:
   - New York: `40.7128, -74.0060`
   - London: `51.5074, -0.1278`
   - Tokyo: `35.6762, 139.6503`
   - Mecca: `21.4225, 39.8262`

### Step 3: Update Location
1. Click the **"Update"** button
2. The app will:
   - Validate your coordinates
   - Update the location
   - Fetch the city name for your coordinates
   - Recalculate Qibla direction (if in Qibla view)
   - Return to city name display mode

### Step 4: Cancel (Optional)
- If you change your mind, click **"Cancel"**
- Returns to city name display without changes

## Button Functions

### 📍 GPS Button (Location Icon)
- Uses device's GPS to get current location
- Works on mobile devices and tablets with GPS
- May not work on desktop computers
- Requires location permission

### ✏️ Edit Button (Pencil Icon)
- Reveals manual coordinate input fields
- Allows typing latitude and longitude
- Works on all devices (computer, tablet, phone)
- No GPS or permissions needed

### Update Button
- Saves the manually entered coordinates
- Updates the location throughout the app
- Fetches city name for the new location
- Closes manual input mode

### Cancel Button
- Discards any changes
- Returns to city name display
- Original location remains unchanged

## Finding Your Coordinates

### Method 1: Google Maps
1. Go to [Google Maps](https://maps.google.com)
2. Right-click on your location
3. Click "What's here?"
4. Coordinates appear at the bottom
5. Format: `Latitude, Longitude`

### Method 2: Google Search
1. Search "my coordinates" in Google
2. Google shows your current coordinates
3. Copy the numbers

### Method 3: Coordinate Finder Websites
- [LatLong.net](https://www.latlong.net/)
- [GPS Coordinates](https://gps-coordinates.org/)
- Enter your address to get coordinates

### Method 4: Known City Coordinates

| City | Latitude | Longitude |
|------|----------|-----------|
| Mecca | 21.4225 | 39.8262 |
| New York | 40.7128 | -74.0060 |
| London | 51.5074 | -0.1278 |
| Paris | 48.8566 | 2.3522 |
| Tokyo | 35.6762 | 139.6503 |
| Dubai | 25.2048 | 55.2708 |
| Istanbul | 41.0082 | 28.9784 |
| Cairo | 30.0444 | 31.2357 |
| Jakarta | -6.2088 | 106.8456 |
| Sydney | -33.8688 | 151.2093 |

## Coordinate Format

### Latitude
- Range: **-90 to +90**
- Positive = North of Equator
- Negative = South of Equator
- Example: `40.7128` (New York is north)

### Longitude
- Range: **-180 to +180**
- Positive = East of Prime Meridian
- Negative = West of Prime Meridian
- Example: `-74.0060` (New York is west)

### Decimal Degrees
- Use decimal format: `40.7128`
- Not degrees/minutes/seconds: `40°42'46"N`
- More decimal places = more precision
- 4 decimal places ≈ 11 meters accuracy

## Validation

The app validates your input:

### Valid Input
```
Latitude: 40.7128 ✓
Longitude: -74.0060 ✓
```

### Invalid Input
```
Latitude: 95 ✗ (must be -90 to 90)
Longitude: 200 ✗ (must be -180 to 180)
Latitude: abc ✗ (must be a number)
```

### Error Messages
- "Latitude must be between -90 and 90"
- "Longitude must be between -180 and 180"
- Both errors shown if both are invalid

## After Updating Location

### Automatic Updates
1. **City Name**: Fetched via reverse geocoding
2. **Qibla Direction**: Recalculated for new location
3. **Distance to Mecca**: Updated
4. **Prayer Times**: Recalculated (if in Religious view)
5. **Celestial Events**: Recalculated (if in Astronomical view)

### Visual Feedback
- Loading spinner while fetching city name
- City name updates when available
- Coordinates always displayed
- All views update automatically

## Troubleshooting

### Edit Button Not Visible
- **Check**: Are you in city name mode?
- **Solution**: The Edit button only appears when `showCityName={true}`

### Coordinates Not Updating
- **Check**: Did you click "Update"?
- **Solution**: Must click Update button to save changes

### City Name Shows "Unknown Location"
- **Cause**: Reverse geocoding failed or coordinates are in ocean
- **Solution**: This is normal, Qibla still works with coordinates

### Invalid Coordinate Error
- **Check**: Are values in correct range?
- **Solution**: Latitude: -90 to 90, Longitude: -180 to 180

### Location Resets After Refresh
- **Cause**: Location is not persisted in browser storage
- **Solution**: Re-enter location after page refresh
- **Future**: Could add "Save Location" feature

## Technical Implementation

### State Management
```typescript
const [showManualInput, setShowManualInput] = useState<boolean>(false);
```

### Conditional Rendering
```typescript
{showCityName && !showManualInput ? (
  // City name display with Edit button
) : (
  // Manual coordinate input fields
)}
```

### Form Submission
```typescript
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  // Validate coordinates
  // Update location
  // Fetch city name
  // Close manual input
  setShowManualInput(false);
};
```

## Benefits

### For Users
- ✅ Works on all devices (no GPS needed)
- ✅ More accurate than GPS in some cases
- ✅ Can enter any location worldwide
- ✅ Useful when GPS is blocked or inaccurate
- ✅ Can plan for future locations

### For Developers
- ✅ Maintains clean UI with city name display
- ✅ Provides fallback when GPS fails
- ✅ Improves accessibility
- ✅ Better user experience on desktop
- ✅ No breaking changes to existing code

## Future Enhancements

Potential improvements:

1. **Location Search**
   - Search by city name
   - Autocomplete suggestions
   - Popular locations dropdown

2. **Save Locations**
   - Save favorite locations
   - Quick switch between saved locations
   - Already partially implemented

3. **Map Picker**
   - Click on map to select location
   - Visual location selection
   - Integrated map view

4. **Recent Locations**
   - History of used locations
   - Quick access to recent
   - Clear history option

5. **Import/Export**
   - Share location via link
   - QR code for location
   - Import from GPS apps
