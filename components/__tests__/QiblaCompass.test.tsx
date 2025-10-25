import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import QiblaCompass from '../QiblaCompass';

describe('QiblaCompass', () => {
  it('renders compass with correct direction', () => {
    render(<QiblaCompass direction={137} />);
    
    // Check that the compass is rendered
    const compass = screen.getByRole('img');
    expect(compass).toBeInTheDocument();
    expect(compass).toHaveAttribute('aria-label', expect.stringContaining('137'));
  });

  it('displays degree value when showDegrees is true', () => {
    render(<QiblaCompass direction={137} showDegrees={true} />);
    
    expect(screen.getByText('137.0°')).toBeInTheDocument();
  });

  it('displays direction label when showLabel is true', () => {
    render(<QiblaCompass direction={137} showLabel={true} />);
    
    expect(screen.getByText('Direction:')).toBeInTheDocument();
    expect(screen.getByText('SE')).toBeInTheDocument();
  });

  it('hides degree value when showDegrees is false', () => {
    render(<QiblaCompass direction={137} showDegrees={false} />);
    
    expect(screen.queryByText('137.0°')).not.toBeInTheDocument();
  });

  it('hides direction label when showLabel is false', () => {
    render(<QiblaCompass direction={137} showLabel={false} />);
    
    expect(screen.queryByText('Direction:')).not.toBeInTheDocument();
  });

  it('correctly calculates direction labels', () => {
    const testCases = [
      { direction: 0, expected: 'N' },
      { direction: 45, expected: 'NE' },
      { direction: 90, expected: 'E' },
      { direction: 135, expected: 'SE' },
      { direction: 180, expected: 'S' },
      { direction: 225, expected: 'SW' },
      { direction: 270, expected: 'W' },
      { direction: 315, expected: 'NW' },
      { direction: 360, expected: 'N' }
    ];

    testCases.forEach(({ direction, expected }) => {
      const { unmount } = render(<QiblaCompass direction={direction} showLabel={true} />);
      // Use getAllByText for cardinal directions that appear in both SVG and label
      const elements = screen.getAllByText(expected);
      expect(elements.length).toBeGreaterThan(0);
      unmount();
    });
  });

  it('normalizes direction values over 360 degrees', () => {
    render(<QiblaCompass direction={450} showDegrees={true} />);
    
    // 450 degrees should normalize to 90 degrees (E)
    expect(screen.getByText('90.0°')).toBeInTheDocument();
  });

  it('normalizes negative direction values', () => {
    render(<QiblaCompass direction={-45} showLabel={true} />);
    
    // -45 degrees should normalize to 315 degrees (NW)
    expect(screen.getByText('NW')).toBeInTheDocument();
  });

  it('renders cardinal directions (N, S, E, W)', () => {
    const { container } = render(<QiblaCompass direction={0} />);
    
    // Check that SVG contains cardinal direction labels
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    
    // The cardinal directions should be in the SVG as text elements
    const textElements = svg?.querySelectorAll('text');
    const cardinalLabels = Array.from(textElements || []).map(el => el.textContent);
    
    expect(cardinalLabels).toContain('N');
    expect(cardinalLabels).toContain('S');
    expect(cardinalLabels).toContain('E');
    expect(cardinalLabels).toContain('W');
  });

  it('applies custom className', () => {
    const { container } = render(<QiblaCompass direction={137} className="custom-class" />);
    
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('uses custom size prop', () => {
    const { container } = render(<QiblaCompass direction={137} size={300} />);
    
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '300');
    expect(svg).toHaveAttribute('height', '300');
  });

  it('uses default size when not specified', () => {
    const { container } = render(<QiblaCompass direction={137} />);
    
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '200');
    expect(svg).toHaveAttribute('height', '200');
  });
});
