import React, { forwardRef } from 'react';
import { useSwipeNavigation } from '../utils/touchGestures';
import { useResponsive } from '../utils/responsive';

interface SwipeableCalendarProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  className?: string;
  disabled?: boolean;
}

/**
 * Wrapper component that adds swipe navigation to calendar views
 */
const SwipeableCalendar = forwardRef<HTMLDivElement, SwipeableCalendarProps>(({
  children,
  onSwipeLeft,
  onSwipeRight,
  className = '',
  disabled = false
}, ref) => {
  const { isTouchDevice } = useResponsive();
  
  const { elementRef, isGesturing } = useSwipeNavigation(
    disabled ? undefined : onSwipeLeft,
    disabled ? undefined : onSwipeRight,
    80 // Increased threshold for calendar navigation
  );

  // Combine refs if both are provided
  const combinedRef = (node: HTMLDivElement) => {
    if (elementRef) {
      (elementRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    }
    if (ref) {
      if (typeof ref === 'function') {
        ref(node);
      } else {
        ref.current = node;
      }
    }
  };

  return (
    <div
      ref={combinedRef}
      className={`
        ${className}
        ${isTouchDevice && !disabled ? 'touch-pan-y' : ''}
        ${isGesturing ? 'select-none' : ''}
        transition-transform duration-200
      `}
      style={{
        touchAction: isTouchDevice && !disabled ? 'pan-y' : 'auto'
      }}
    >
      {children}
      
      {/* Visual feedback for swipe gestures */}
      {isTouchDevice && !disabled && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 pointer-events-none">
          <div className="flex items-center space-x-2 text-slate-400 text-xs opacity-60">
            <span>←</span>
            <span>Swipe to navigate</span>
            <span>→</span>
          </div>
        </div>
      )}
    </div>
  );
});

SwipeableCalendar.displayName = 'SwipeableCalendar';

export default SwipeableCalendar;