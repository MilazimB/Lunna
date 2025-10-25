import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AccuracyIndicator from '../AccuracyIndicator';
import { AccuracyEstimate, AlternativeCalculation } from '../../types';

describe('AccuracyIndicator', () => {
  const mockHighAccuracy: AccuracyEstimate = {
    confidenceInterval: {
      min: new Date('2025-10-19T12:00:00'),
      max: new Date('2025-10-19T12:02:00')
    },
    uncertaintyMinutes: 1,
    calculationMethod: 'Meeus',
    reliabilityScore: 0.95
  };

  const mockModerateAccuracy: AccuracyEstimate = {
    confidenceInterval: {
      min: new Date('2025-10-19T12:00:00'),
      max: new Date('2025-10-19T12:10:00')
    },
    uncertaintyMinutes: 5,
    calculationMethod: 'VSOP87',
    reliabilityScore: 0.75
  };

  const mockLowAccuracy: AccuracyEstimate = {
    confidenceInterval: {
      min: new Date('2025-10-19T12:00:00'),
      max: new Date('2025-10-19T13:00:00')
    },
    uncertaintyMinutes: 30,
    calculationMethod: 'Simplified',
    reliabilityScore: 0.5
  };

  const mockAlternativeCalculations: AlternativeCalculation[] = [
    { method: 'VSOP87', result: new Date('2025-10-19T12:02:00'), deviation: 2 },
    { method: 'ELP2000', result: new Date('2025-10-19T12:05:00'), deviation: 5 },
    { method: 'Simplified', result: new Date('2025-10-19T12:15:00'), deviation: 15 }
  ];

  describe('Basic Rendering', () => {
    it('should render accuracy estimate section', () => {
      render(<AccuracyIndicator accuracyEstimate={mockHighAccuracy} />);
      expect(screen.getByText('Accuracy Estimate')).toBeInTheDocument();
    });

    it('should render reliability label', () => {
      render(<AccuracyIndicator accuracyEstimate={mockHighAccuracy} />);
      expect(screen.getByText('Reliability:')).toBeInTheDocument();
    });

    it('should render uncertainty information', () => {
      render(<AccuracyIndicator accuracyEstimate={mockHighAccuracy} />);
      expect(screen.getByText('Uncertainty:')).toBeInTheDocument();
    });

    it('should render calculation method', () => {
      render(<AccuracyIndicator accuracyEstimate={mockHighAccuracy} />);
      expect(screen.getByText('Method:')).toBeInTheDocument();
      expect(screen.getByText('Meeus')).toBeInTheDocument();
    });
  });

  describe('Reliability Score Display', () => {
    it('should display "High" for reliability score >= 0.9', () => {
      render(<AccuracyIndicator accuracyEstimate={mockHighAccuracy} />);
      expect(screen.getByText('High')).toBeInTheDocument();
      expect(screen.getByText('High')).toHaveClass('text-green-400');
    });

    it('should display "Moderate" for reliability score >= 0.7', () => {
      render(<AccuracyIndicator accuracyEstimate={mockModerateAccuracy} />);
      expect(screen.getByText('Moderate')).toBeInTheDocument();
      expect(screen.getByText('Moderate')).toHaveClass('text-yellow-400');
    });

    it('should display "Low" for reliability score < 0.7', () => {
      render(<AccuracyIndicator accuracyEstimate={mockLowAccuracy} />);
      expect(screen.getByText('Low')).toBeInTheDocument();
      expect(screen.getByText('Low')).toHaveClass('text-orange-400');
    });

    it('should display reliability percentage', () => {
      render(<AccuracyIndicator accuracyEstimate={mockHighAccuracy} />);
      expect(screen.getByText('95%')).toBeInTheDocument();
    });
  });

  describe('Reliability Progress Bar', () => {
    it('should render progress bar with correct aria attributes', () => {
      render(<AccuracyIndicator accuracyEstimate={mockHighAccuracy} />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveAttribute('aria-valuenow', '95');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    });

    it('should have green color for high reliability', () => {
      const { container } = render(<AccuracyIndicator accuracyEstimate={mockHighAccuracy} />);
      const progressFill = container.querySelector('.bg-green-400');
      expect(progressFill).toBeInTheDocument();
    });

    it('should have yellow color for moderate reliability', () => {
      const { container } = render(<AccuracyIndicator accuracyEstimate={mockModerateAccuracy} />);
      const progressFill = container.querySelector('.bg-yellow-400');
      expect(progressFill).toBeInTheDocument();
    });

    it('should have orange color for low reliability', () => {
      const { container } = render(<AccuracyIndicator accuracyEstimate={mockLowAccuracy} />);
      const progressFill = container.querySelector('.bg-orange-400');
      expect(progressFill).toBeInTheDocument();
    });
  });

  describe('Uncertainty Formatting', () => {
    it('should format uncertainty less than 1 minute', () => {
      const estimate: AccuracyEstimate = {
        ...mockHighAccuracy,
        uncertaintyMinutes: 0.5
      };
      render(<AccuracyIndicator accuracyEstimate={estimate} />);
      expect(screen.getByText(/< 1 minute/)).toBeInTheDocument();
    });

    it('should format exactly 1 minute', () => {
      render(<AccuracyIndicator accuracyEstimate={mockHighAccuracy} />);
      expect(screen.getByText(/±1 minute/)).toBeInTheDocument();
    });

    it('should format multiple minutes', () => {
      render(<AccuracyIndicator accuracyEstimate={mockModerateAccuracy} />);
      expect(screen.getByText(/±5 minutes/)).toBeInTheDocument();
    });

    it('should format hours and minutes', () => {
      const estimate: AccuracyEstimate = {
        ...mockHighAccuracy,
        uncertaintyMinutes: 90
      };
      render(<AccuracyIndicator accuracyEstimate={estimate} />);
      expect(screen.getByText(/±1h 30m/)).toBeInTheDocument();
    });

    it('should format exact hours', () => {
      const estimate: AccuracyEstimate = {
        ...mockHighAccuracy,
        uncertaintyMinutes: 120
      };
      render(<AccuracyIndicator accuracyEstimate={estimate} />);
      expect(screen.getByText(/±2 hours/)).toBeInTheDocument();
    });
  });

  describe('Confidence Interval Display', () => {
    it('should display confidence interval range', () => {
      render(<AccuracyIndicator accuracyEstimate={mockHighAccuracy} />);
      expect(screen.getByText(/Range:/)).toBeInTheDocument();
      expect(screen.getByText(/2 minutes/)).toBeInTheDocument();
    });

    it('should calculate interval correctly for larger ranges', () => {
      render(<AccuracyIndicator accuracyEstimate={mockModerateAccuracy} />);
      expect(screen.getByText(/Range:/)).toBeInTheDocument();
      expect(screen.getByText(/10 minutes/)).toBeInTheDocument();
    });
  });

  describe('Method Comparison', () => {
    it('should not show method comparison by default', () => {
      render(
        <AccuracyIndicator 
          accuracyEstimate={mockHighAccuracy}
          alternativeCalculations={mockAlternativeCalculations}
        />
      );
      expect(screen.queryByText('Method Comparison')).not.toBeInTheDocument();
    });

    it('should show method comparison when showMethodComparison is true', () => {
      render(
        <AccuracyIndicator 
          accuracyEstimate={mockHighAccuracy}
          alternativeCalculations={mockAlternativeCalculations}
          showMethodComparison={true}
        />
      );
      expect(screen.getByText('Method Comparison')).toBeInTheDocument();
    });

    it('should display all alternative calculation methods', () => {
      render(
        <AccuracyIndicator 
          accuracyEstimate={mockHighAccuracy}
          alternativeCalculations={mockAlternativeCalculations}
          showMethodComparison={true}
        />
      );
      expect(screen.getByText('VSOP87:')).toBeInTheDocument();
      expect(screen.getByText('ELP2000:')).toBeInTheDocument();
      expect(screen.getByText('Simplified:')).toBeInTheDocument();
    });

    it('should display deviation values with correct sign', () => {
      render(
        <AccuracyIndicator 
          accuracyEstimate={mockHighAccuracy}
          alternativeCalculations={mockAlternativeCalculations}
          showMethodComparison={true}
        />
      );
      expect(screen.getByText('+2m')).toBeInTheDocument();
      expect(screen.getByText('+5m')).toBeInTheDocument();
      expect(screen.getByText('+15m')).toBeInTheDocument();
    });

    it('should handle negative deviations', () => {
      const negativeDeviations: AlternativeCalculation[] = [
        { method: 'Method1', result: new Date(), deviation: -3 }
      ];
      render(
        <AccuracyIndicator 
          accuracyEstimate={mockHighAccuracy}
          alternativeCalculations={negativeDeviations}
          showMethodComparison={true}
        />
      );
      expect(screen.getByText('-3m')).toBeInTheDocument();
    });

    it('should color-code deviations based on magnitude', () => {
      const { container } = render(
        <AccuracyIndicator 
          accuracyEstimate={mockHighAccuracy}
          alternativeCalculations={mockAlternativeCalculations}
          showMethodComparison={true}
        />
      );
      
      // Small deviation (< 5) should be green
      const smallDeviation = screen.getByText('+2m');
      expect(smallDeviation).toHaveClass('text-green-400');
      
      // Medium deviation (5-15) should be yellow
      const mediumDeviation = screen.getByText('+5m');
      expect(mediumDeviation).toHaveClass('text-yellow-400');
      
      // Large deviation (>= 15) should be orange
      const largeDeviation = screen.getByText('+15m');
      expect(largeDeviation).toHaveClass('text-orange-400');
    });

    it('should not show method comparison when no alternatives provided', () => {
      render(
        <AccuracyIndicator 
          accuracyEstimate={mockHighAccuracy}
          showMethodComparison={true}
        />
      );
      expect(screen.queryByText('Method Comparison')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper region role and label', () => {
      render(<AccuracyIndicator accuracyEstimate={mockHighAccuracy} />);
      const region = screen.getByRole('region', { name: /calculation accuracy information/i });
      expect(region).toBeInTheDocument();
    });

    it('should have aria-label for reliability', () => {
      render(<AccuracyIndicator accuracyEstimate={mockHighAccuracy} />);
      const reliabilityElement = screen.getByLabelText(/Reliability: High/i);
      expect(reliabilityElement).toBeInTheDocument();
    });

    it('should have proper progressbar aria attributes', () => {
      render(<AccuracyIndicator accuracyEstimate={mockModerateAccuracy} />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-label', 'Reliability score: 75 percent');
    });

    it('should have listitem roles for alternative calculations', () => {
      const { container } = render(
        <AccuracyIndicator 
          accuracyEstimate={mockHighAccuracy}
          alternativeCalculations={mockAlternativeCalculations}
          showMethodComparison={true}
        />
      );
      const listItems = container.querySelectorAll('[role="listitem"]');
      expect(listItems).toHaveLength(3);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero uncertainty', () => {
      const estimate: AccuracyEstimate = {
        ...mockHighAccuracy,
        uncertaintyMinutes: 0
      };
      render(<AccuracyIndicator accuracyEstimate={estimate} />);
      expect(screen.getByText(/< 1 minute/)).toBeInTheDocument();
    });

    it('should handle very large uncertainty', () => {
      const estimate: AccuracyEstimate = {
        ...mockHighAccuracy,
        uncertaintyMinutes: 500
      };
      render(<AccuracyIndicator accuracyEstimate={estimate} />);
      expect(screen.getByText(/±8h 20m/)).toBeInTheDocument();
    });

    it('should handle reliability score of 1.0', () => {
      const estimate: AccuracyEstimate = {
        ...mockHighAccuracy,
        reliabilityScore: 1.0
      };
      render(<AccuracyIndicator accuracyEstimate={estimate} />);
      expect(screen.getByText('100%')).toBeInTheDocument();
      expect(screen.getByText('High')).toBeInTheDocument();
    });

    it('should handle reliability score of 0', () => {
      const estimate: AccuracyEstimate = {
        ...mockHighAccuracy,
        reliabilityScore: 0
      };
      render(<AccuracyIndicator accuracyEstimate={estimate} />);
      expect(screen.getByText('0%')).toBeInTheDocument();
      expect(screen.getByText('Low')).toBeInTheDocument();
    });

    it('should handle empty alternative calculations array', () => {
      render(
        <AccuracyIndicator 
          accuracyEstimate={mockHighAccuracy}
          alternativeCalculations={[]}
          showMethodComparison={true}
        />
      );
      expect(screen.queryByText('Method Comparison')).not.toBeInTheDocument();
    });

    it('should handle very long calculation method names', () => {
      const estimate: AccuracyEstimate = {
        ...mockHighAccuracy,
        calculationMethod: 'Very Long Calculation Method Name That Should Display'
      };
      render(<AccuracyIndicator accuracyEstimate={estimate} />);
      expect(screen.getByText('Very Long Calculation Method Name That Should Display')).toBeInTheDocument();
    });
  });
});
