import React from 'react';
import { AccuracyEstimate, AlternativeCalculation } from '../types';

interface AccuracyIndicatorProps {
  accuracyEstimate: AccuracyEstimate;
  alternativeCalculations?: AlternativeCalculation[];
  showMethodComparison?: boolean;
}

const AccuracyIndicator: React.FC<AccuracyIndicatorProps> = ({
  accuracyEstimate,
  alternativeCalculations = [],
  showMethodComparison = false
}) => {
  const getReliabilityColor = (score: number): string => {
    if (score >= 0.9) return 'text-green-400';
    if (score >= 0.7) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getReliabilityLabel = (score: number): string => {
    if (score >= 0.9) return 'High';
    if (score >= 0.7) return 'Moderate';
    return 'Low';
  };

  const formatUncertainty = (minutes: number): string => {
    if (minutes < 1) return '< 1 minute';
    if (minutes === 1) return '1 minute';
    if (minutes < 60) return `${Math.round(minutes)} minutes`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    if (mins === 0) return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
    return `${hours}h ${mins}m`;
  };

  const formatConfidenceInterval = (min: Date, max: Date): string => {
    const diffMs = max.getTime() - min.getTime();
    const diffMinutes = Math.round(diffMs / 60000);
    return formatUncertainty(diffMinutes);
  };

  const reliabilityScore = accuracyEstimate.reliabilityScore;
  const reliabilityColor = getReliabilityColor(reliabilityScore);
  const reliabilityLabel = getReliabilityLabel(reliabilityScore);

  return (
    <div 
      className="bg-card-bg/70 rounded-lg p-4 border border-slate-600/50"
      role="region"
      aria-label="Calculation accuracy information"
    >
      <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3">
        Accuracy Estimate
      </h3>

      {/* Reliability Score */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-300">Reliability:</span>
          <span className={`text-lg font-semibold ${reliabilityColor}`} aria-label={`Reliability: ${reliabilityLabel}`}>
            {reliabilityLabel}
          </span>
        </div>
        
        {/* Visual reliability bar */}
        <div 
          className="w-full bg-slate-700 rounded-full h-2 overflow-hidden"
          role="progressbar"
          aria-valuenow={Math.round(reliabilityScore * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Reliability score: ${Math.round(reliabilityScore * 100)} percent`}
        >
          <div
            className={`h-full transition-all duration-300 ${
              reliabilityScore >= 0.9 ? 'bg-green-400' :
              reliabilityScore >= 0.7 ? 'bg-yellow-400' :
              'bg-orange-400'
            }`}
            style={{ width: `${reliabilityScore * 100}%` }}
          />
        </div>
        <div className="text-xs text-slate-400 mt-1 text-right">
          {Math.round(reliabilityScore * 100)}%
        </div>
      </div>

      {/* Uncertainty Range */}
      <div className="mb-4 pb-4 border-b border-slate-600/50">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-300">Uncertainty:</span>
          <span className="text-sm font-mono text-accent-blue">
            ±{formatUncertainty(accuracyEstimate.uncertaintyMinutes)}
          </span>
        </div>
        <div className="text-xs text-slate-400 mt-1">
          Range: {formatConfidenceInterval(
            accuracyEstimate.confidenceInterval.min,
            accuracyEstimate.confidenceInterval.max
          )}
        </div>
      </div>

      {/* Calculation Method */}
      <div className="mb-3">
        <div className="text-xs text-slate-400 mb-1">Method:</div>
        <div className="text-sm text-slate-300 font-mono">
          {accuracyEstimate.calculationMethod}
        </div>
      </div>

      {/* Alternative Calculations Comparison */}
      {showMethodComparison && alternativeCalculations.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-600/50">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Method Comparison
          </h4>
          <div className="space-y-2">
            {alternativeCalculations.map((alt, index) => (
              <div 
                key={index}
                className="flex items-center justify-between text-xs"
                role="listitem"
              >
                <span className="text-slate-400">{alt.method}:</span>
                <span className={`font-mono ${
                  Math.abs(alt.deviation) < 5 ? 'text-green-400' :
                  Math.abs(alt.deviation) < 15 ? 'text-yellow-400' :
                  'text-orange-400'
                }`}>
                  {alt.deviation > 0 ? '+' : ''}{Math.round(alt.deviation)}m
                </span>
              </div>
            ))}
          </div>
          <div className="text-xs text-slate-500 mt-2 italic">
            Deviation from primary method
          </div>
        </div>
      )}
    </div>
  );
};

export default AccuracyIndicator;
