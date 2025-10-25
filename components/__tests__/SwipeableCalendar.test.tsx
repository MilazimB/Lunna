import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import SwipeableCalendar from '../SwipeableCalendar';

// Mock the touch gestures hook
vi.mock('../../utils/touchGestures', () => ({
  useSwipeNavigation: vi.fn(() => ({
    elementRef: { current: null },
    isGesturing: false
  }))
}));

// Mock the responsive hook
vi.mock('../../utils/responsive', () => ({
  useResponsive: vi.fn(() => ({
    isTouchDevice: true
  }))
}));

describe('SwipeableCalendar', () => {
  const mockOnSwipeLeft = vi.fn();
  const mockOnSwipeRight = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children correctly', () => {
    render(
      <SwipeableCalendar>
        <div data-testid="calendar-content">Calendar Content</div>
      </SwipeableCalendar>
    );

    expect(screen.getByTestId('calendar-content')).toBeInTheDocument();
  });

  it('shows swipe instructions on touch devices', () => {
    render(
      <SwipeableCalendar
        onSwipeLeft={mockOnSwipeLeft}
        onSwipeRight={mockOnSwipeRight}
      >
        <div>Calendar</div>
      </SwipeableCalendar>
    );

    expect(screen.getByText('Swipe to navigate')).toBeInTheDocument();
  });

  it('applies correct touch classes', () => {
    const { container } = render(
      <SwipeableCalendar>
        <div>Calendar</div>
      </SwipeableCalendar>
    );

    const swipeableDiv = container.querySelector('.touch-pan-y');
    expect(swipeableDiv).toBeInTheDocument();
  });

  it('does not show swipe instructions when disabled', () => {
    render(
      <SwipeableCalendar disabled>
        <div>Calendar</div>
      </SwipeableCalendar>
    );

    expect(screen.queryByText('Swipe to navigate')).not.toBeInTheDocument();
  });
});