import { useEffect, useRef, useState } from 'react';

interface TouchPoint {
  x: number;
  y: number;
  timestamp: number;
}

interface SwipeGesture {
  direction: 'left' | 'right' | 'up' | 'down';
  distance: number;
  velocity: number;
  duration: number;
}

interface PinchGesture {
  scale: number;
  center: { x: number; y: number };
}

interface TouchGestureOptions {
  onSwipe?: (gesture: SwipeGesture) => void;
  onPinch?: (gesture: PinchGesture) => void;
  onTap?: (point: TouchPoint) => void;
  onDoubleTap?: (point: TouchPoint) => void;
  swipeThreshold?: number;
  pinchThreshold?: number;
  doubleTapDelay?: number;
}

/**
 * Custom hook for handling touch gestures
 */
export const useTouchGestures = (options: TouchGestureOptions = {}) => {
  const {
    onSwipe,
    onPinch,
    onTap,
    onDoubleTap,
    swipeThreshold = 50,
    pinchThreshold = 0.1,
    doubleTapDelay = 300
  } = options;

  const elementRef = useRef<HTMLElement>(null);
  const touchStartRef = useRef<TouchPoint | null>(null);
  const touchesRef = useRef<Touch[]>([]);
  const lastTapRef = useRef<TouchPoint | null>(null);
  const initialDistanceRef = useRef<number>(0);
  const [isGesturing, setIsGesturing] = useState(false);

  const getTouchPoint = (touch: Touch): TouchPoint => ({
    x: touch.clientX,
    y: touch.clientY,
    timestamp: Date.now()
  });

  const getDistance = (touch1: Touch, touch2: Touch): number => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getCenter = (touch1: Touch, touch2: Touch): { x: number; y: number } => ({
    x: (touch1.clientX + touch2.clientX) / 2,
    y: (touch1.clientY + touch2.clientY) / 2
  });

  const handleTouchStart = (e: TouchEvent) => {
    const touches = Array.from(e.touches);
    touchesRef.current = touches;

    if (touches.length === 1) {
      // Single touch - potential swipe or tap
      touchStartRef.current = getTouchPoint(touches[0]);
      setIsGesturing(false);
    } else if (touches.length === 2) {
      // Two touches - potential pinch
      initialDistanceRef.current = getDistance(touches[0], touches[1]);
      setIsGesturing(true);
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    e.preventDefault(); // Prevent scrolling during gestures
    
    const touches = Array.from(e.touches);
    touchesRef.current = touches;

    if (touches.length === 2 && onPinch) {
      // Handle pinch gesture
      const currentDistance = getDistance(touches[0], touches[1]);
      const scale = currentDistance / initialDistanceRef.current;
      
      if (Math.abs(scale - 1) > pinchThreshold) {
        const center = getCenter(touches[0], touches[1]);
        onPinch({ scale, center });
        setIsGesturing(true);
      }
    }
  };

  const handleTouchEnd = (e: TouchEvent) => {
    const touches = Array.from(e.changedTouches);
    
    if (touches.length === 1 && touchStartRef.current && !isGesturing) {
      const touchEnd = getTouchPoint(touches[0]);
      const dx = touchEnd.x - touchStartRef.current.x;
      const dy = touchEnd.y - touchStartRef.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const duration = touchEnd.timestamp - touchStartRef.current.timestamp;

      if (distance < swipeThreshold && duration < 300) {
        // Handle tap
        if (onDoubleTap && lastTapRef.current) {
          const timeSinceLastTap = touchEnd.timestamp - lastTapRef.current.timestamp;
          if (timeSinceLastTap < doubleTapDelay) {
            onDoubleTap(touchEnd);
            lastTapRef.current = null;
            return;
          }
        }

        if (onTap) {
          onTap(touchEnd);
        }
        lastTapRef.current = touchEnd;
      } else if (distance >= swipeThreshold && onSwipe) {
        // Handle swipe
        const velocity = distance / duration;
        let direction: SwipeGesture['direction'];

        if (Math.abs(dx) > Math.abs(dy)) {
          direction = dx > 0 ? 'right' : 'left';
        } else {
          direction = dy > 0 ? 'down' : 'up';
        }

        onSwipe({ direction, distance, velocity, duration });
      }
    }

    // Reset state
    touchStartRef.current = null;
    setIsGesturing(false);
  };

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Add touch event listeners
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onSwipe, onPinch, onTap, onDoubleTap, swipeThreshold, pinchThreshold, doubleTapDelay]);

  return {
    elementRef,
    isGesturing
  };
};

/**
 * Hook for swipe navigation (left/right swipes)
 */
export const useSwipeNavigation = (
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
  threshold = 50
) => {
  const { elementRef, isGesturing } = useTouchGestures({
    onSwipe: (gesture) => {
      if (gesture.direction === 'left' && onSwipeLeft) {
        onSwipeLeft();
      } else if (gesture.direction === 'right' && onSwipeRight) {
        onSwipeRight();
      }
    },
    swipeThreshold: threshold
  });

  return { elementRef, isGesturing };
};

/**
 * Hook for pinch-to-zoom functionality
 */
export const usePinchZoom = (
  onZoom?: (scale: number, center: { x: number; y: number }) => void,
  threshold = 0.1
) => {
  const [zoomScale, setZoomScale] = useState(1);
  const [zoomCenter, setZoomCenter] = useState({ x: 0, y: 0 });

  const { elementRef, isGesturing } = useTouchGestures({
    onPinch: (gesture) => {
      setZoomScale(gesture.scale);
      setZoomCenter(gesture.center);
      if (onZoom) {
        onZoom(gesture.scale, gesture.center);
      }
    },
    pinchThreshold: threshold
  });

  const resetZoom = () => {
    setZoomScale(1);
    setZoomCenter({ x: 0, y: 0 });
  };

  return {
    elementRef,
    isGesturing,
    zoomScale,
    zoomCenter,
    resetZoom
  };
};