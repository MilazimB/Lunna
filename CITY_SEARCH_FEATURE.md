# City Search Feature

## Overview

The LocationInput component now supports **searching by city name** instead of entering coordinates. Simply type a city name and select from the results!

## How to Use

### Step 1: Open Location Editor
1. Find the LocationInput at the top of the page
2. Click the **"Edit" button** (pencil icon ✏️)

### Step 2: Search for Your City
1. Type your city name in the search box
2. Examples:
   - `New York`
   - `London`
   - `Tokyo`
   - `Dubai`
   - `Mecca`
3. Wait for results to appear (auto-searches as you type)

### Step 3: Select Your Location
1. A dropdown appears with matching locations
2. Each result shows:
   - Full location name (City, State, Country)
   - Coordinates
3. Click on your desired location
4. Done! Location is updated automatically

## Features

### Auto-Complete Search
- Searches as you type (after 2 characters)
- Shows up to 5 results
- Includes cities, towns, villages worldwide
- Shows full address for clarity

### Smart Results
Each search result displays:
```
New York, New York, United States
40.7128°N, 74.0060°W
```

### Fallback to Coordinates
- Can't find your city? 
- Use the coordinate inputs below the search
- Both methods work!

## Search Examples

### Major Cities
```
Search: "New York"
Results:
  → New York, New York, United States
  → New York, Texas, United States
  → New York Mills, Minnesota, United States
```

### International Cities
```
Search: "London"
Results:
  → London, Greater London, England, United Kingdom
  → London, Ontario, Canada
  → London, Kentucky, United States
```

### Religious Sites
```
Search: "Mecca"
Results:
  → Mecca, Makkah Province, Saudi Arabia
  
Search: "Medina"
Results:
  → Medina, Al Madinah Province, Saudi Arabia
```

### Small Towns
```
Search: "Cambridge"
Results:
  → Cambridge, Cambridgeshire, England, United Kingdom
  → Cambridge, Massachusetts, United States
  → Cambridge, Ontario, Canada
```

## Search Tips

### Be Specific
- **Good**: "Paris, France"
- **Better**: "Paris"
- **Best**: Just "Paris" (shows all matches)

### Include Country (Optional)
- "Tokyo, Japan"
- "Cairo, Egypt"
- "Istanbul, Turkey"

### Try Different Spellings
- "Mumbai" or "Bombay"
- "Beijing" or "Peking"
- "Istanbul" or "Constantinople"

### Use English Names
- The search works best with English city names
- International names also work
- Try both if unsure

## Visual Interface

### Search Box
```
┌─────────────────────────────────────────────────┐
│ Search by City Name                             │
│ ┌─────────────────────────────────────────────┐ │
│ │ New York                              🔄    │ │
│ └─────────────────────────────────────────────┘ │
│ ▼ Results:                                      │
│ ┌─────────────────────────────────────────────┐ │
│ │ New York, New York, United States           │ │
│ │ 40.7128°N, 74.0060°W                        │ │
│ ├─────────────────────────────────────────────┤ │
│ │ New York, Texas, United States              │ │
│ │ 32.9512°N, 94.3535°W                        │ │
│ └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

### Loading State
- Spinner appears while searching
- Shows in the search box (right side)
- Disappears when results load

### No Results
- If no matches found, dropdown doesn't appear
- Try different spelling or use coordinates

## Technical Details

### Geocoding API
- Uses **OpenStreetMap Nominatim API**
- Free, no API key required
- Worldwide coverage
- Respects usage limits

### Search Behavior
- **Debounced**: Waits 500ms after typing stops
- **Minimum**: 2 characters to search
- **Limit**: Shows top 5 results
- **Auto-complete**: Updates as you type

### Data Returned
```javascript
{
  display_name: "New York, New York, United States",
  lat: "40.7127281",
  lon: "-74.0060152",
  address: {
    city: "New York",
    state: "New York",
    country: "United States"
  }
}
```

## Advantages Over Coordinates

### User-Friendly
- ✅ No need to know coordinates
- ✅ Just type city name
- ✅ Familiar interface
- ✅ Works like Google Maps

### Accurate
- ✅ Official coordinates from OpenStreetMap
- ✅ Verified locations
- ✅ Up-to-date data
- ✅ Includes small towns

### Fast
- ✅ Auto-complete as you type
- ✅ Quick results
- ✅ No manual calculation
- ✅ One-click selection

## Comparison

### Before (Coordinates Only)
```
1. Find coordinates on Google Maps
2. Copy latitude
3. Copy longitude
4. Paste into two separate fields
5. Click Update
```

### After (City Search)
```
1. Type city name
2. Click result
3. Done!
```

## Common Use Cases

### Traveling
- Search destination city
- Get Qibla direction for travel
- Plan prayer times ahead

### Multiple Locations
- Quickly switch between cities
- Compare Qibla directions
- Check different time zones

### Sharing
- Easy to tell others: "Search for Dubai"
- No need to share coordinates
- Universal city names

## Troubleshooting

### City Not Found
**Try:**
- Different spelling
- Add country name
- Use English name
- Try nearby major city
- Use coordinates as fallback

### Wrong City Selected
**Solution:**
- Look at full address in results
- Check coordinates shown
- Select more specific result
- Add state/country to search

### Search Not Working
**Check:**
- Internet connection
- Typed at least 2 characters
- Wait for spinner to finish
- Try refreshing page

### Multiple Results
**Choose:**
- Look at country/state
- Check coordinates
- Select most specific match
- Hover to see full details

## Privacy & Data

### What's Sent
- Only your search query
- No personal information
- No location tracking
- No account required

### What's Stored
- Nothing stored on servers
- Results cached temporarily in browser
- Cleared when you close tab
- No search history saved

### API Usage
- Free OpenStreetMap service
- Respects fair use policy
- No API key needed
- No rate limiting for normal use

## Future Enhancements

Potential improvements:

1. **Recent Searches**
   - Remember last 5 searches
   - Quick access to recent cities
   - Clear history option

2. **Popular Cities**
   - Preset list of major cities
   - One-click selection
   - Organized by region

3. **Nearby Cities**
   - Show cities near current location
   - Distance indicator
   - Sort by proximity

4. **Favorites**
   - Star favorite cities
   - Quick access list
   - Sync across devices

5. **Map View**
   - Visual city selection
   - Click on map
   - See location preview

## Examples by Region

### Middle East
- Mecca, Saudi Arabia
- Medina, Saudi Arabia
- Dubai, UAE
- Istanbul, Turkey
- Cairo, Egypt

### Asia
- Tokyo, Japan
- Beijing, China
- Mumbai, India
- Jakarta, Indonesia
- Bangkok, Thailand

### Europe
- London, UK
- Paris, France
- Berlin, Germany
- Rome, Italy
- Madrid, Spain

### Americas
- New York, USA
- Los Angeles, USA
- Toronto, Canada
- Mexico City, Mexico
- São Paulo, Brazil

### Africa
- Cairo, Egypt
- Lagos, Nigeria
- Johannesburg, South Africa
- Nairobi, Kenya
- Casablanca, Morocco

### Oceania
- Sydney, Australia
- Melbourne, Australia
- Auckland, New Zealand
- Perth, Australia
- Brisbane, Australia

## Keyboard Shortcuts

- **Type**: Start searching immediately
- **↓ Arrow**: Navigate results down
- **↑ Arrow**: Navigate results up
- **Enter**: Select highlighted result
- **Esc**: Close results dropdown

## Accessibility

- **Screen Readers**: Full support
- **Keyboard Navigation**: Complete
- **High Contrast**: Compatible
- **Focus Indicators**: Clear
- **ARIA Labels**: Proper

## Performance

- **Search Speed**: < 1 second
- **Debounce**: 500ms delay
- **Results**: Instant display
- **Selection**: Immediate update
- **No Lag**: Smooth experience
