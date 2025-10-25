import React from 'react';
import { useResponsive } from '../utils/responsive';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Responsive layout wrapper that adapts container and spacing based on screen size
 */
const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({ 
  children, 
  className = '' 
}) => {
  const { isMobile, isTablet, isDesktop, getSpacing } = useResponsive();

  const getContainerClass = () => {
    if (isMobile) return 'max-w-full px-4';
    if (isTablet) return 'max-w-4xl px-6';
    if (isDesktop) return 'max-w-6xl px-8';
    return 'max-w-7xl px-8';
  };

  return (
    <div className={`min-h-screen bg-night-sky text-moonlight font-sans ${getSpacing()}`}>
      <div className={`mx-auto ${getContainerClass()} ${className}`}>
        {children}
      </div>
    </div>
  );
};

export default ResponsiveLayout;