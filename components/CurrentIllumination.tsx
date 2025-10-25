import React from 'react';
import { LunarIllumination } from '../types';
import Moon3D from './Moon3D';
import { useResponsive } from '../utils/responsive';

interface CurrentIlluminationProps {
  illumination: LunarIllumination | null;
}

const CurrentIllumination: React.FC<CurrentIlluminationProps> = ({ illumination }) => {
  const { isMobile, getTextSize } = useResponsive();
  
  if (!illumination) {
    return (
        <div className="max-w-2xl mx-auto bg-card-bg/50 p-6 rounded-lg shadow-md mb-8 text-center">
            <p className="text-slate-400">Determining current phase...</p>
        </div>
    );
  }

  const illuminationPercent = (illumination.fraction * 100).toFixed(1);

  return (
    <div className="max-w-2xl mx-auto bg-card-bg p-6 rounded-lg shadow-md mb-8 relative overflow-hidden">
        {/* Subtle background glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800/20 via-transparent to-slate-900/20 pointer-events-none" />
        
        <h2 className={`${getTextSize('text-sm')} font-semibold uppercase tracking-wider text-slate-400 mb-6 text-center relative z-10`}>
          Current Moon Phase
        </h2>
        
        <div className={`flex ${isMobile ? 'flex-col' : 'flex-col sm:flex-row'} justify-center items-center gap-6 relative z-10`}>
            <div className="relative">
              {/* 3D Moon with enhanced realism */}
              <Moon3D 
                phaseAngle={illumination.phaseAngle}
                fraction={illumination.fraction}
                size={isMobile ? 120 : 150}
                className="drop-shadow-2xl"
              />
              
              {/* Enhanced ambient glow around moon */}
              <div 
                className="absolute inset-0 rounded-full opacity-30 blur-2xl"
                style={{
                  background: `radial-gradient(circle, ${
                    illumination.fraction > 0.5 ? '#fbbf24' : '#64748b'
                  } 0%, transparent 70%)`,
                  transform: 'scale(1.5)'
                }}
              />
            </div>
            
            <div className="text-center sm:text-left space-y-2">
                <p className={`${getTextSize('text-3xl')} text-moonlight font-semibold`}>
                  {illumination.phaseName}
                </p>
                <p className={`${getTextSize('text-xl')} font-mono text-accent-blue`}>
                  {illuminationPercent}% illuminated
                </p>
                
                {/* Additional phase information */}
                <div className="mt-3 space-y-1">
                  <p className={`${getTextSize('text-sm')} text-slate-400`}>
                    Phase angle: {illumination.phaseAngle.toFixed(1)}°
                  </p>
                  {illumination.fraction < 0.5 ? (
                    <p className={`${getTextSize('text-xs')} text-slate-500`}>
                      {illumination.fraction < 0.01 ? 'New Moon - Not visible' : 'Waxing phase'}
                    </p>
                  ) : (
                    <p className={`${getTextSize('text-xs')} text-slate-500`}>
                      {illumination.fraction > 0.99 ? 'Full Moon - Fully illuminated' : 'Waning phase'}
                    </p>
                  )}
                </div>
            </div>
        </div>
    </div>
  );
};

export default CurrentIllumination;
