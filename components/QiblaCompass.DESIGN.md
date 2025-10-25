# QiblaCompass Design Documentation

## Visual Structure

```
                    N
                    ↑
        ┌───────────────────────┐
        │           │           │
        │           │           │
    W ──┤     ┌─────┐          ├── E
        │     │ 🕋  │  ← Kaaba icon
        │     └─────┘           │
        │        ↑              │
        │        │ Arrow        │
        │        │              │
        │        ●  Center      │
        │                       │
        └───────────────────────┘
                    ↓
                    S
```

## Component Hierarchy

1. **Background Circle**
   - Dark slate background with green border
   - Radius: 42% of compass size

2. **Tick Marks** (36 total)
   - Major ticks every 30° (longer)
   - Minor ticks every 10° (shorter)
   - Gray color with varying opacity

3. **Cardinal Directions** (N, S, E, W)
   - Positioned outside the circle
   - White text, bold font
   - Size: 12% of compass size

4. **Rotating Arrow Group** (rotates based on Qibla direction)
   - **Arrow Shaft**: Green line from center to 70% of radius
   - **Arrow Head**: Green triangle at 75% of radius
   - **Kaaba Icon**: At 85% of radius (arrow tip)
     - Green cube with door detail
     - Rotates with the arrow
     - Points toward Mecca

5. **Center Dot**
   - Small green circle
   - Marks the center point
   - Radius: 2% of compass size

## Rotation Behavior

The entire arrow group (shaft + head + Kaaba icon) rotates as one unit:
- Rotation center: compass center
- Rotation angle: Qibla direction in degrees
- Smooth transition: 0.5s ease-out

## Color Palette

| Element | Color | Purpose |
|---------|-------|---------|
| Background | `rgba(16, 24, 39, 0.8)` | Dark slate for contrast |
| Border | `rgba(74, 222, 128, 0.4)` | Green accent |
| Arrow | `rgba(74, 222, 128, 1)` | Bright green for visibility |
| Kaaba Fill | `rgba(34, 197, 94, 0.3)` | Semi-transparent green |
| Kaaba Stroke | `rgba(74, 222, 128, 1)` | Bright green outline |
| Cardinals | `rgba(226, 232, 240, 0.9)` | Light gray/white |
| Ticks | `rgba(148, 163, 184, 0.4-0.8)` | Gray with varying opacity |

## Responsive Sizing

The compass scales proportionally based on the `size` prop:

| Element | Size Calculation |
|---------|-----------------|
| Compass | `size` (default: 200px) |
| ViewBox Padding | `size * 0.15` |
| Radius | `size * 0.42` |
| Tick Radius | `size * 0.38` |
| Cardinal Radius | `size * 0.45` |
| Arrow Length | `radius * 0.7` |
| Kaaba Position | `radius * 0.85` |
| Kaaba Size | `size * 0.08` |
| Center Dot | `size * 0.02` |

## Kaaba Icon Details

The Kaaba icon is a simplified geometric representation:

```svg
┌──────────┐
│          │  ← Main cube (8% of compass size)
│   ┌──┐   │  ← Door (3.6% width, 4% height)
│   │  │   │
│   └──┘   │
└──────────┘
```

**Positioning:**
- Centered on the arrow line
- At 85% of the radius from center
- Rotates with the arrow
- Always points toward Mecca

**Styling:**
- Semi-transparent green fill (30% opacity)
- Bright green stroke (2px)
- Rounded corners (2px radius)
- Door has higher opacity (50%) for contrast

## Usage Example

```tsx
<QiblaCompass 
  direction={137}        // Degrees from North
  size={300}            // Compass size in pixels
  showDegrees={true}    // Show numeric degree value
  showLabel={true}      // Show directional label (SE, NW, etc.)
/>
```

## Accessibility

- **ARIA Label**: Describes direction in degrees and cardinal direction
- **Role**: `img` for screen readers
- **Color Contrast**: Meets WCAG AA standards
- **Visual Hierarchy**: Clear focal point (arrow + Kaaba)

## Animation

- **Rotation**: Smooth 0.5s ease-out transition
- **Trigger**: When `direction` prop changes
- **Transform Origin**: Center of compass
- **Performance**: GPU-accelerated CSS transform
