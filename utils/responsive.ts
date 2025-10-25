import { useMediaQuery } from 'react-responsive';

/**
 * Responsive breakpoints following mobile-first design
 */
export const breakpoints = {
  mobile: 320,
  tablet: 768,
  desktop: 1024,
  wide: 1440
} as const;

/**
 * Custom hooks for responsive design using react-responsive
 */
export const useResponsive = () => {
  const isMobile = useMediaQuery({ maxWidth: breakpoints.tablet - 1 });
  const isTablet = useMediaQuery({ 
    minWidth: breakpoints.tablet, 
    maxWidth: breakpoints.desktop - 1 
  });
  const isDesktop = useMediaQuery({ minWidth: breakpoints.desktop });
  const isWide = useMediaQuery({ minWidth: breakpoints.wide });
  
  // Device type detection
  const isTouchDevice = useMediaQuery({ query: '(hover: none)' });
  const isLandscape = useMediaQuery({ orientation: 'landscape' });
  const isPortrait = useMediaQuery({ orientation: 'portrait' });
  
  // Specific size checks
  const isSmallMobile = useMediaQuery({ maxWidth: 480 });
  const isLargeMobile = useMediaQuery({ 
    minWidth: 481, 
    maxWidth: breakpoints.tablet - 1 
  });
  
  return {
    // Primary breakpoints
    isMobile,
    isTablet,
    isDesktop,
    isWide,
    
    // Device characteristics
    isTouchDevice,
    isLandscape,
    isPortrait,
    
    // Specific sizes
    isSmallMobile,
    isLargeMobile,
    
    // Utility functions
    getColumns: () => {
      if (isMobile) return 1;
      if (isTablet) return 2;
      if (isDesktop) return 3;
      return 4;
    },
    
    getGridCols: (mobile = 1, tablet = 2, desktop = 3, wide = 4) => {
      if (isMobile) return mobile;
      if (isTablet) return tablet;
      if (isDesktop) return desktop;
      return wide;
    },
    
    getSpacing: () => {
      if (isMobile) return 'p-4';
      if (isTablet) return 'p-6';
      return 'p-8';
    },
    
    getTextSize: (base: string) => {
      const sizes = {
        'text-xs': isMobile ? 'text-xs' : 'text-sm',
        'text-sm': isMobile ? 'text-sm' : 'text-base',
        'text-base': isMobile ? 'text-base' : 'text-lg',
        'text-lg': isMobile ? 'text-lg' : 'text-xl',
        'text-xl': isMobile ? 'text-xl' : 'text-2xl',
        'text-2xl': isMobile ? 'text-xl' : isTablet ? 'text-2xl' : 'text-3xl',
        'text-3xl': isMobile ? 'text-2xl' : isTablet ? 'text-3xl' : 'text-4xl',
        'text-4xl': isMobile ? 'text-3xl' : isTablet ? 'text-4xl' : 'text-5xl',
        'text-5xl': isMobile ? 'text-4xl' : isTablet ? 'text-5xl' : 'text-6xl'
      };
      return sizes[base as keyof typeof sizes] || base;
    }
  };
};

/**
 * Layout configuration based on screen size
 */
export const getLayoutConfig = (isMobile: boolean, isTablet: boolean, isDesktop: boolean) => {
  return {
    // Grid configurations
    eventGrid: {
      mobile: 'grid-cols-1',
      tablet: 'grid-cols-2',
      desktop: 'grid-cols-3',
      wide: 'grid-cols-4'
    },
    
    prayerGrid: {
      mobile: 'grid-cols-1',
      tablet: 'grid-cols-2', 
      desktop: 'grid-cols-3',
      wide: 'grid-cols-4'
    },
    
    calendarGrid: {
      mobile: 'grid-cols-7 gap-1',
      tablet: 'grid-cols-7 gap-2',
      desktop: 'grid-cols-7 gap-3'
    },
    
    // Container configurations
    container: {
      mobile: 'max-w-full px-4',
      tablet: 'max-w-4xl px-6',
      desktop: 'max-w-6xl px-8',
      wide: 'max-w-7xl px-8'
    },
    
    // Navigation configurations
    navigation: {
      mobile: 'flex-col gap-2',
      tablet: 'flex-row gap-4',
      desktop: 'flex-row gap-6'
    },
    
    // Modal configurations
    modal: {
      mobile: 'w-full h-full rounded-none',
      tablet: 'w-full max-w-2xl rounded-lg',
      desktop: 'w-full max-w-4xl rounded-lg'
    },
    
    // Panel configurations
    panel: {
      mobile: 'flex-col',
      tablet: 'flex-row',
      desktop: 'flex-row'
    }
  };
};

/**
 * Responsive class generator utility
 */
export const responsive = {
  grid: (mobile: number, tablet?: number, desktop?: number, wide?: number) => {
    const t = tablet ?? mobile;
    const d = desktop ?? t;
    const w = wide ?? d;
    
    return `grid-cols-${mobile} md:grid-cols-${t} lg:grid-cols-${d} xl:grid-cols-${w}`;
  },
  
  spacing: (mobile: string, tablet?: string, desktop?: string) => {
    const t = tablet ?? mobile;
    const d = desktop ?? t;
    
    return `${mobile} md:${t} lg:${d}`;
  },
  
  text: (mobile: string, tablet?: string, desktop?: string) => {
    const t = tablet ?? mobile;
    const d = desktop ?? t;
    
    return `${mobile} md:${t} lg:${d}`;
  },
  
  flex: (mobile: string, tablet?: string, desktop?: string) => {
    const t = tablet ?? mobile;
    const d = desktop ?? t;
    
    return `${mobile} md:${t} lg:${d}`;
  }
};