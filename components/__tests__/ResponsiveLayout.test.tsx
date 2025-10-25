import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import ResponsiveLayout from '../ResponsiveLayout';

// Mock the responsive hook
vi.mock('../../utils/responsive', () => ({
  useResponsive: vi.fn(() => ({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    getSpacing: () => 'p-8'
  }))
}));

describe('ResponsiveLayout', () => {
  it('renders children correctly', () => {
    render(
      <ResponsiveLayout>
        <div data-testid="test-content">Test Content</div>
      </ResponsiveLayout>
    );

    expect(screen.getByTestId('test-content')).toBeInTheDocument();
  });

  it('applies correct container classes', () => {
    const { container } = render(
      <ResponsiveLayout>
        <div>Content</div>
      </ResponsiveLayout>
    );

    const layoutDiv = container.firstChild as HTMLElement;
    expect(layoutDiv).toHaveClass('min-h-screen', 'bg-night-sky', 'text-moonlight');
  });

  it('applies custom className when provided', () => {
    const { container } = render(
      <ResponsiveLayout className="custom-class">
        <div>Content</div>
      </ResponsiveLayout>
    );

    const innerDiv = container.querySelector('.mx-auto');
    expect(innerDiv).toHaveClass('custom-class');
  });
});