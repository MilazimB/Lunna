import React, { useState, useEffect } from 'react';
import { useSwipeNavigation } from '../utils/touchGestures';
import { useResponsive } from '../utils/responsive';

type ViewMode = 'astronomical' | 'religious' | 'calendar';

interface SwipeableViewSwitcherProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  children: React.ReactNode;
  className?: string;
}

/**
 * Swipeable view switcher that allows navigation between different app views
 */
const SwipeableViewSwitcher: React.FC<SwipeableViewSwitcherProps> = ({
  currentView,
  onViewChange,
  children,
  className = ''
}) => {
  const { isTouchDevice, isMobile } = useResponsive();
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const views: ViewMode[] = ['astronomical', 'religious', 'calendar'];
  const currentIndex = views.indexOf(currentView);

  const handleSwipeLeft = () => {
    // Swipe left = next view
    const nextIndex = (currentIndex + 1) % views.length;
    setIsTransitioning(true);
    onViewChange(views[nextIndex]);
  };

  const handleSwipeRight = () => {
    // Swipe right = previous view
    const prevIndex = currentIndex === 0 ? views.length - 1 : currentIndex - 1;
    setIsTransitioning(true);
    onViewChange(views[prevIndex]);
  };

  const { elementRef, isGesturing } = useSwipeNavigation(
    handleSwipeLeft,
    handleSwipeRight,
    100 // Higher threshold for view switching
  );

  // Reset transition state after view change
  useEffect(() => {
    if (isTransitioning) {
      const timer = setTimeout(() => setIsTransitioning(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isTransitioning, currentView]);

  const getViewName = (view: ViewMode): string => {
    switch (view) {
      case 'astronomical':
        return 'Astronomical';
      case 'religious':
        return 'Religious';
      case 'calendar':
        return 'Calendar';
      default:
        return view;
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Swipe indicator for touch devices */}
      {isTouchDevice && isMobile && (
        <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none">
          <div className="flex justify-between items-center px-4 py-2">
            <div className="flex items-center space-x-1 text-slate-500 text-xs">
              {currentIndex > 0 && (
                <>
                  <span>←</span>
                  <span>{getViewName(views[currentIndex - 1])}</span>
                </>
              )}
            </div>
            <div className="flex items-center space-x-1 text-slate-500 text-xs">
              {currentIndex < views.length - 1 && (
                <>
                  <span>{getViewName(views[currentIndex + 1])}</span>
                  <span>→</span>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main content area */}
      <div
        ref={elementRef}
        className={`
          ${isTouchDevice ? 'touch-pan-y' : ''}
          ${isGesturing || isTransitioning ? 'select-none' : ''}
          transition-transform duration-300 ease-out
          ${isTransitioning ? 'transform scale-95 opacity-90' : ''}
        `}
        style={{
          touchAction: isTouchDevice ? 'pan-y' : 'auto'
        }}
      >
        {children}
      </div>

      {/* View indicator dots */}
      {isTouchDevice && isMobile && (
        <div className="flex justify-center space-x-2 mt-4">
          {views.map((view, index) => (
            <button
              key={view}
              onClick={() => onViewChange(view)}
              className={`
                w-2 h-2 rounded-full transition-colors duration-200
                ${index === currentIndex
                  ? 'bg-accent-blue'
                  : 'bg-slate-600 hover:bg-slate-500'
                }
              `}
              aria-label={`Switch to ${getViewName(view)} view`}
            />
          ))}
        </div>
      )}

      {/* Swipe instructions for first-time users */}
      {isTouchDevice && isMobile && !isGesturing && (
        <div className="text-center mt-2">
          <div className="text-xs text-slate-500">
            Swipe left or right to switch between views
          </div>
        </div>
      )}
    </div>
  );
};

export default SwipeableViewSwitcher;