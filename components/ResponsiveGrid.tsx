import React from 'react';
import { useResponsive } from '../utils/responsive';

interface ResponsiveGridProps {
  children: React.ReactNode;
  type?: 'events' | 'prayers' | 'calendar' | 'custom';
  mobile?: number;
  tablet?: number;
  desktop?: number;
  wide?: number;
  gap?: 'small' | 'medium' | 'large';
  className?: string;
}

/**
 * Responsive grid component that adapts column count based on screen size and content type
 */
const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  type = 'custom',
  mobile,
  tablet,
  desktop,
  wide,
  gap = 'medium',
  className = ''
}) => {
  const { isMobile, isTablet, isDesktop, isWide } = useResponsive();

  const getGridColumns = () => {
    // Use custom values if provided
    if (mobile !== undefined) {
      if (isMobile) return mobile;
      if (isTablet && tablet !== undefined) return tablet;
      if (isDesktop && desktop !== undefined) return desktop;
      if (isWide && wide !== undefined) return wide;
      return desktop || tablet || mobile;
    }

    // Use predefined type configurations
    switch (type) {
      case 'events':
        if (isMobile) return 1;
        if (isTablet) return 2;
        if (isDesktop) return 3;
        return 4;
      
      case 'prayers':
        if (isMobile) return 1;
        if (isTablet) return 2;
        if (isDesktop) return 3;
        return 4;
      
      case 'calendar':
        return 7; // Always 7 columns for calendar
      
      default:
        if (isMobile) return 1;
        if (isTablet) return 2;
        return 3;
    }
  };

  const getGapClass = () => {
    const gapSizes = {
      small: isMobile ? 'gap-2' : 'gap-3',
      medium: isMobile ? 'gap-4' : isTablet ? 'gap-6' : 'gap-6',
      large: isMobile ? 'gap-6' : isTablet ? 'gap-8' : 'gap-8'
    };
    return gapSizes[gap];
  };

  const columns = getGridColumns();
  const gridClass = `grid grid-cols-${columns}`;

  return (
    <div className={`${gridClass} ${getGapClass()} ${className}`}>
      {children}
    </div>
  );
};

export default ResponsiveGrid;