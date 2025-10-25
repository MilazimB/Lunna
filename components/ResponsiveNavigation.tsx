import React, { useState } from 'react';
import { useResponsive } from '../utils/responsive';

type ViewMode = 'astronomical' | 'religious' | 'calendar' | 'qibla';

interface NavigationItem {
  id: ViewMode;
  label: string;
  icon: string;
  ariaLabel: string;
}

interface ResponsiveNavigationProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  className?: string;
}

/**
 * Responsive navigation component that adapts layout based on screen size
 */
const ResponsiveNavigation: React.FC<ResponsiveNavigationProps> = ({
  currentView,
  onViewChange,
  className = ''
}) => {
  const { isMobile, isTablet } = useResponsive();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigationItems: NavigationItem[] = [
    {
      id: 'astronomical',
      label: 'Astronomical',
      icon: '🌙',
      ariaLabel: 'Astronomical view'
    },
    {
      id: 'religious',
      label: 'Religious Schedule',
      icon: '🕌',
      ariaLabel: 'Religious schedule view'
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: '📅',
      ariaLabel: 'Calendar view'
    },
    {
      id: 'qibla',
      label: 'Qibla Direction',
      icon: '🧭',
      ariaLabel: 'Qibla direction compass'
    }
  ];

  const getButtonClass = (isActive: boolean) => {
    const baseClass = `
      px-4 py-2 rounded-lg font-medium transition-colors
      ${isActive
        ? 'bg-accent-blue text-white'
        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
      }
    `;
    
    if (isMobile) {
      return `${baseClass} w-full text-left`;
    }
    
    return baseClass;
  };

  const renderNavigationItems = () => (
    <>
      {navigationItems.map((item) => (
        <button
          key={item.id}
          onClick={() => {
            onViewChange(item.id);
            if (isMobile) setIsMenuOpen(false);
          }}
          className={getButtonClass(currentView === item.id)}
          aria-label={item.ariaLabel}
          aria-pressed={currentView === item.id}
        >
          <span className="mr-2">{item.icon}</span>
          {isMobile || isTablet ? item.label : item.label}
        </button>
      ))}
    </>
  );

  if (isMobile) {
    return (
      <div className={`relative ${className}`}>
        {/* Mobile menu button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="w-full bg-slate-700 text-slate-300 px-4 py-3 rounded-lg hover:bg-slate-600 transition-colors flex items-center justify-between"
          aria-expanded={isMenuOpen}
          aria-haspopup="true"
          aria-label="Navigation menu"
        >
          <span className="flex items-center">
            <span className="mr-2">
              {navigationItems.find(item => item.id === currentView)?.icon}
            </span>
            {navigationItems.find(item => item.id === currentView)?.label}
          </span>
          <svg 
            className={`w-5 h-5 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Mobile dropdown menu */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-card-bg border border-slate-600 rounded-lg shadow-lg z-50">
            <div className="p-2 space-y-2">
              {renderNavigationItems()}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Tablet and desktop layout
  return (
    <div className={`flex ${isTablet ? 'flex-wrap justify-center' : 'justify-center'} gap-2 sm:gap-4 ${className}`}>
      {renderNavigationItems()}
    </div>
  );
};

export default ResponsiveNavigation;