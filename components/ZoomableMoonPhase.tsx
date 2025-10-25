import React, { useState, useRef, useEffect } from 'react';
import { usePinchZoom } from '../utils/touchGestures';
import { useResponsive } from '../utils/responsive';
import Moon3D from './Moon3D';

interface ZoomableMoonPhaseProps {
  phaseAngle: number;
  fraction: number;
  initialSize?: number;
  maxZoom?: number;
  minZoom?: number;
  className?: string;
}

/**
 * Zoomable moon phase component with pinch-to-zoom support
 */
const ZoomableMoonPhase: React.FC<ZoomableMoonPhaseProps> = ({
  phaseAngle,
  fraction,
  initialSize = 120,
  maxZoom = 3,
  minZoom = 0.5,
  className = ''
}) => {
  const { isTouchDevice, isMobile } = useResponsive();
  const [currentZoom, setCurrentZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const baseZoomRef = useRef(1);

  const { elementRef, isGesturing, zoomScale, resetZoom } = usePinchZoom(
    (scale, center) => {
      const newZoom = Math.max(minZoom, Math.min(maxZoom, baseZoomRef.current * scale));
      setCurrentZoom(newZoom);
      
      // Calculate position adjustment to zoom towards the center point
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const centerX = center.x - rect.left - rect.width / 2;
        const centerY = center.y - rect.top - rect.height / 2;
        
        setPosition({
          x: -centerX * (newZoom - 1) * 0.5,
          y: -centerY * (newZoom - 1) * 0.5
        });
      }
    },
    0.05 // Lower threshold for more sensitive pinch detection
  );

  // Update base zoom when gesture ends
  useEffect(() => {
    if (!isGesturing) {
      baseZoomRef.current = currentZoom;
    }
  }, [isGesturing, currentZoom]);

  // Combine refs
  const combinedRef = (node: HTMLDivElement) => {
    containerRef.current = node;
    if (elementRef) {
      (elementRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    }
  };

  const handleDoubleClick = () => {
    if (currentZoom > 1) {
      // Reset zoom
      setCurrentZoom(1);
      setPosition({ x: 0, y: 0 });
      baseZoomRef.current = 1;
    } else {
      // Zoom in
      const newZoom = Math.min(maxZoom, 2);
      setCurrentZoom(newZoom);
      baseZoomRef.current = newZoom;
    }
  };

  const handleReset = () => {
    setCurrentZoom(1);
    setPosition({ x: 0, y: 0 });
    baseZoomRef.current = 1;
    resetZoom();
  };

  const currentSize = initialSize * currentZoom;

  return (
    <div className={`relative ${className}`}>
      <div
        ref={combinedRef}
        className={`
          relative overflow-hidden rounded-full bg-slate-900/50 border border-slate-600
          ${isTouchDevice ? 'touch-none' : ''}
          ${isGesturing ? 'select-none' : ''}
          transition-all duration-200
        `}
        style={{
          width: initialSize + 40,
          height: initialSize + 40,
          touchAction: 'none'
        }}
        onDoubleClick={handleDoubleClick}
      >
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${currentZoom})`,
            transformOrigin: 'center',
            transition: isGesturing ? 'none' : 'transform 0.2s ease-out'
          }}
        >
          <Moon3D
            phaseAngle={phaseAngle}
            fraction={fraction}
            size={initialSize}
          />
        </div>

        {/* Zoom level indicator */}
        {currentZoom !== 1 && (
          <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            {(currentZoom * 100).toFixed(0)}%
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="mt-4 flex justify-center space-x-2">
        {isTouchDevice && (
          <div className="text-xs text-slate-400 text-center mb-2">
            {isMobile ? 'Pinch to zoom • Double tap to reset' : 'Pinch to zoom • Double click to reset'}
          </div>
        )}
        
        <div className="flex space-x-2">
          <button
            onClick={() => {
              const newZoom = Math.max(minZoom, currentZoom - 0.2);
              setCurrentZoom(newZoom);
              baseZoomRef.current = newZoom;
            }}
            className="px-3 py-1 bg-slate-700 text-slate-300 rounded hover:bg-slate-600 transition-colors text-sm"
            aria-label="Zoom out"
          >
            −
          </button>
          
          <button
            onClick={handleReset}
            className="px-3 py-1 bg-slate-700 text-slate-300 rounded hover:bg-slate-600 transition-colors text-sm"
            aria-label="Reset zoom"
          >
            Reset
          </button>
          
          <button
            onClick={() => {
              const newZoom = Math.min(maxZoom, currentZoom + 0.2);
              setCurrentZoom(newZoom);
              baseZoomRef.current = newZoom;
            }}
            className="px-3 py-1 bg-slate-700 text-slate-300 rounded hover:bg-slate-600 transition-colors text-sm"
            aria-label="Zoom in"
          >
            +
          </button>
        </div>
      </div>

      {/* Instructions for first-time users */}
      {isTouchDevice && currentZoom === 1 && (
        <div className="mt-2 text-xs text-slate-500 text-center">
          Use pinch gestures to zoom in for detailed view
        </div>
      )}
    </div>
  );
};

export default ZoomableMoonPhase;