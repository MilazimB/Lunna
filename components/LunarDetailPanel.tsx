import React, { useState } from 'react';
import { EnhancedLunarIllumination, LibrationData, AlternativeCalculation } from '../types';
import MoonPhaseIcon from './MoonPhaseIcon';
import ZoomableMoonPhase from './ZoomableMoonPhase';
import AccuracyIndicator from './AccuracyIndicator';
import { useResponsive } from '../utils/responsive';

interface LunarDetailPanelProps {
  illumination: EnhancedLunarIllumination;
  accuracyEstimate?: {
    confidenceInterval: { min: Date; max: Date };
    uncertaintyMinutes: number;
    calculationMethod: string;
    reliabilityScore: number;
  };
  alternativeCalculations?: AlternativeCalculation[];
  atmosphericCorrection?: number;
  showAdvancedData?: boolean;
}

const LunarDetailPanel: React.FC<LunarDetailPanelProps> = ({
  illumination,
  accuracyEstimate,
  alternativeCalculations = [],
  atmosphericCorrection = 0,
  showAdvancedData = true
}) => {
  const { isMobile, isTablet, getTextSize } = useResponsive();
  const [showMethodComparison, setShowMethodComparison] = useState(false);

  const illuminationPercent = (illumination.fraction * 100).toFixed(1);

  const formatLibration = (degrees: number): string => {
    const absValue = Math.abs(degrees);
    const direction = degrees >= 0 ? '+' : '-';
    return `${direction}${absValue.toFixed(2)}°`;
  };

  const formatDistance = (km: number): string => {
    return `${km.toLocaleString()} km`;
  };

  const formatAtmosphericCorrection = (minutes: number): string => {
    if (minutes === 0) return 'None';
    const absMinutes = Math.abs(minutes);
    const sign = minutes > 0 ? '+' : '-';
    if (absMinutes < 1) return `${sign}${(absMinutes * 60).toFixed(0)}s`;
    return `${sign}${absMinutes.toFixed(1)}m`;
  };

  return (
    <div 
      className="max-w-4xl mx-auto bg-card-bg p-6 rounded-lg shadow-md"
      role="region"
      aria-label="Detailed lunar information"
    >
      <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4 text-center">
        Enhanced Lunar Data
      </h2>

      {/* Main Display Section */}
      <div className={`flex ${isMobile ? 'flex-col' : 'flex-col lg:flex-row'} gap-6 mb-6`}>
        {/* Left: Moon Phase Visual */}
        <div className="flex-shrink-0 flex flex-col items-center justify-center">
          <ZoomableMoonPhase
            phaseAngle={illumination.phaseAngle}
            fraction={illumination.fraction}
            initialSize={isMobile ? 100 : 120}
            className="mb-4"
          />
          <div className="text-center">
            <p className={`${getTextSize('text-2xl')} text-moonlight font-semibold`}>{illumination.phaseName}</p>
            <p className={`${getTextSize('text-xl')} font-mono text-accent-blue mt-1`}>{illuminationPercent}%</p>
            <p className={`${getTextSize('text-xs')} text-slate-400 mt-1`}>illuminated</p>
          </div>
        </div>

        {/* Right: Core Data */}
        <div className="flex-grow space-y-4">
          {/* Basic Lunar Data */}
          <div className="bg-card-bg/50 rounded-lg p-4 border border-slate-600/50">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Current State
            </h3>
            <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-3`}>
              <div>
                <div className={`${getTextSize('text-xs')} text-slate-400`}>Phase Angle</div>
                <div className={`${getTextSize('text-lg')} font-mono text-moonlight`}>
                  {illumination.phaseAngle.toFixed(1)}°
                </div>
              </div>
              <div>
                <div className={`${getTextSize('text-xs')} text-slate-400`}>Distance</div>
                <div className={`${getTextSize('text-lg')} font-mono text-moonlight`}>
                  {formatDistance(illumination.distance)}
                </div>
              </div>
              <div>
                <div className={`${getTextSize('text-xs')} text-slate-400`}>Apparent Diameter</div>
                <div className={`${getTextSize('text-lg')} font-mono text-moonlight`}>
                  {illumination.apparentDiameter.toFixed(2)}'
                </div>
              </div>
              <div>
                <div className={`${getTextSize('text-xs')} text-slate-400`}>Atmospheric Correction</div>
                <div className={`${getTextSize('text-lg')} font-mono text-moonlight`}>
                  {formatAtmosphericCorrection(atmosphericCorrection)}
                </div>
              </div>
            </div>
          </div>

          {/* Libration Data */}
          {showAdvancedData && illumination.librationData && (
            <div className="bg-card-bg/50 rounded-lg p-4 border border-slate-600/50">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                Libration
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-slate-400">Longitude</div>
                  <div className="text-lg font-mono text-accent-blue">
                    {formatLibration(illumination.librationData.longitudeLibration)}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {illumination.librationData.longitudeLibration >= 0 ? 'East visible' : 'West visible'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Latitude</div>
                  <div className="text-lg font-mono text-accent-blue">
                    {formatLibration(illumination.librationData.latitudeLibration)}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {illumination.librationData.latitudeLibration >= 0 ? 'North visible' : 'South visible'}
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-600/50">
                <p className="text-xs text-slate-400 italic">
                  Libration shows which parts of the Moon's far side are visible from Earth
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Accuracy Information */}
      {accuracyEstimate && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Calculation Accuracy
            </h3>
            {alternativeCalculations.length > 0 && (
              <button
                onClick={() => setShowMethodComparison(!showMethodComparison)}
                className="text-xs text-accent-blue hover:text-accent-blue/80 transition-colors"
                aria-expanded={showMethodComparison}
                aria-controls="method-comparison"
              >
                {showMethodComparison ? 'Hide' : 'Show'} Method Comparison
              </button>
            )}
          </div>
          <AccuracyIndicator
            accuracyEstimate={accuracyEstimate}
            alternativeCalculations={alternativeCalculations}
            showMethodComparison={showMethodComparison}
          />
        </div>
      )}

      {/* Additional Information */}
      {showAdvancedData && (
        <div className="bg-card-bg/30 rounded-lg p-4 border border-slate-600/30">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            About This Data
          </h3>
          <div className="space-y-2 text-xs text-slate-400">
            <p>
              <strong className="text-slate-300">Phase Angle:</strong> The angle between the Sun, Moon, and Earth. 
              0° = New Moon, 180° = Full Moon.
            </p>
            <p>
              <strong className="text-slate-300">Apparent Diameter:</strong> The Moon's angular size as seen from Earth, 
              measured in arc minutes (').
            </p>
            <p>
              <strong className="text-slate-300">Libration:</strong> The slight wobble in the Moon's orientation that 
              allows us to see about 59% of its surface over time, instead of just 50%.
            </p>
            {atmosphericCorrection !== 0 && (
              <p>
                <strong className="text-slate-300">Atmospheric Correction:</strong> Adjustment for atmospheric refraction 
                affecting the observed timing of lunar events.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LunarDetailPanel;
