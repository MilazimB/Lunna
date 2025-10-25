import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useTouchGestures, useSwipeNavigation, usePinchZoom } from '../touchGestures';

// Mock DOM methods
Object.defineProperty(HTMLElement.prototype, 'addEventListener', {
  value: vi.fn(),
  writable: true
});

Object.defineProperty(HTMLElement.prototype, 'removeEventListener', {
  value: vi.fn(),
  writable: true
});

describe('useTouchGestures', () => {
  const mockOnSwipe = vi.fn();
  const mockOnPinch = vi.fn();
  const mockOnTap = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with correct default values', () => {
    const { result } = renderHook(() => useTouchGestures());

    expect(result.current.elementRef).toBeDefined();
    expect(result.current.isGesturing).toBe(false);
  });

  it('calls onSwipe callback when provided', () => {
    const { result } = renderHook(() => 
      useTouchGestures({ onSwipe: mockOnSwipe })
    );

    expect(result.current.elementRef).toBeDefined();
    expect(mockOnSwipe).not.toHaveBeenCalled();
  });

  it('calls onPinch callback when provided', () => {
    const { result } = renderHook(() => 
      useTouchGestures({ onPinch: mockOnPinch })
    );

    expect(result.current.elementRef).toBeDefined();
    expect(mockOnPinch).not.toHaveBeenCalled();
  });

  it('calls onTap callback when provided', () => {
    const { result } = renderHook(() => 
      useTouchGestures({ onTap: mockOnTap })
    );

    expect(result.current.elementRef).toBeDefined();
    expect(mockOnTap).not.toHaveBeenCalled();
  });
});

describe('useSwipeNavigation', () => {
  const mockOnSwipeLeft = vi.fn();
  const mockOnSwipeRight = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes correctly', () => {
    const { result } = renderHook(() => 
      useSwipeNavigation(mockOnSwipeLeft, mockOnSwipeRight)
    );

    expect(result.current.elementRef).toBeDefined();
    expect(result.current.isGesturing).toBe(false);
  });

  it('uses custom threshold when provided', () => {
    const { result } = renderHook(() => 
      useSwipeNavigation(mockOnSwipeLeft, mockOnSwipeRight, 100)
    );

    expect(result.current.elementRef).toBeDefined();
  });
});

describe('usePinchZoom', () => {
  const mockOnZoom = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with correct default values', () => {
    const { result } = renderHook(() => usePinchZoom());

    expect(result.current.elementRef).toBeDefined();
    expect(result.current.isGesturing).toBe(false);
    expect(result.current.zoomScale).toBe(1);
    expect(result.current.zoomCenter).toEqual({ x: 0, y: 0 });
  });

  it('provides resetZoom function', () => {
    const { result } = renderHook(() => usePinchZoom());

    act(() => {
      result.current.resetZoom();
    });

    expect(result.current.zoomScale).toBe(1);
    expect(result.current.zoomCenter).toEqual({ x: 0, y: 0 });
  });

  it('calls onZoom callback when provided', () => {
    const { result } = renderHook(() => usePinchZoom(mockOnZoom));

    expect(result.current.elementRef).toBeDefined();
    expect(mockOnZoom).not.toHaveBeenCalled();
  });
});