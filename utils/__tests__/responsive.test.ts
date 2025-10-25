import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';
import { useResponsive, responsive } from '../responsive';

// Mock react-responsive
vi.mock('react-responsive', () => ({
  useMediaQuery: vi.fn()
}));

import { useMediaQuery } from 'react-responsive';

describe('useResponsive', () => {
  const mockUseMediaQuery = useMediaQuery as vi.MockedFunction<typeof useMediaQuery>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns correct values for mobile device', () => {
    mockUseMediaQuery
      .mockReturnValueOnce(true)  // isMobile
      .mockReturnValueOnce(false) // isTablet
      .mockReturnValueOnce(false) // isDesktop
      .mockReturnValueOnce(false) // isWide
      .mockReturnValueOnce(true)  // isTouchDevice
      .mockReturnValueOnce(false) // isLandscape
      .mockReturnValueOnce(true)  // isPortrait
      .mockReturnValueOnce(true)  // isSmallMobile
      .mockReturnValueOnce(false); // isLargeMobile

    const { result } = renderHook(() => useResponsive());

    expect(result.current.isMobile).toBe(true);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(false);
    expect(result.current.isTouchDevice).toBe(true);
    expect(result.current.getColumns()).toBe(1);
  });

  it('returns correct values for desktop device', () => {
    mockUseMediaQuery
      .mockReturnValueOnce(false) // isMobile
      .mockReturnValueOnce(false) // isTablet
      .mockReturnValueOnce(true)  // isDesktop
      .mockReturnValueOnce(false) // isWide
      .mockReturnValueOnce(false) // isTouchDevice
      .mockReturnValueOnce(true)  // isLandscape
      .mockReturnValueOnce(false) // isPortrait
      .mockReturnValueOnce(false) // isSmallMobile
      .mockReturnValueOnce(false); // isLargeMobile

    const { result } = renderHook(() => useResponsive());

    expect(result.current.isMobile).toBe(false);
    expect(result.current.isDesktop).toBe(true);
    expect(result.current.isTouchDevice).toBe(false);
    expect(result.current.getColumns()).toBe(3);
  });

  it('getGridCols returns correct values', () => {
    mockUseMediaQuery
      .mockReturnValueOnce(false) // isMobile
      .mockReturnValueOnce(true)  // isTablet
      .mockReturnValueOnce(false) // isDesktop
      .mockReturnValueOnce(false); // isWide (first 4 calls for main checks)

    const { result } = renderHook(() => useResponsive());

    expect(result.current.getGridCols(1, 2, 3, 4)).toBe(2); // Tablet value
  });

  it('getTextSize returns responsive text sizes', () => {
    mockUseMediaQuery
      .mockReturnValueOnce(true)  // isMobile
      .mockReturnValueOnce(false) // isTablet
      .mockReturnValueOnce(false); // isDesktop

    const { result } = renderHook(() => useResponsive());

    expect(result.current.getTextSize('text-xl')).toBe('text-xl');
    expect(result.current.getTextSize('text-2xl')).toBe('text-xl');
  });
});

describe('responsive utility', () => {
  it('generates correct grid classes', () => {
    expect(responsive.grid(1, 2, 3, 4)).toBe('grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4');
  });

  it('generates correct spacing classes', () => {
    expect(responsive.spacing('p-4', 'p-6', 'p-8')).toBe('p-4 md:p-6 lg:p-8');
  });

  it('uses fallback values when not provided', () => {
    expect(responsive.grid(1)).toBe('grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-1');
  });
});