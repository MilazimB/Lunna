import React from 'react';

interface MoonPhaseIconProps {
  phaseAngle: number; // 0-360 degrees
  fraction: number;   // 0-1 (illumination fraction)
  size: number;
  className?: string;
}

const MoonPhaseIcon: React.FC<MoonPhaseIconProps> = ({ phaseAngle, fraction, size, className }) => {
  const R = size / 2;
  
  // Generate unique IDs for gradients to avoid conflicts
  const gradientId = `moonGradient-${Math.random().toString(36).substring(2, 11)}`;
  const shadowGradientId = `shadowGradient-${Math.random().toString(36).substring(2, 11)}`;
  const surfacePatternId = `surfacePattern-${Math.random().toString(36).substring(2, 11)}`;
  
  // Calculate the correct moon phase shape
  // Phase angle: 0° = New Moon, 90° = First Quarter, 180° = Full Moon, 270° = Last Quarter
  // For waning crescent (like 335.2°), we need to show a thin crescent on the left side
  
  let litPath = '';

  if (fraction < 0.001) {
    // Essentially New Moon - no lit path
    litPath = '';
  } else if (fraction > 0.999) {
    // Full Moon - entire circle
    litPath = `M 0,-${R} A ${R},${R} 0 1,1 0,${R} A ${R},${R} 0 1,1 0,-${R}`;
  } else {
    // Determine if we're in waxing or waning phase
    const isWaxing = phaseAngle >= 0 && phaseAngle < 180;

    // Calculate the terminator position using the phase angle
    // The terminator is the line between lit and dark portions
    const angle = Math.acos(1 - 2 * fraction);
    const terminatorX = R * Math.cos(angle);
    const terminatorRadius = Math.abs(terminatorX);

    if (isWaxing) {
      // Waxing phases (0° to 180°) - lit on the right side
      if (fraction < 0.5) {
        // Waxing crescent: thin crescent on right
        // Arc from top to bottom on outer circle, then back via inner ellipse
        litPath = `M 0,-${R} A ${R},${R} 0 0,1 0,${R} A ${terminatorRadius},${R} 0 0,0 0,-${R} Z`;
      } else {
        // Waxing gibbous: most of moon is lit
        // Large arc on outer circle, then back via inner ellipse
        litPath = `M 0,-${R} A ${R},${R} 0 1,1 0,${R} A ${terminatorRadius},${R} 0 0,0 0,-${R} Z`;
      }
    } else {
      // Waning phases (180° to 360°) - lit on the left side
      if (fraction > 0.5) {
        // Waning gibbous: most of moon is lit
        litPath = `M 0,-${R} A ${terminatorRadius},${R} 0 0,1 0,${R} A ${R},${R} 0 1,1 0,-${R} Z`;
      } else {
        // Waning crescent: thin crescent on left
        litPath = `M 0,-${R} A ${terminatorRadius},${R} 0 0,1 0,${R} A ${R},${R} 0 0,0 0,-${R} Z`;
      }
    }
  }
  
  // Generate some crater-like features for surface texture
  const craters = [
    { cx: R * 0.3, cy: -R * 0.2, r: R * 0.08, opacity: 0.15 },
    { cx: -R * 0.4, cy: R * 0.1, r: R * 0.06, opacity: 0.12 },
    { cx: R * 0.1, cy: R * 0.4, r: R * 0.05, opacity: 0.1 },
    { cx: -R * 0.2, cy: -R * 0.3, r: R * 0.04, opacity: 0.08 },
    { cx: R * 0.5, cy: R * 0.2, r: R * 0.03, opacity: 0.06 },
  ];

  // Handle edge cases for a perfect render
  if (fraction < 0.01) { // New Moon
    return (
      <svg width={size} height={size} viewBox={`-${R} -${R} ${size} ${size}`} className={className} role="img" aria-label="New Moon">
        <defs>
          <radialGradient id={shadowGradientId} cx="0.3" cy="0.3" r="0.8">
            <stop offset="0%" stopColor="#2d3748" />
            <stop offset="70%" stopColor="#1a202c" />
            <stop offset="100%" stopColor="#0f1419" />
          </radialGradient>
          <filter id="moonShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="2" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.3"/>
          </filter>
        </defs>
        <circle
          cx="0"
          cy="0"
          r={R}
          fill={`url(#${shadowGradientId})`}
          filter="url(#moonShadow)"
        />
      </svg>
    );
  }

  if (fraction > 0.99) { // Full Moon
    return (
      <svg width={size} height={size} viewBox={`-${R} -${R} ${size} ${size}`} className={className} role="img" aria-label="Full Moon">
        <defs>
          <radialGradient id={gradientId} cx="0.3" cy="0.3" r="0.8">
            <stop offset="0%" stopColor="#fef7cd" />
            <stop offset="30%" stopColor="#fef3c7" />
            <stop offset="70%" stopColor="#fde68a" />
            <stop offset="100%" stopColor="#f59e0b" />
          </radialGradient>
          <pattern id={surfacePatternId} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="1" fill="#000000" opacity="0.1"/>
            <circle cx="5" cy="15" r="0.5" fill="#000000" opacity="0.08"/>
            <circle cx="15" cy="5" r="0.8" fill="#000000" opacity="0.06"/>
          </pattern>
          <filter id="moonGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <circle 
          cx="0" 
          cy="0" 
          r={R} 
          fill={`url(#${gradientId})`}
          filter="url(#moonGlow)"
        />
        <circle cx="0" cy="0" r={R} fill={`url(#${surfacePatternId})`} />
        {craters.map((crater, index) => (
          <circle
            key={index}
            cx={crater.cx}
            cy={crater.cy}
            r={crater.r}
            fill="#000000"
            opacity={crater.opacity}
          />
        ))}
      </svg>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`-${R} -${R} ${size} ${size}`}
      className={className}
      aria-label={`Moon phase with illumination of ${(fraction * 100).toFixed(0)}%`}
      role="img"
    >
      <defs>
        {/* Gradient for the lit portion */}
        <radialGradient id={gradientId} cx="0.3" cy="0.3" r="0.8">
          <stop offset="0%" stopColor="#fef7cd" />
          <stop offset="30%" stopColor="#fef3c7" />
          <stop offset="70%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#f59e0b" />
        </radialGradient>
        
        {/* Gradient for the shadow portion */}
        <radialGradient id={shadowGradientId} cx="0.3" cy="0.3" r="0.8">
          <stop offset="0%" stopColor="#2d3748" />
          <stop offset="70%" stopColor="#1a202c" />
          <stop offset="100%" stopColor="#0f1419" />
        </radialGradient>
        
        {/* Surface texture pattern */}
        <pattern id={surfacePatternId} x="0" y="0" width="15" height="15" patternUnits="userSpaceOnUse">
          <circle cx="7" cy="7" r="0.8" fill="#000000" opacity="0.1"/>
          <circle cx="3" cy="11" r="0.4" fill="#000000" opacity="0.08"/>
          <circle cx="11" cy="3" r="0.6" fill="#000000" opacity="0.06"/>
        </pattern>
        
        {/* Glow effect with edge softening */}
        <filter id="moonGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        
        {/* Clip path for clean circular edge */}
        <clipPath id="moonClip">
          <circle cx="0" cy="0" r={R} />
        </clipPath>
      </defs>
      
      {/* Base shadow moon circle */}
      <circle
        cx="0"
        cy="0"
        r={R}
        fill={`url(#${shadowGradientId})`}
        stroke="none"
        clipPath="url(#moonClip)"
      />

      {/* Surface texture on shadow */}
      <circle cx="0" cy="0" r={R} fill={`url(#${surfacePatternId})`} opacity="0.3" stroke="none" clipPath="url(#moonClip)" />
      
      {/* Lit part with gradient and glow - only render if there's a path */}
      {litPath && (
        <>
          <path
            d={litPath}
            fill={`url(#${gradientId})`}
            filter="url(#moonGlow)"
            stroke="none"
            clipPath="url(#moonClip)"
            style={{ shapeRendering: 'geometricPrecision' }}
          />

          {/* Surface texture on lit part */}
          <path d={litPath} fill={`url(#${surfacePatternId})`} opacity="0.4" stroke="none" clipPath="url(#moonClip)" />

          {/* Craters visible on lit portion */}
          {craters.map((crater, index) => (
            <circle
              key={index}
              cx={crater.cx}
              cy={crater.cy}
              r={crater.r}
              fill="#000000"
              opacity={crater.opacity * 0.7}
              style={{
                clipPath: `path('${litPath}')`
              }}
            />
          ))}
        </>
      )}
    </svg>
  );
};

export default MoonPhaseIcon;
