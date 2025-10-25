import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LunarDetailPanel from '../LunarDetailPanel';
import { EnhancedLunarIllumination, AlternativeCalculation } from '../../types';

describe('LunarDetailPanel', () => {
  const mockEnhancedIllumination: EnhancedLunarIllumination = {
    fraction: 0.75,
    phaseName: 'Waxing Gibbous',
    phaseAngle: 135.5,
    librationData: {
      longitudeLibration: 5.2,
      latitudeLibration: -3.1,
      apparentDiameter: 31.5
    },
    apparentDiameter: 31.5,
    distance: 384400
  };

  const mockAccuracyEstimate = {
    confidenceInterval: {
      min: new Date('2025-10-19T12:00:00'),
      max: new Date('2025-10-19T12:05:00')
    },
    uncertaintyMinutes: 2.5,
    calculationMethod: 'Meeus',
    reliabilityScore: 0.92
  };

  const mockAlternativeCalculations: AlternativeCalculation[] = [
    { method: 'VSOP87', result: new Date('2025-10-19T12:02:00'), deviation: 2 },
    { method: 'ELP2000', result: new Date('2025-10-19T12:03:00'), deviation: 3 }
  ];

  describe('Basic Rendering', () => {
    it('should render enhanced lunar data heading', () => {
      render(<LunarDetailPanel illumination={mockEnhancedIllumination} />);
      expect(screen.getByText('Enhanced Lunar Data')).toBeInTheDocument();
    });

    it('should render phase name', () => {
      render(<LunarDetailPanel illumination={mockEnhancedIllumination} />);
      expect(screen.getByText('Waxing Gibbous')).toBeInTheDocument();
    });

    it('should render illumination percentage', () => {
      render(<LunarDetailPanel illumination={mockEnhancedIllumination} />);
      expect(screen.getByText('75.0%')).toBeInTheDocument();
      expect(screen.getByText('illuminated')).toBeInTheDocument();
    });

    it('should render phase angle', () => {
      render(<LunarDetailPanel illumination={mockEnhancedIllumination} />);
      expect(screen.getByText('Phase Angle')).toBeInTheDocument();
      expect(screen.getByText('135.5°')).toBeInTheDocument();
    });

    it('should render distance', () => {
      render(<LunarDetailPanel illumination={mockEnhancedIllumination} />);
      expect(screen.getByText('Distance')).toBeInTheDocument();
      expect(screen.getByText('384,400 km')).toBeInTheDocument();
    });

    it('should render apparent diameter', () => {
      render(<LunarDetailPanel illumination={mockEnhancedIllumination} />);
      expect(screen.getByText('Apparent Diameter')).toBeInTheDocument();
      expect(screen.getByText("31.50'")).toBeInTheDocument();
    });
  });

  describe('Libration Data Display', () => {
    it('should render libration section when showAdvancedData is true', () => {
      render(<LunarDetailPanel illumination={mockEnhancedIllumination} showAdvancedData={true} />);
      expect(screen.getByText('Libration')).toBeInTheDocument();
    });

    it('should not render libration section when showAdvancedData is false', () => {
      render(<LunarDetailPanel illumination={mockEnhancedIllumination} showAdvancedData={false} />);
      expect(screen.queryByText('Libration')).not.toBeInTheDocument();
    });

    it('should display longitude libration with correct sign', () => {
      render(<LunarDetailPanel illumination={mockEnhancedIllumination} />);
      expect(screen.getByText('+5.20°')).toBeInTheDocument();
    });

    it('should display latitude libration with correct sign', () => {
      render(<LunarDetailPanel illumination={mockEnhancedIllumination} />);
      expect(screen.getByText('-3.10°')).toBeInTheDocument();
    });

    it('should show "East visible" for positive longitude libration', () => {
      render(<LunarDetailPanel illumination={mockEnhancedIllumination} />);
      expect(screen.getByText('East visible')).toBeInTheDocument();
    });

    it('should show "West visible" for negative longitude libration', () => {
      const illumination: EnhancedLunarIllumination = {
        ...mockEnhancedIllumination,
        librationData: {
          ...mockEnhancedIllumination.librationData!,
          longitudeLibration: -5.2
        }
      };
      render(<LunarDetailPanel illumination={illumination} />);
      expect(screen.getByText('West visible')).toBeInTheDocument();
    });

    it('should show "North visible" for positive latitude libration', () => {
      const illumination: EnhancedLunarIllumination = {
        ...mockEnhancedIllumination,
        librationData: {
          ...mockEnhancedIllumination.librationData!,
          latitudeLibration: 3.1
        }
      };
      render(<LunarDetailPanel illumination={illumination} />);
      expect(screen.getByText('North visible')).toBeInTheDocument();
    });

    it('should show "South visible" for negative latitude libration', () => {
      render(<LunarDetailPanel illumination={mockEnhancedIllumination} />);
      expect(screen.getByText('South visible')).toBeInTheDocument();
    });

    it('should display libration explanation', () => {
      render(<LunarDetailPanel illumination={mockEnhancedIllumination} />);
      expect(screen.getByText(/Libration shows which parts of the Moon's far side/i)).toBeInTheDocument();
    });
  });

  describe('Atmospheric Correction Display', () => {
    it('should display "None" when atmospheric correction is 0', () => {
      render(<LunarDetailPanel illumination={mockEnhancedIllumination} atmosphericCorrection={0} />);
      expect(screen.getByText('None')).toBeInTheDocument();
    });

    it('should display positive atmospheric correction in minutes', () => {
      render(<LunarDetailPanel illumination={mockEnhancedIllumination} atmosphericCorrection={2.5} />);
      expect(screen.getByText('+2.5m')).toBeInTheDocument();
    });

    it('should display negative atmospheric correction in minutes', () => {
      render(<LunarDetailPanel illumination={mockEnhancedIllumination} atmosphericCorrection={-1.8} />);
      expect(screen.getByText('-1.8m')).toBeInTheDocument();
    });

    it('should display small corrections in seconds', () => {
      render(<LunarDetailPanel illumination={mockEnhancedIllumination} atmosphericCorrection={0.5} />);
      expect(screen.getByText('+30s')).toBeInTheDocument();
    });
  });

  describe('Accuracy Estimate Display', () => {
    it('should render accuracy indicator when accuracyEstimate is provided', () => {
      render(
        <LunarDetailPanel 
          illumination={mockEnhancedIllumination}
          accuracyEstimate={mockAccuracyEstimate}
        />
      );
      expect(screen.getByText('Calculation Accuracy')).toBeInTheDocument();
    });

    it('should not render accuracy indicator when accuracyEstimate is not provided', () => {
      render(<LunarDetailPanel illumination={mockEnhancedIllumination} />);
      expect(screen.queryByText('Calculation Accuracy')).not.toBeInTheDocument();
    });

    it('should show method comparison toggle when alternative calculations exist', () => {
      render(
        <LunarDetailPanel 
          illumination={mockEnhancedIllumination}
          accuracyEstimate={mockAccuracyEstimate}
          alternativeCalculations={mockAlternativeCalculations}
        />
      );
      expect(screen.getByText('Show Method Comparison')).toBeInTheDocument();
    });

    it('should not show method comparison toggle when no alternative calculations', () => {
      render(
        <LunarDetailPanel 
          illumination={mockEnhancedIllumination}
          accuracyEstimate={mockAccuracyEstimate}
          alternativeCalculations={[]}
        />
      );
      expect(screen.queryByText('Show Method Comparison')).not.toBeInTheDocument();
    });

    it('should toggle method comparison visibility on button click', () => {
      render(
        <LunarDetailPanel 
          illumination={mockEnhancedIllumination}
          accuracyEstimate={mockAccuracyEstimate}
          alternativeCalculations={mockAlternativeCalculations}
        />
      );
      
      const toggleButton = screen.getByText('Show Method Comparison');
      expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
      
      fireEvent.click(toggleButton);
      
      expect(screen.getByText('Hide Method Comparison')).toBeInTheDocument();
      expect(screen.getByText('Hide Method Comparison')).toHaveAttribute('aria-expanded', 'true');
    });
  });

  describe('Advanced Data Information', () => {
    it('should display "About This Data" section when showAdvancedData is true', () => {
      render(<LunarDetailPanel illumination={mockEnhancedIllumination} showAdvancedData={true} />);
      expect(screen.getByText('About This Data')).toBeInTheDocument();
    });

    it('should not display "About This Data" section when showAdvancedData is false', () => {
      render(<LunarDetailPanel illumination={mockEnhancedIllumination} showAdvancedData={false} />);
      expect(screen.queryByText('About This Data')).not.toBeInTheDocument();
    });

    it('should display phase angle explanation', () => {
      render(<LunarDetailPanel illumination={mockEnhancedIllumination} />);
      expect(screen.getByText(/The angle between the Sun, Moon, and Earth/i)).toBeInTheDocument();
    });

    it('should display apparent diameter explanation', () => {
      render(<LunarDetailPanel illumination={mockEnhancedIllumination} />);
      expect(screen.getByText(/The Moon's angular size as seen from Earth/i)).toBeInTheDocument();
    });

    it('should display libration explanation', () => {
      render(<LunarDetailPanel illumination={mockEnhancedIllumination} />);
      expect(screen.getByText(/The slight wobble in the Moon's orientation/i)).toBeInTheDocument();
    });

    it('should display atmospheric correction explanation when correction is not zero', () => {
      render(
        <LunarDetailPanel 
          illumination={mockEnhancedIllumination}
          atmosphericCorrection={2.5}
        />
      );
      expect(screen.getByText(/Adjustment for atmospheric refraction/i)).toBeInTheDocument();
    });

    it('should not display atmospheric correction explanation when correction is zero', () => {
      render(
        <LunarDetailPanel 
          illumination={mockEnhancedIllumination}
          atmosphericCorrection={0}
        />
      );
      expect(screen.queryByText(/Adjustment for atmospheric refraction/i)).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper region role and label', () => {
      render(<LunarDetailPanel illumination={mockEnhancedIllumination} />);
      const region = screen.getByRole('region', { name: /detailed lunar information/i });
      expect(region).toBeInTheDocument();
    });

    it('should have aria-expanded attribute on method comparison toggle', () => {
      render(
        <LunarDetailPanel 
          illumination={mockEnhancedIllumination}
          accuracyEstimate={mockAccuracyEstimate}
          alternativeCalculations={mockAlternativeCalculations}
        />
      );
      const toggleButton = screen.getByText('Show Method Comparison');
      expect(toggleButton).toHaveAttribute('aria-expanded');
      expect(toggleButton).toHaveAttribute('aria-controls', 'method-comparison');
    });
  });

  describe('Edge Cases', () => {
    it('should handle illumination without libration data', () => {
      const illumination: EnhancedLunarIllumination = {
        ...mockEnhancedIllumination,
        librationData: undefined
      };
      render(<LunarDetailPanel illumination={illumination} />);
      expect(screen.queryByText('Libration')).not.toBeInTheDocument();
    });

    it('should handle 0% illumination (New Moon)', () => {
      const illumination: EnhancedLunarIllumination = {
        ...mockEnhancedIllumination,
        fraction: 0,
        phaseName: 'New Moon',
        phaseAngle: 0
      };
      render(<LunarDetailPanel illumination={illumination} />);
      expect(screen.getByText('0.0%')).toBeInTheDocument();
      expect(screen.getByText('New Moon')).toBeInTheDocument();
    });

    it('should handle 100% illumination (Full Moon)', () => {
      const illumination: EnhancedLunarIllumination = {
        ...mockEnhancedIllumination,
        fraction: 1,
        phaseName: 'Full Moon',
        phaseAngle: 180
      };
      render(<LunarDetailPanel illumination={illumination} />);
      expect(screen.getByText('100.0%')).toBeInTheDocument();
      expect(screen.getByText('Full Moon')).toBeInTheDocument();
    });

    it('should handle zero libration values', () => {
      const illumination: EnhancedLunarIllumination = {
        ...mockEnhancedIllumination,
        librationData: {
          longitudeLibration: 0,
          latitudeLibration: 0,
          apparentDiameter: 31.5
        }
      };
      render(<LunarDetailPanel illumination={illumination} />);
      const zeroValues = screen.getAllByText('+0.00°');
      expect(zeroValues).toHaveLength(2); // One for longitude, one for latitude
    });

    it('should handle very large distance values', () => {
      const illumination: EnhancedLunarIllumination = {
        ...mockEnhancedIllumination,
        distance: 405500
      };
      render(<LunarDetailPanel illumination={illumination} />);
      expect(screen.getByText('405,500 km')).toBeInTheDocument();
    });

    it('should handle very small distance values', () => {
      const illumination: EnhancedLunarIllumination = {
        ...mockEnhancedIllumination,
        distance: 356500
      };
      render(<LunarDetailPanel illumination={illumination} />);
      expect(screen.getByText('356,500 km')).toBeInTheDocument();
    });

    it('should handle extreme libration values', () => {
      const illumination: EnhancedLunarIllumination = {
        ...mockEnhancedIllumination,
        librationData: {
          longitudeLibration: 7.9,
          latitudeLibration: -6.8,
          apparentDiameter: 31.5
        }
      };
      render(<LunarDetailPanel illumination={illumination} />);
      expect(screen.getByText('+7.90°')).toBeInTheDocument();
      expect(screen.getByText('-6.80°')).toBeInTheDocument();
    });

    it('should handle very small atmospheric corrections', () => {
      render(
        <LunarDetailPanel 
          illumination={mockEnhancedIllumination}
          atmosphericCorrection={0.01}
        />
      );
      expect(screen.getByText('+1s')).toBeInTheDocument();
    });
  });

  describe('Different Moon Phases', () => {
    it('should render New Moon correctly', () => {
      const illumination: EnhancedLunarIllumination = {
        ...mockEnhancedIllumination,
        fraction: 0,
        phaseName: 'New Moon',
        phaseAngle: 0
      };
      render(<LunarDetailPanel illumination={illumination} />);
      expect(screen.getByText('New Moon')).toBeInTheDocument();
      expect(screen.getByText('0.0%')).toBeInTheDocument();
    });

    it('should render First Quarter correctly', () => {
      const illumination: EnhancedLunarIllumination = {
        ...mockEnhancedIllumination,
        fraction: 0.5,
        phaseName: 'First Quarter Moon',
        phaseAngle: 90
      };
      render(<LunarDetailPanel illumination={illumination} />);
      expect(screen.getByText('First Quarter Moon')).toBeInTheDocument();
      expect(screen.getByText('50.0%')).toBeInTheDocument();
    });

    it('should render Full Moon correctly', () => {
      const illumination: EnhancedLunarIllumination = {
        ...mockEnhancedIllumination,
        fraction: 1,
        phaseName: 'Full Moon',
        phaseAngle: 180
      };
      render(<LunarDetailPanel illumination={illumination} />);
      expect(screen.getByText('Full Moon')).toBeInTheDocument();
      expect(screen.getByText('100.0%')).toBeInTheDocument();
    });

    it('should render Third Quarter correctly', () => {
      const illumination: EnhancedLunarIllumination = {
        ...mockEnhancedIllumination,
        fraction: 0.5,
        phaseName: 'Third Quarter Moon',
        phaseAngle: 270
      };
      render(<LunarDetailPanel illumination={illumination} />);
      expect(screen.getByText('Third Quarter Moon')).toBeInTheDocument();
      expect(screen.getByText('50.0%')).toBeInTheDocument();
    });
  });
});
