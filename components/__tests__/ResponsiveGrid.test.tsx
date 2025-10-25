import React from 'react';
import { render } from '@testing-library/react';
import { vi } from 'vitest';
import ResponsiveGrid from '../ResponsiveGrid';

// Mock the responsive hook
const mockUseResponsive = vi.fn();
vi.mock('../../utils/responsive', () => ({
  useResponsive: () => mockUseResponsive()
}));

describe('ResponsiveGrid', () => {
  beforeEach(() => {
    mockUseResponsive.mockReturnValue({
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      isWide: false
    });
  });

  it('renders children correctly', () => {
    const { container } = render(
      <ResponsiveGrid>
        <div data-testid="child1">Child 1</div>
        <div data-testid="child2">Child 2</div>
      </ResponsiveGrid>
    );

    expect(container.querySelector('[data-testid="child1"]')).toBeInTheDocument();
    expect(container.querySelector('[data-testid="child2"]')).toBeInTheDocument();
  });

  it('applies correct grid classes for events type on desktop', () => {
    const { container } = render(
      <ResponsiveGrid type="events">
        <div>Item</div>
      </ResponsiveGrid>
    );

    const gridDiv = container.firstChild as HTMLElement;
    expect(gridDiv).toHaveClass('grid', 'grid-cols-3');
  });

  it('applies correct grid classes for mobile', () => {
    mockUseResponsive.mockReturnValue({
      isMobile: true,
      isTablet: false,
      isDesktop: false,
      isWide: false
    });

    const { container } = render(
      <ResponsiveGrid type="events">
        <div>Item</div>
      </ResponsiveGrid>
    );

    const gridDiv = container.firstChild as HTMLElement;
    expect(gridDiv).toHaveClass('grid', 'grid-cols-1');
  });

  it('uses custom column values when provided', () => {
    const { container } = render(
      <ResponsiveGrid mobile={2} tablet={3} desktop={4}>
        <div>Item</div>
      </ResponsiveGrid>
    );

    const gridDiv = container.firstChild as HTMLElement;
    expect(gridDiv).toHaveClass('grid', 'grid-cols-4'); // Desktop value
  });

  it('applies correct gap classes', () => {
    const { container } = render(
      <ResponsiveGrid gap="large">
        <div>Item</div>
      </ResponsiveGrid>
    );

    const gridDiv = container.firstChild as HTMLElement;
    expect(gridDiv).toHaveClass('gap-8'); // Large gap on desktop
  });
});