# Qibla Direction Troubleshooting Guide

## Issue: Qibla Arrow Doesn't Move When I Move My Tablet

### Understanding the Feature

The Qibla compass has **two modes**:

1. **Static Mode** (Default)
   - Shows the calculated direction to Mecca from your location
   - Arrow points in a fixed direction
   - Doesn't respond to device movement

2. **Live Compass Mode** (Device Orientation)
   - Uses your device's compass sensor
   - Arrow rotates as you move your tablet
   - Works like a real compass
   - **Requires permission on iOS devices**

### How to Enable Live Compass

#### On iOS (iPad/iPhone):
1. Look for the blue banner that says "Enable device compass"
2. Tap the "Enable Compass" button
3. Grant permission when prompted
4. The compass will now respond to device movement

#### On Android:
- Should work automatically (no permission needed)
- If not working, check if your device has a magnetometer sensor

### When Live Compass is Active:
- You'll see a green banner: "✓ Live compass active"
- Rotate your device horizontally (like holding a real compass)
- The arrow will rotate to always point toward Mecca
- When the arrow points straight up, you're facing Qibla!

---

## Issue: Qibla Direction Not Working on Tablet

### Symptoms
- Qibla view shows "Loading location..." indefinitely
- Error message appears
- Compass doesn't display

### Common Causes & Solutions

#### 1. Location Permission Denied

**Problem:** The browser doesn't have permission to access your location.

**Solution:**
1. **On Android Tablets:**
   - Go to Settings → Apps → Your Browser (Chrome/Firefox/Safari)
   - Tap Permissions → Location
   - Select "Allow" or "Allow only while using the app"

2. **On iPad:**
   - Go to Settings → Privacy → Location Services
   - Find your browser (Safari/Chrome)
   - Select "While Using the App"

3. **In Browser:**
   - Look for a location icon in the address bar
   - Click it and select "Allow"
   - Refresh the page

#### 2. GPS/Location Services Disabled

**Problem:** Device location services are turned off.

**Solution:**
1. **Android:**
   - Swipe down from top
   - Tap Location icon to enable
   - Or: Settings → Location → Turn on

2. **iPad:**
   - Settings → Privacy → Location Services
   - Toggle ON

#### 3. Browser Compatibility

**Problem:** Some browsers don't support geolocation API.

**Solution:**
- Use a modern browser:
  - Chrome (recommended)
  - Firefox
  - Safari
  - Edge
- Update your browser to the latest version

#### 4. HTTPS Required

**Problem:** Geolocation only works on secure connections.

**Solution:**
- Ensure you're accessing the app via `https://` not `http://`
- If testing locally, use `localhost` which is treated as secure

#### 5. Default Location Fallback

**Problem:** If geolocation fails, app uses London as default.

**Current Behavior:**
```javascript
// Fallback in App.tsx
setLocation({ latitude: 51.5072, longitude: -0.1276 }); // London
```

**Solution:**
- Manually update your location using the LocationInput component
- Or grant location permissions and refresh

### Debugging Steps

#### Step 1: Check Browser Console
1. Open Developer Tools (F12 or Cmd+Option+I)
2. Go to Console tab
3. Look for messages like:
   ```
   QiblaView: Calculating Qibla for location: {latitude: X, longitude: Y}
   QiblaView: Qibla direction calculated: XXX
   QiblaView: Distance to Mecca: XXXX km
   ```

#### Step 2: Check Location State
In console, check if location is set:
```javascript
// Should show your coordinates
console.log(location);
```

#### Step 3: Test Geolocation API
In console, test if geolocation works:
```javascript
navigator.geolocation.getCurrentPosition(
  (pos) => console.log('Success:', pos.coords),
  (err) => console.error('Error:', err)
);
```

#### Step 4: Check Network Tab
1. Open Developer Tools → Network tab
2. Refresh the page
3. Look for any failed requests
4. Check if Islamic calendar service is loading

### Manual Location Entry

You can manually enter your location in two ways:

#### Method 1: Location Input at Top of Page
1. Scroll to the top of the page
2. Find the "Location Input" component
3. Enter your coordinates:
   - **Latitude**: e.g., 40.7128 (New York)
   - **Longitude**: e.g., -74.0060 (New York)
4. Click "Update Location"
5. Return to Qibla view

#### Method 2: Change Location Button
1. In the Qibla view, find "Your Location" card
2. Click the "Change Location" button
3. You'll be scrolled to the top where you can update location
4. After updating, navigate back to Qibla view

#### Finding Your Coordinates

**Option 1: Google Maps**
1. Go to Google Maps
2. Right-click on your location
3. Click "What's here?"
4. Coordinates appear at the bottom
5. Format: `Latitude, Longitude`

**Option 2: Google Search**
1. Search "my coordinates" in Google
2. Google will show your current coordinates
3. Copy the numbers

**Option 3: GPS Apps**
- Use any GPS or compass app on your device
- Most show coordinates in the app

**Coordinate Format:**
- Latitude: -90 to +90 (North is positive)
- Longitude: -180 to +180 (East is positive)
- Example: `40.7128, -74.0060` (New York City)

#### After Changing Location

1. **Automatic Recalculation:**
   - Qibla direction updates automatically
   - Distance to Mecca recalculates
   - Compass adjusts to new location

2. **Manual Recalculation:**
   - If it doesn't update, click "Recalculate" button
   - Found in the "Your Location" card

### Expected Behavior

When working correctly:
1. App loads → Requests location permission
2. User grants permission → Location detected
3. Navigate to Qibla view → Shows loading spinner
4. Calculation completes → Compass displays with:
   - Green arrow pointing to Qibla
   - Kaaba icon at arrow tip
   - Your location info
   - Distance to Mecca

### Error Messages

#### "Failed to calculate Qibla direction"
- **Cause:** Issue with Islamic calendar service
- **Solution:** Check console for detailed error, try recalculating

#### "Loading location..." (indefinite)
- **Cause:** Location permission denied or GPS disabled
- **Solution:** Enable location services and grant permissions

#### "Geolocation failed: User denied Geolocation"
- **Cause:** User clicked "Block" on permission prompt
- **Solution:** Reset permissions in browser settings

### Compass Calibration

If the live compass is inaccurate:

#### Android:
1. Open your device's Compass app
2. Move your device in a figure-8 pattern
3. This calibrates the magnetometer
4. Return to the Qibla app

#### iOS:
1. Open the built-in Compass app
2. Follow the calibration instructions
3. Return to the Qibla app

#### General Tips:
- Keep away from metal objects and magnets
- Remove magnetic phone cases
- Move away from electronic devices
- Hold device flat (parallel to ground)

### Testing Checklist

- [ ] Location services enabled on device
- [ ] Browser has location permission
- [ ] Using HTTPS or localhost
- [ ] Browser is up to date
- [ ] JavaScript is enabled
- [ ] No ad blockers blocking geolocation
- [ ] Network connection is stable
- [ ] Device has magnetometer sensor (for live compass)
- [ ] Compass calibrated properly

### Still Not Working?

1. **Try a different browser**
2. **Clear browser cache and cookies**
3. **Restart your device**
4. **Check if other location-based websites work**
5. **Try on a different device to isolate the issue**

### Developer Notes

The Qibla calculation uses:
- **adhan** library for Qibla direction
- **Haversine formula** for distance calculation
- **Browser Geolocation API** for location detection
- **Islamic Calendar Service** for calculations

Location flow:
```
App.tsx (useEffect) 
  → navigator.geolocation.getCurrentPosition()
  → setLocation()
  → QiblaView receives location prop
  → IslamicCalendarService.getQiblaDirection()
  → Display compass
```

### Improvements Made

1. **Better Error Messages:** Now shows troubleshooting tips
2. **Recalculate Button:** Allows manual retry
3. **Console Logging:** Helps debug issues
4. **Fallback Display:** Shows coordinates even without city name
5. **Loading States:** Clear feedback during calculation
