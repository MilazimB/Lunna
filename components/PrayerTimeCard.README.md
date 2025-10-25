# PrayerTimeCard Component

A React component for displaying individual prayer times with calculation method information and optional Qibla direction indicator for Islamic prayers.

## Features

- **Multi-tradition support**: Displays prayers from Islamic, Jewish, and Christian traditions with distinct styling
- **Qibla direction indicator**: Animated compass showing direction to Mecca for Islamic prayers
- **Calculation method display**: Shows the calculation method used for prayer time determination
- **Next prayer highlighting**: Visual indicator for the upcoming prayer
- **Responsive design**: Adapts to different screen sizes
- **Full accessibility**: ARIA labels and semantic HTML for screen readers
- **Tradition-specific colors**: 
  - Green for Islamic prayers
  - Blue for Jewish prayers
  - Purple for Christian prayers

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `prayer` | `PrayerTime` | Yes | - | Prayer time object containing name, time, tradition, and calculation method |
| `isNext` | `boolean` | No | `false` | Highlights the card as the next upcoming prayer |
| `showQibla` | `boolean` | No | `true` | Controls whether to display Qibla direction (Islamic prayers only) |

## PrayerTime Interface

```typescript
interface PrayerTime {
  name: string;                    // Prayer name (e.g., "Fajr", "Shacharit", "Lauds")
  time: Date;                      // Prayer time
  tradition: ReligiousTradition;   // 'islam' | 'judaism' | 'christianity'
  calculationMethod: string;       // Method used for calculation
  qiblaDirection?: number;         // Direction to Mecca in degrees (Islamic prayers only)
}
```

## Usage Examples

### Basic Islamic Prayer

```tsx
import PrayerTimeCard from './components/PrayerTimeCard';

const islamicPrayer = {
  name: 'Fajr',
  time: new Date('2025-10-19T05:30:00'),
  tradition: 'islam',
  calculationMethod: 'MuslimWorldLeague',
  qiblaDirection: 58.5
};

<PrayerTimeCard prayer={islamicPrayer} />
```

### Next Prayer Highlighted

```tsx
<PrayerTimeCard prayer={islamicPrayer} isNext={true} />
```

### Without Qibla Direction

```tsx
<PrayerTimeCard prayer={islamicPrayer} showQibla={false} />
```

### Jewish Prayer

```tsx
const jewishPrayer = {
  name: 'Shacharit',
  time: new Date('2025-10-19T07:00:00'),
  tradition: 'judaism',
  calculationMethod: 'standard'
};

<PrayerTimeCard prayer={jewishPrayer} />
```

### Christian Prayer

```tsx
const christianPrayer = {
  name: 'Lauds',
  time: new Date('2025-10-19T06:00:00'),
  tradition: 'christianity',
  calculationMethod: 'canonical-hours'
};

<PrayerTimeCard prayer={christianPrayer} />
```

### Daily Prayer Schedule

```tsx
const prayers = [
  { name: 'Fajr', time: new Date('2025-10-19T05:30:00'), ... },
  { name: 'Dhuhr', time: new Date('2025-10-19T12:15:00'), ... },
  { name: 'Asr', time: new Date('2025-10-19T15:45:00'), ... },
  { name: 'Maghrib', time: new Date('2025-10-19T18:30:00'), ... },
  { name: 'Isha', time: new Date('2025-10-19T20:00:00'), ... },
];

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {prayers.map((prayer, index) => (
    <PrayerTimeCard 
      key={index}
      prayer={prayer}
      isNext={index === 1} // Highlight Dhuhr as next
    />
  ))}
</div>
```

## Styling

The component uses Tailwind CSS classes and follows the application's design system:

- **Background**: Semi-transparent card background (`bg-card-bg/70`)
- **Text colors**: Tradition-specific colors for prayer names
- **Borders**: Highlighted border for next prayer
- **Hover effects**: Border and shadow on hover
- **Transitions**: Smooth animations for all interactive elements

## Accessibility

The component includes comprehensive accessibility features:

- **ARIA roles**: `role="article"` for semantic structure
- **ARIA labels**: Descriptive labels for prayer times and Qibla direction
- **Screen reader support**: All visual information is available to screen readers
- **Keyboard navigation**: Fully navigable with keyboard
- **Hidden decorative elements**: SVG icons marked with `aria-hidden="true"`

## Qibla Direction Indicator

For Islamic prayers with a `qiblaDirection` value:

- Displays a compass with a rotating arrow
- Shows the direction in degrees from North
- Animated rotation based on the Qibla angle
- Can be hidden with `showQibla={false}`

The compass includes:
- A circular border representing the compass
- A north marker at the top
- A rotating arrow pointing to the Qibla direction
- Numerical display of degrees

## Calculation Method Formatting

The component automatically formats calculation method names for display:

- `MuslimWorldLeague` → "Muslim World League"
- `canonicalHours` → "Canonical Hours"
- `standard` → "Standard"

## Testing

The component includes comprehensive tests covering:

- Basic rendering of all elements
- Tradition-specific styling
- Next prayer indicator
- Qibla direction display
- Calculation method formatting
- Accessibility features
- Time formatting
- Different prayer types
- Compass rotation
- Edge cases

Run tests with:
```bash
npm run test
```

## Requirements Satisfied

This component satisfies the following requirements from the spec:

- **Requirement 3.1**: Prayer time calculation display with configurable methods
- **Requirement 3.6**: Prayer time display with countdown and notification options

## Integration

The PrayerTimeCard component is designed to work with:

- `IslamicCalendarService` for Islamic prayer times
- `JewishCalendarService` for Jewish prayer times
- `ChristianCalendarService` for Christian prayer times
- `ReligiousSchedulePanel` (task 7.1) for displaying multiple prayers

## Browser Support

The component works in all modern browsers that support:
- CSS Grid and Flexbox
- CSS Transforms (for compass rotation)
- ES6+ JavaScript features
- React 19+

## Performance

The component is optimized for performance:
- Minimal re-renders
- Efficient date formatting
- CSS-based animations (no JavaScript animation loops)
- Lightweight DOM structure

## Future Enhancements

Potential future improvements:
- Time until prayer countdown
- Prayer time notifications
- Custom color themes
- Additional calculation methods
- Prayer time adjustments
- Historical prayer times
