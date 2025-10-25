import React from 'react';

interface QiblaCompassProps {
  /** Qibla direction in degrees from North (0-360) */
  direction: number;
  /** Size of the compass in pixels (default: 200) */
  size?: number;
  /** Whether to show the degree value (default: true) */
  showDegrees?: boolean;
  /** Whether to show the directional label (default: true) */
  showLabel?: boolean;
  /** Custom class name for styling */
  className?: string;
}

/**
 * QiblaCompass component displays a professional compass visualization
 * showing the direction to Mecca for Islamic prayer
 */
const QiblaCompass: React.FC<QiblaCompassProps> = ({
  direction,
  size = 200,
  showDegrees = true,
  showLabel = true,
  className = ''
}) => {
  /**
   * Get the cardinal/intercardinal direction label from degrees
   */
  const getDirectionLabel = (degrees: number): string => {
    const normalized = ((degrees % 360) + 360) % 360;
    
    if (normalized >= 337.5 || normalized < 22.5) return 'N';
    if (normalized >= 22.5 && normalized < 67.5) return 'NE';
    if (normalized >= 67.5 && normalized < 112.5) return 'E';
    if (normalized >= 112.5 && normalized < 157.5) return 'SE';
    if (normalized >= 157.5 && normalized < 202.5) return 'S';
    if (normalized >= 202.5 && normalized < 247.5) return 'SW';
    if (normalized >= 247.5 && normalized < 292.5) return 'W';
    if (normalized >= 292.5 && normalized < 337.5) return 'NW';
    return 'N';
  };

  const directionLabel = getDirectionLabel(direction);
  const normalizedDirection = ((direction % 360) + 360) % 360;

  // Calculate responsive sizing with padding to prevent cutoff
  const compassSize = size;
  const padding = size * 0.15; // Add padding for labels
  const viewBoxSize = compassSize + padding * 2;
  const centerX = viewBoxSize / 2;
  const centerY = viewBoxSize / 2;
  const radius = compassSize * 0.42;
  const tickRadius = compassSize * 0.38;
  const cardinalRadius = compassSize * 0.45; // Slightly reduced to fit in viewBox

  // Generate tick marks every 10 degrees
  const tickMarks = Array.from({ length: 36 }, (_, i) => {
    const angle = i * 10;
    const isMajor = angle % 30 === 0;
    const startRadius = isMajor ? tickRadius - 8 : tickRadius - 4;
    const endRadius = tickRadius;
    
    const startX = centerX + startRadius * Math.sin((angle * Math.PI) / 180);
    const startY = centerY - startRadius * Math.cos((angle * Math.PI) / 180);
    const endX = centerX + endRadius * Math.sin((angle * Math.PI) / 180);
    const endY = centerY - endRadius * Math.cos((angle * Math.PI) / 180);
    
    return {
      x1: startX,
      y1: startY,
      x2: endX,
      y2: endY,
      isMajor
    };
  });

  // Cardinal directions
  const cardinals = [
    { label: 'N', angle: 0 },
    { label: 'E', angle: 90 },
    { label: 'S', angle: 180 },
    { label: 'W', angle: 270 }
  ];

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Compass SVG */}
      <svg
        width={compassSize}
        height={compassSize}
        viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
        className="drop-shadow-lg"
        role="img"
        aria-label={`Qibla direction: ${normalizedDirection.toFixed(1)} degrees ${directionLabel} from North`}
      >
        {/* Background circle */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="rgba(16, 24, 39, 0.8)"
          stroke="rgba(74, 222, 128, 0.4)"
          strokeWidth="2"
        />

        {/* Tick marks */}
        {tickMarks.map((tick, i) => (
          <line
            key={i}
            x1={tick.x1}
            y1={tick.y1}
            x2={tick.x2}
            y2={tick.y2}
            stroke={tick.isMajor ? 'rgba(148, 163, 184, 0.8)' : 'rgba(148, 163, 184, 0.4)'}
            strokeWidth={tick.isMajor ? 2 : 1}
            strokeLinecap="round"
          />
        ))}

        {/* Cardinal direction labels */}
        {cardinals.map((cardinal) => {
          const x = centerX + cardinalRadius * Math.sin((cardinal.angle * Math.PI) / 180);
          const y = centerY - cardinalRadius * Math.cos((cardinal.angle * Math.PI) / 180);
          
          return (
            <text
              key={cardinal.label}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="rgba(226, 232, 240, 0.9)"
              fontSize={size * 0.12}
              fontWeight="bold"
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              {cardinal.label}
            </text>
          );
        })}

        {/* Qibla direction arrow */}
        <g
          transform={`rotate(${normalizedDirection}, ${centerX}, ${centerY})`}
          style={{ transition: 'transform 0.5s ease-out' }}
        >
          {/* Arrow shaft */}
          <line
            x1={centerX}
            y1={centerY}
            x2={centerX}
            y2={centerY - radius * 0.7}
            stroke="rgba(74, 222, 128, 1)"
            strokeWidth={size * 0.015}
            strokeLinecap="round"
          />
          
          {/* Arrow head */}
          <path
            d={`
              M ${centerX} ${centerY - radius * 0.75}
              L ${centerX - size * 0.04} ${centerY - radius * 0.6}
              L ${centerX} ${centerY - radius * 0.65}
              L ${centerX + size * 0.04} ${centerY - radius * 0.6}
              Z
            `}
            fill="rgba(74, 222, 128, 1)"
            stroke="rgba(34, 197, 94, 1)"
            strokeWidth="1"
          />

          {/* Kaaba icon at the end of arrow */}
          <g transform={`translate(${centerX}, ${centerY - radius * 0.85})`}>
            {/* Kaaba cube representation */}
            <rect
              x={-size * 0.04}
              y={-size * 0.04}
              width={size * 0.08}
              height={size * 0.08}
              fill="rgba(34, 197, 94, 0.3)"
              stroke="rgba(74, 222, 128, 1)"
              strokeWidth="2"
              rx="2"
            />
            {/* Kaaba door detail */}
            <rect
              x={-size * 0.018}
              y={-size * 0.01}
              width={size * 0.036}
              height={size * 0.04}
              fill="rgba(74, 222, 128, 0.5)"
              stroke="rgba(74, 222, 128, 1)"
              strokeWidth="1"
            />
          </g>
        </g>

        {/* Center dot */}
        <circle
          cx={centerX}
          cy={centerY}
          r={size * 0.02}
          fill="rgba(74, 222, 128, 1)"
          stroke="rgba(34, 197, 94, 1)"
          strokeWidth="1"
        />
      </svg>

      {/* Degree value and direction label */}
      {(showDegrees || showLabel) && (
        <div className="mt-3 text-center">
          {showDegrees && (
            <div className="text-2xl font-mono font-bold text-green-400">
              {normalizedDirection.toFixed(1)}°
            </div>
          )}
          {showLabel && (
            <div className="text-sm text-slate-400 mt-1">
              Direction: <span className="text-slate-300 font-semibold">{directionLabel}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QiblaCompass;
