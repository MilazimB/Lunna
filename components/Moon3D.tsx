import React from 'react';

interface Moon3DProps {
  phaseAngle: number; // 0-360 degrees
  fraction: number;   // 0-1 (illumination fraction)
  size: number;
  className?: string;
}

const Moon3D: React.FC<Moon3DProps> = ({ phaseAngle, fraction, size, className }) => {
  const radius = size / 2;

  // Normalize phase angle to 0-360 range
  const normalizedPhase = ((phaseAngle % 360) + 360) % 360;

  // Determine if we're in waxing or waning phase
  const isWaxing = normalizedPhase >= 0 && normalizedPhase <= 180;

  // Generate the illuminated portion path
  // Using mathematical approach: the terminator is an ellipse
  const generateLitPath = (): string => {
    if (fraction < 0.001) return ''; // No lit portion
    if (fraction > 0.999) {
      // Full moon - entire circle
      return `M ${radius} 2 A ${radius - 2} ${radius - 2} 0 1 1 ${radius} ${size - 2} A ${radius - 2} ${radius - 2} 0 1 1 ${radius} 2`;
    }

    // For crescents and gibbous phases
    // Calculate the terminator ellipse semi-minor axis
    const angle = Math.acos(1 - 2 * fraction);
    const terminatorX = (radius - 2) * Math.cos(angle);

    if (isWaxing) {
      // Waxing: lit on the right side
      return `M ${radius} 2
              A ${radius - 2} ${radius - 2} 0 1 1 ${radius} ${size - 2}
              A ${Math.abs(terminatorX)} ${radius - 2} 0 1 0 ${radius} 2`;
    } else {
      // Waning: lit on the left side
      return `M ${radius} 2
              A ${Math.abs(terminatorX)} ${radius - 2} 0 1 0 ${radius} ${size - 2}
              A ${radius - 2} ${radius - 2} 0 1 1 ${radius} 2`;
    }
  };
  
  // Generate unique IDs for gradients
  const moonId = `moon3d-${Math.random().toString(36).slice(2, 11)}`;
  const shadowId = `shadow3d-${Math.random().toString(36).slice(2, 11)}`;
  const lightId = `light3d-${Math.random().toString(36).slice(2, 11)}`;
  const craterPatternId = `craters3d-${Math.random().toString(36).slice(2, 11)}`;
  
  // Create crater data for surface texture
  const craters = [
    { x: 0.2, y: -0.3, size: 0.08, intensity: 0.3 },
    { x: -0.4, y: 0.1, size: 0.06, intensity: 0.25 },
    { x: 0.3, y: 0.4, size: 0.05, intensity: 0.2 },
    { x: -0.2, y: -0.1, size: 0.04, intensity: 0.15 },
    { x: 0.5, y: 0.2, size: 0.03, intensity: 0.1 },
    { x: -0.1, y: 0.3, size: 0.035, intensity: 0.12 },
    { x: 0.1, y: -0.4, size: 0.045, intensity: 0.18 },
  ];

  return (
    <div 
      className={`relative ${className}`}
      style={{ 
        width: size, 
        height: size,
        perspective: '1000px'
      }}
    >
      <div
        className="relative w-full h-full"
        style={{
          transformStyle: 'preserve-3d',
          transform: 'rotateX(5deg) rotateY(-10deg)',
        }}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="absolute inset-0"
          style={{
            filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))',
          }}
        >
          <defs>
            {/* Base moon surface gradient */}
            <radialGradient id={moonId} cx="0.35" cy="0.35" r="0.65">
              <stop offset="0%" stopColor="#f7f3e9" />
              <stop offset="20%" stopColor="#f0ebe1" />
              <stop offset="50%" stopColor="#e8dcc6" />
              <stop offset="80%" stopColor="#d4c5a9" />
              <stop offset="100%" stopColor="#b8a082" />
            </radialGradient>
            
            {/* Illuminated surface gradient */}
            <radialGradient id={lightId} cx="0.3" cy="0.3" r="0.7">
              <stop offset="0%" stopColor="#fffef7" />
              <stop offset="30%" stopColor="#fef9e7" />
              <stop offset="60%" stopColor="#fef3c7" />
              <stop offset="100%" stopColor="#f59e0b" />
            </radialGradient>
            
            {/* Shadow gradient */}
            <radialGradient id={shadowId} cx="0.7" cy="0.7" r="0.8">
              <stop offset="0%" stopColor="#4a5568" />
              <stop offset="40%" stopColor="#2d3748" />
              <stop offset="70%" stopColor="#1a202c" />
              <stop offset="100%" stopColor="#0f1419" />
            </radialGradient>
            
            {/* Crater pattern for surface texture */}
            <pattern id={craterPatternId} x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
              <circle cx="15" cy="15" r="1.5" fill="#000000" opacity="0.1"/>
              <circle cx="8" cy="22" r="0.8" fill="#000000" opacity="0.08"/>
              <circle cx="22" cy="8" r="1" fill="#000000" opacity="0.06"/>
              <circle cx="5" cy="5" r="0.6" fill="#000000" opacity="0.05"/>
              <circle cx="25" cy="25" r="0.9" fill="#000000" opacity="0.07"/>
            </pattern>
            
            {/* 3D lighting effect */}
            <filter id="lighting3d" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="blur"/>
              <feSpecularLighting result="specOut" in="blur" specularConstant="1.5" specularExponent="20" lightingColor="white">
                <fePointLight x="-50" y="-50" z="200"/>
              </feSpecularLighting>
              <feComposite in="specOut" in2="SourceAlpha" operator="in" result="specOut2"/>
              <feComposite in="SourceGraphic" in2="specOut2" operator="arithmetic" k1="0" k2="1" k3="1" k4="0"/>
            </filter>
            
            {/* Glow effect */}
            <filter id="glow3d" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Base moon circle */}
          <circle
            cx={radius}
            cy={radius}
            r={radius - 2}
            fill={`url(#${moonId})`}
          />
          
          {/* Surface texture */}
          <circle
            cx={radius}
            cy={radius}
            r={radius - 2}
            fill={`url(#${craterPatternId})`}
            opacity="0.4"
          />
          
          {/* Individual craters for more detail */}
          {craters.map((crater, index) => (
            <g key={index}>
              <circle
                cx={radius + crater.x * radius}
                cy={radius + crater.y * radius}
                r={crater.size * radius}
                fill="#000000"
                opacity={crater.intensity}
              />
              {/* Crater rim highlight */}
              <circle
                cx={radius + crater.x * radius - crater.size * radius * 0.3}
                cy={radius + crater.y * radius - crater.size * radius * 0.3}
                r={crater.size * radius * 0.8}
                fill="none"
                stroke="#ffffff"
                strokeWidth="0.5"
                opacity={crater.intensity * 0.3}
              />
            </g>
          ))}
          
          {/* Shadow portion - always show the dark part */}
          <circle
            cx={radius}
            cy={radius}
            r={radius - 2}
            fill={`url(#${shadowId})`}
            opacity="0.9"
          />
          
          {/* Illuminated portion with enhanced lighting */}
          {fraction > 0.001 && (
            <path
              d={generateLitPath()}
              fill={`url(#${lightId})`}
              filter="url(#lighting3d)"
            />
          )}
          

          
          {/* 3D highlight on the illuminated edge */}
          {fraction > 0.1 && (
            <ellipse
              cx={radius + (isWaxing ? radius * 0.7 : -radius * 0.7)}
              cy={radius}
              rx={radius * 0.15}
              ry={radius * 0.8}
              fill="url(#lightId)"
              opacity="0.3"
              filter="url(#glow3d)"
            />
          )}
          
          {/* Atmospheric glow around the moon */}
          <circle
            cx={radius}
            cy={radius}
            r={radius + 3}
            fill="none"
            stroke="#fbbf24"
            strokeWidth="1"
            opacity="0.2"
            filter="url(#glow3d)"
          />
        </svg>
        
        {/* Phase information overlay */}
        <div 
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full mt-2"
          style={{ fontSize: size * 0.08 }}
        >
          <div className="text-center text-slate-300">
            <div className="font-mono text-accent-blue">
              {(fraction * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-slate-400 mt-1">
              illuminated
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Moon3D;