# Next Prayer Countdown Feature

## Changes Made

### Before
- Countdown timer showed on all future prayer cards
- Small, subtle display
- Updated every minute

### After
- Countdown timer **only shows on the NEXT prayer card**
- Large, prominent display with green highlight
- Updates every second for accuracy
- Shows hours, minutes, and seconds

## Visual Design

### Regular Prayer Card (No Countdown)
```
┌─────────────────────────────────────┐
│ Dhuhr                               │
│ 12:45 PM                            │
│ Mon, Jan 15                         │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 📿 Sunnah        4 Rak'ah       │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ 🤲 Optional      2 Rak'ah       │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Calculation Method:                 │
│ Muslim World League                 │
└─────────────────────────────────────┘
```

### Next Prayer Card (With Countdown)
```
┌─────────────────────────────────────┐
│ Fajr                          NEXT  │
│ 5:30 AM                             │
│ Mon, Jan 15                         │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 🕐 Time remaining    2h 15m 30s │ │ ← Prominent countdown
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 📿 Sunnah        2 Rak'ah       │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Calculation Method:                 │
│ Muslim World League                 │
└─────────────────────────────────────┘
```

## Countdown Display Formats

### More than 1 hour
```
┌─────────────────────────────────────┐
│ 🕐 Time remaining    2h 15m 30s     │
└─────────────────────────────────────┘
```

### Less than 1 hour
```
┌─────────────────────────────────────┐
│ 🕐 Time remaining    45m 20s        │
└─────────────────────────────────────┘
```

### Less than 1 minute
```
┌─────────────────────────────────────┐
│ 🕐 Time remaining    30s            │
└─────────────────────────────────────┘
```

### Prayer time arrived
```
┌─────────────────────────────────────┐
│ 🕐 Time remaining    Now            │
└─────────────────────────────────────┘
```

## Technical Details

### Update Frequency
- **Next Prayer**: Updates every **1 second** (1000ms)
- **Other Prayers**: No countdown shown

### Conditional Rendering
```typescript
// Only calculate countdown if this is the next prayer
React.useEffect(() => {
  if (!isNext) {
    setTimeUntil('');
    return;
  }
  // ... countdown logic
}, [prayer.time, isNext]);
```

### Display Logic
```typescript
// Only render countdown for next prayer
{isNext && timeUntil && (
  <div className="mb-3 bg-green-400/20 border border-green-400/50 rounded-lg p-3">
    {/* Countdown display */}
  </div>
)}
```

## Styling

### Countdown Box
- **Background**: `bg-green-400/20` (light green, 20% opacity)
- **Border**: `border-green-400/50` (green, 50% opacity)
- **Padding**: `p-3` (12px)
- **Border Radius**: `rounded-lg`

### Text Colors
- **Label**: `text-green-400` (bright green)
- **Time**: `text-green-400` (bright green)
- **Font**: Monospace for time (`font-mono`)

### Icon
- Clock icon (⏰)
- Size: `w-5 h-5`
- Color: `text-green-400`

## Benefits

### User Experience
✅ **Clear Focus** - Immediately see next prayer
✅ **Less Clutter** - Other cards are cleaner
✅ **Prominent Display** - Can't miss the countdown
✅ **Real-time Updates** - Second-by-second accuracy
✅ **Visual Hierarchy** - Next prayer stands out

### Performance
✅ **Efficient** - Only one timer running (not 5)
✅ **Optimized** - Interval cleared when not needed
✅ **Responsive** - Updates smoothly

### Design
✅ **Consistent** - Matches "NEXT" badge styling
✅ **Accessible** - High contrast, clear text
✅ **Professional** - Clean, modern look

## Comparison

### Before (All Cards with Countdown)
```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ Fajr      NEXT  │  │ Dhuhr           │  │ Asr             │
│ 5:30 AM         │  │ 12:45 PM        │  │ 3:45 PM         │
│ 🕐 in 2h 15m    │  │ 🕐 in 9h 30m    │  │ 🕐 in 12h 45m   │
└─────────────────┘  └─────────────────┘  └─────────────────┘
     ↑ Cluttered with multiple countdowns
```

### After (Only Next Prayer)
```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ Fajr      NEXT  │  │ Dhuhr           │  │ Asr             │
│ 5:30 AM         │  │ 12:45 PM        │  │ 3:45 PM         │
│ ┌─────────────┐ │  │                 │  │                 │
│ │ 🕐 2h 15m 30s│ │  │ 📿 Sunnah: 4   │  │ 🤲 Optional: 4  │
│ └─────────────┘ │  │ 🤲 Optional: 2  │  │                 │
└─────────────────┘  └─────────────────┘  └─────────────────┘
     ↑ Clear focus on next prayer
```

## User Scenarios

### Scenario 1: Planning
**User**: "When is my next prayer?"
**Result**: Immediately see the highlighted card with countdown

### Scenario 2: Urgency
**User**: "How much time do I have?"
**Result**: Large, clear countdown shows exact time remaining

### Scenario 3: Multiple Prayers
**User**: "What are today's prayer times?"
**Result**: Clean view of all prayers without countdown clutter

### Scenario 4: Last Minute
**User**: Prayer time approaching
**Result**: Second-by-second countdown creates urgency

## Accessibility

### Screen Readers
- Countdown announced as "Time remaining: 2 hours 15 minutes 30 seconds"
- "NEXT" badge clearly identifies upcoming prayer
- All elements properly labeled

### Keyboard Navigation
- Card is focusable
- Tab order is logical
- Focus indicators visible

### Visual
- High contrast (green on dark background)
- Large text for countdown
- Clear visual hierarchy

## Mobile Responsiveness

### Small Screens
- Countdown box full width
- Stacked layout
- Touch-friendly size

### Medium Screens
- Comfortable spacing
- Readable text sizes
- Balanced layout

### Large Screens
- Grid layout maintained
- Countdown prominent but not overwhelming
- Clean, professional appearance

## Edge Cases Handled

### Prayer Time Passed
- Countdown shows "Now"
- Next prayer becomes current
- Timer moves to next upcoming prayer

### Less Than 1 Minute
- Shows seconds only: "30s"
- Updates every second
- Creates urgency

### Exactly at Prayer Time
- Shows "Now"
- Visual indication to pray
- Smooth transition

### No Future Prayers
- Last prayer of day shows no countdown
- Clean card display
- Waits for next day

## Future Enhancements

Potential improvements:

1. **Audio Alert**
   - Sound when countdown reaches 0
   - Customizable alert tones

2. **Vibration**
   - Haptic feedback on mobile
   - Gentle reminder

3. **Color Change**
   - Yellow when < 10 minutes
   - Red when < 5 minutes
   - Progressive urgency

4. **Notification**
   - Browser notification
   - Customizable timing
   - "5 minutes until Fajr"

5. **Animation**
   - Pulse effect when < 1 minute
   - Smooth transitions
   - Attention-grabbing

## Code Structure

### State Management
```typescript
const [timeUntil, setTimeUntil] = React.useState<string>('');
```

### Effect Hook
```typescript
React.useEffect(() => {
  if (!isNext) {
    setTimeUntil('');
    return;
  }
  
  const updateCountdown = () => {
    // Calculate time difference
    // Format display string
  };
  
  updateCountdown();
  const interval = setInterval(updateCountdown, 1000);
  
  return () => clearInterval(interval);
}, [prayer.time, isNext]);
```

### Conditional Render
```typescript
{isNext && timeUntil && (
  <div className="countdown-box">
    <span>Time remaining</span>
    <span>{timeUntil}</span>
  </div>
)}
```

## Testing Checklist

- [ ] Countdown only shows on next prayer
- [ ] Updates every second
- [ ] Shows hours, minutes, seconds correctly
- [ ] Transitions smoothly when prayer time passes
- [ ] "Now" appears at prayer time
- [ ] No countdown on past prayers
- [ ] No countdown on future prayers (except next)
- [ ] Green highlight matches "NEXT" badge
- [ ] Responsive on all screen sizes
- [ ] Accessible to screen readers

## Conclusion

The countdown timer is now focused exclusively on the next prayer, making it:
- **More useful** - Shows only relevant information
- **Less cluttered** - Cleaner card design
- **More prominent** - Can't miss the next prayer
- **More accurate** - Second-by-second updates
- **Better UX** - Clear visual hierarchy

This creates a better prayer companion that helps users stay on time without overwhelming them with information.
