# Qibla Live Compass Feature

## Overview

The Qibla compass now supports **real-time device orientation**, allowing it to work like a physical compass. As you rotate your tablet or phone, the arrow adjusts to always point toward Mecca.

## How It Works

### Static Mode (Default)
- Calculates Qibla direction based on your GPS location
- Shows a fixed arrow pointing toward Mecca
- Works on all devices
- No special permissions needed

### Live Compass Mode
- Uses device's magnetometer (compass sensor)
- Arrow rotates as you move your device
- Shows real-time orientation
- Requires device orientation permission (iOS only)

## Technical Implementation

### Device Orientation API

The feature uses the browser's Device Orientation API:

```typescript
// Listen for device orientation changes
window.addEventListener('deviceorientationabsolute', handleOrientation);
window.addEventListener('deviceorientation', handleOrientation);

// Get compass heading
const handleOrientation = (event: DeviceOrientationEvent) => {
  let heading = event.alpha; // Z-axis rotation
  
  // iOS uses webkitCompassHeading
  if (event.webkitCompassHeading) {
    heading = event.webkitCompassHeading;
  } else if (event.alpha !== null) {
    // Android: adjust alpha to compass heading
    heading = 360 - event.alpha;
  }
  
  setDeviceHeading(heading);
};
```

### Calculation

The displayed arrow direction is calculated as:

```typescript
displayedDirection = qiblaDirection - deviceHeading
```

Where:
- `qiblaDirection`: Calculated angle to Mecca from your location (0-360°)
- `deviceHeading`: Current device orientation (0-360°)
- `displayedDirection`: Relative angle to show on compass

### Example:
- Your location: New York
- Qibla direction: 58° (Northeast)
- Device heading: 90° (facing East)
- Displayed arrow: 58° - 90° = -32° (arrow points left, telling you to turn left)

When you rotate to face 58° (Northeast), the arrow points straight up!

## Platform Support

### iOS (iPad/iPhone)
- **Requires permission** (iOS 13+)
- Shows "Enable Compass" button
- User must grant permission
- Uses `webkitCompassHeading` for accuracy
- Works in Safari and Chrome

### Android
- **No permission needed**
- Works automatically if device has magnetometer
- Uses `alpha` value from DeviceOrientationEvent
- Works in Chrome, Firefox, Edge

### Desktop
- Not supported (no magnetometer)
- Falls back to static mode
- Shows calculated direction only

## User Experience

### Permission Flow (iOS)

1. **Initial State**
   - Blue banner appears
   - "Enable device compass for real-time orientation"
   - "Enable Compass" button

2. **User Clicks Button**
   - Browser requests permission
   - System dialog appears
   - User grants or denies

3. **Permission Granted**
   - Green banner appears
   - "✓ Live compass active"
   - Compass starts responding to movement

4. **Permission Denied**
   - Falls back to static mode
   - User can try again in settings

### Using the Live Compass

1. **Hold Device Flat**
   - Keep tablet parallel to ground
   - Like holding a real compass

2. **Rotate Your Body**
   - Turn in a circle while watching the arrow
   - Arrow always points toward Mecca

3. **Find Qibla**
   - When arrow points straight up (12 o'clock)
   - You are facing Qibla direction
   - Ready for prayer!

## Visual Indicators

### Status Messages

```typescript
// Compass available but not enabled (iOS)
"Enable device compass for real-time orientation"
[Enable Compass Button]

// Compass active
"✓ Live compass active - Rotate your device to find Qibla"

// Instructions change based on mode
Static: "Align yourself with the green arrow for prayer"
Live: "Rotate your device until the arrow points up"

// Debug info (when compass active)
"Device heading: 90° | Qibla: 58°"
```

## Accuracy Considerations

### Factors Affecting Accuracy

1. **Magnetic Interference**
   - Metal objects nearby
   - Electronic devices
   - Magnetic phone cases
   - Building structures

2. **Calibration**
   - Device compass needs calibration
   - Move device in figure-8 pattern
   - Use device's built-in compass app first

3. **Sensor Quality**
   - Varies by device
   - Tablets generally more accurate than phones
   - High-end devices have better sensors

### Improving Accuracy

1. **Calibrate Compass**
   - Open device's Compass app
   - Follow calibration instructions
   - Repeat if readings seem off

2. **Optimal Environment**
   - Move away from metal/electronics
   - Go outdoors if possible
   - Remove magnetic accessories

3. **Proper Holding**
   - Keep device flat (horizontal)
   - Don't tilt or angle
   - Hold steady while reading

## Browser Compatibility

| Browser | iOS | Android | Desktop |
|---------|-----|---------|---------|
| Safari | ✅ (with permission) | N/A | ❌ |
| Chrome | ✅ (with permission) | ✅ | ❌ |
| Firefox | ✅ (with permission) | ✅ | ❌ |
| Edge | ✅ (with permission) | ✅ | ❌ |

## Security & Privacy

### HTTPS Required
- Device Orientation API requires secure context
- Must use `https://` or `localhost`
- Won't work on `http://` sites

### Permission Model
- **iOS**: Explicit user permission required
- **Android**: No permission needed (sensor access is allowed)
- Permission is per-origin (domain)
- Can be revoked in browser settings

### Data Privacy
- Compass data stays on device
- Not sent to any server
- Only used for local calculation
- No tracking or storage

## Troubleshooting

### Arrow Doesn't Move

**Check:**
1. Is live compass enabled? (Look for green banner)
2. Does device have magnetometer? (Check specs)
3. Is compass calibrated? (Use device Compass app)
4. Any magnetic interference? (Move away from metal)

### Inaccurate Readings

**Solutions:**
1. Calibrate compass (figure-8 motion)
2. Remove magnetic case
3. Move away from electronics
4. Hold device flat
5. Try outdoors

### Permission Denied (iOS)

**Fix:**
1. Go to Settings → Safari → Motion & Orientation Access
2. Enable for your site
3. Or: Clear site data and try again

### Not Working on Android

**Possible Causes:**
1. Device lacks magnetometer sensor
2. Sensor disabled in settings
3. Browser doesn't support API
4. Try Chrome browser

## Code Structure

### State Management

```typescript
const [qiblaDirection, setQiblaDirection] = useState<number>(0);
const [deviceHeading, setDeviceHeading] = useState<number | null>(null);
const [compassSupported, setCompassSupported] = useState<boolean>(false);
const [compassPermission, setCompassPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
```

### Lifecycle

```typescript
useEffect(() => {
  // Check support
  if ('DeviceOrientationEvent' in window) {
    setCompassSupported(true);
    
    // iOS: check if permission needed
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      setCompassPermission('prompt');
    } else {
      // Android: start immediately
      setCompassPermission('granted');
      startCompass();
    }
  }
  
  return () => stopCompass();
}, []);
```

### Event Handling

```typescript
const handleOrientation = (event: DeviceOrientationEvent) => {
  let heading = event.alpha;
  
  // iOS
  if (event.webkitCompassHeading) {
    heading = event.webkitCompassHeading;
  }
  // Android
  else if (event.alpha !== null) {
    heading = 360 - event.alpha;
  }
  
  if (heading !== null) {
    setDeviceHeading(heading);
  }
};
```

## Future Enhancements

Potential improvements:

1. **Compass Calibration UI**
   - Built-in calibration guide
   - Visual feedback during calibration
   - Accuracy indicator

2. **Augmented Reality**
   - Camera overlay
   - AR arrow in real world
   - Distance indicator

3. **Haptic Feedback**
   - Vibrate when facing Qibla
   - Intensity based on accuracy
   - Confirmation buzz

4. **Offline Support**
   - Cache Qibla calculations
   - Work without internet
   - Service worker integration

5. **Advanced Features**
   - Save favorite locations
   - Multiple Qibla methods
   - Prayer time integration
   - Notification when facing Qibla

## References

- [MDN: Device Orientation API](https://developer.mozilla.org/en-US/docs/Web/API/Device_orientation_events)
- [iOS DeviceOrientationEvent](https://developer.apple.com/documentation/webkitjs/deviceorientationevent)
- [Compass Calibration Guide](https://support.google.com/maps/answer/6145351)
