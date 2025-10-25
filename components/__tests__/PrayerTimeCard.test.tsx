import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PrayerTimeCard from '../PrayerTimeCard';
import { PrayerTime } from '../../types';

describe('PrayerTimeCard', () => {
  const mockIslamicPrayer: PrayerTime = {
    name: 'Fajr',
    time: new Date('2025-10-19T05:30:00'),
    tradition: 'islam',
    calculationMethod: 'MuslimWorldLeague',
    qiblaDirection: 45.5
  };

  const mockJewishPrayer: PrayerTime = {
    name: 'Shacharit',
    time: new Date('2025-10-19T07:00:00'),
    tradition: 'judaism',
    calculationMethod: 'standard'
  };

  const mockChristianPrayer: PrayerTime = {
    name: 'Lauds',
    time: new Date('2025-10-19T06:00:00'),
    tradition: 'christianity',
    calculationMethod: 'canonical-hours'
  };

  describe('Basic Rendering', () => {
    it('should render prayer name', () => {
      render(<PrayerTimeCard prayer={mockIslamicPrayer} />);
      expect(screen.getByText('Fajr')).toBeInTheDocument();
    });

    it('should render prayer time in 12-hour format', () => {
      render(<PrayerTimeCard prayer={mockIslamicPrayer} />);
      // The time should be formatted as 05:30 AM
      expect(screen.getByText(/05:30 AM/i)).toBeInTheDocument();
    });

    it('should render calculation method', () => {
      render(<PrayerTimeCard prayer={mockIslamicPrayer} />);
      expect(screen.getByText('Calculation Method:')).toBeInTheDocument();
      expect(screen.getByText('Muslim World League')).toBeInTheDocument();
    });

    it('should render date information', () => {
      render(<PrayerTimeCard prayer={mockIslamicPrayer} />);
      // Should show abbreviated date
      const dateText = screen.getByText(/Sun, Oct 19/i);
      expect(dateText).toBeInTheDocument();
    });
  });

  describe('Tradition-specific Styling', () => {
    it('should apply Islamic tradition colors', () => {
      const { container } = render(<PrayerTimeCard prayer={mockIslamicPrayer} />);
      const prayerName = screen.getByText('Fajr');
      expect(prayerName).toHaveClass('text-green-400');
    });

    it('should apply Jewish tradition colors', () => {
      const { container } = render(<PrayerTimeCard prayer={mockJewishPrayer} />);
      const prayerName = screen.getByText('Shacharit');
      expect(prayerName).toHaveClass('text-blue-400');
    });

    it('should apply Christian tradition colors', () => {
      const { container } = render(<PrayerTimeCard prayer={mockChristianPrayer} />);
      const prayerName = screen.getByText('Lauds');
      expect(prayerName).toHaveClass('text-purple-400');
    });
  });

  describe('Next Prayer Indicator', () => {
    it('should show NEXT badge when isNext is true', () => {
      render(<PrayerTimeCard prayer={mockIslamicPrayer} isNext={true} />);
      expect(screen.getByText('NEXT')).toBeInTheDocument();
    });

    it('should not show NEXT badge when isNext is false', () => {
      render(<PrayerTimeCard prayer={mockIslamicPrayer} isNext={false} />);
      expect(screen.queryByText('NEXT')).not.toBeInTheDocument();
    });

    it('should apply highlight styling when isNext is true', () => {
      const { container } = render(<PrayerTimeCard prayer={mockIslamicPrayer} isNext={true} />);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('scale-105');
    });
  });

  // Qibla Direction Display tests removed - Qibla is now a standalone feature

  describe('Calculation Method Formatting', () => {
    it('should format PascalCase calculation methods', () => {
      render(<PrayerTimeCard prayer={mockIslamicPrayer} />);
      expect(screen.getByText('Muslim World League')).toBeInTheDocument();
    });

    it('should format camelCase calculation methods', () => {
      const prayer: PrayerTime = {
        ...mockIslamicPrayer,
        calculationMethod: 'canonicalHours'
      };
      render(<PrayerTimeCard prayer={prayer} />);
      expect(screen.getByText('Canonical Hours')).toBeInTheDocument();
    });

    it('should format hyphenated calculation methods', () => {
      const prayer: PrayerTime = {
        ...mockChristianPrayer,
        calculationMethod: 'canonical-hours'
      };
      render(<PrayerTimeCard prayer={prayer} />);
      expect(screen.getByText('Canonical-hours')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA role', () => {
      const { container } = render(<PrayerTimeCard prayer={mockIslamicPrayer} />);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveAttribute('role', 'article');
    });

    it('should have descriptive aria-label', () => {
      render(<PrayerTimeCard prayer={mockIslamicPrayer} />);
      const card = screen.getByLabelText(/Fajr prayer time at 05:30 AM/i);
      expect(card).toBeInTheDocument();
    });

    it('should have aria-label for NEXT badge', () => {
      render(<PrayerTimeCard prayer={mockIslamicPrayer} isNext={true} />);
      const nextBadge = screen.getByLabelText('Next prayer');
      expect(nextBadge).toBeInTheDocument();
    });

    it('should hide decorative SVG from screen readers', () => {
      render(<PrayerTimeCard prayer={mockIslamicPrayer} />);
      const svg = document.querySelector('svg');
      expect(svg).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Time Formatting', () => {
    it('should format morning times correctly', () => {
      const morningPrayer: PrayerTime = {
        ...mockIslamicPrayer,
        time: new Date('2025-10-19T08:15:00')
      };
      render(<PrayerTimeCard prayer={morningPrayer} />);
      expect(screen.getByText(/08:15 AM/i)).toBeInTheDocument();
    });

    it('should format afternoon times correctly', () => {
      const afternoonPrayer: PrayerTime = {
        ...mockIslamicPrayer,
        time: new Date('2025-10-19T15:45:00')
      };
      render(<PrayerTimeCard prayer={afternoonPrayer} />);
      expect(screen.getByText(/03:45 PM/i)).toBeInTheDocument();
    });

    it('should format midnight correctly', () => {
      const midnightPrayer: PrayerTime = {
        ...mockIslamicPrayer,
        time: new Date('2025-10-19T00:00:00')
      };
      render(<PrayerTimeCard prayer={midnightPrayer} />);
      expect(screen.getByText(/12:00 AM/i)).toBeInTheDocument();
    });

    it('should format noon correctly', () => {
      const noonPrayer: PrayerTime = {
        ...mockIslamicPrayer,
        name: 'Dhuhr',
        time: new Date('2025-10-19T12:00:00')
      };
      render(<PrayerTimeCard prayer={noonPrayer} />);
      expect(screen.getByText(/12:00 PM/i)).toBeInTheDocument();
    });
  });

  describe('Different Prayer Types', () => {
    it('should render Islamic prayer correctly', () => {
      render(<PrayerTimeCard prayer={mockIslamicPrayer} />);
      expect(screen.getByText('Fajr')).toBeInTheDocument();
      expect(screen.getByText('Muslim World League')).toBeInTheDocument();
    });

    it('should render Jewish prayer correctly', () => {
      render(<PrayerTimeCard prayer={mockJewishPrayer} />);
      expect(screen.getByText('Shacharit')).toBeInTheDocument();
      expect(screen.getByText('Standard')).toBeInTheDocument();
    });

    it('should render Christian prayer correctly', () => {
      render(<PrayerTimeCard prayer={mockChristianPrayer} />);
      expect(screen.getByText('Lauds')).toBeInTheDocument();
      expect(screen.getByText('Traditional')).toBeInTheDocument();
    });
  });

  // Qibla Compass Rotation tests removed - Qibla is now a standalone feature

  describe('Rak\'ah Display - Detailed Breakdown', () => {
    it('should display Sunnah Before when sunnahBefore > 0', () => {
      const prayer: PrayerTime = {
        ...mockIslamicPrayer,
        name: 'Fajr',
        sunnahBefore: 2,
        fard: 0,
        sunnahAfter: 0,
        witr: 0
      };
      render(<PrayerTimeCard prayer={prayer} />);
      expect(screen.getByText('Sunnah Before')).toBeInTheDocument();
      expect(screen.getByText('2 Rak\'ah')).toBeInTheDocument();
    });

    it('should display Fard when fard > 0', () => {
      const prayer: PrayerTime = {
        ...mockIslamicPrayer,
        name: 'Fajr',
        sunnahBefore: 0,
        fard: 2,
        sunnahAfter: 0,
        witr: 0
      };
      render(<PrayerTimeCard prayer={prayer} />);
      expect(screen.getByText('Fard')).toBeInTheDocument();
      expect(screen.getByText('2 Rak\'ah')).toBeInTheDocument();
    });

    it('should display Sunnah After when sunnahAfter > 0', () => {
      const prayer: PrayerTime = {
        ...mockIslamicPrayer,
        name: 'Dhuhr',
        sunnahBefore: 0,
        fard: 0,
        sunnahAfter: 2,
        witr: 0
      };
      render(<PrayerTimeCard prayer={prayer} />);
      expect(screen.getByText('Sunnah After')).toBeInTheDocument();
      expect(screen.getByText('2 Rak\'ah')).toBeInTheDocument();
    });

    it('should display Witr when witr > 0', () => {
      const prayer: PrayerTime = {
        ...mockIslamicPrayer,
        name: 'Isha',
        sunnahBefore: 0,
        fard: 0,
        sunnahAfter: 0,
        witr: 3
      };
      render(<PrayerTimeCard prayer={prayer} />);
      expect(screen.getByText('Witr')).toBeInTheDocument();
      expect(screen.getByText('3 Rak\'ah')).toBeInTheDocument();
    });

    it('should display complete breakdown for Fajr', () => {
      const prayer: PrayerTime = {
        ...mockIslamicPrayer,
        name: 'Fajr',
        sunnahBefore: 2,
        fard: 2,
        sunnahAfter: 0,
        witr: 0
      };
      render(<PrayerTimeCard prayer={prayer} />);
      expect(screen.getByText('Sunnah Before')).toBeInTheDocument();
      expect(screen.getByText('Fard')).toBeInTheDocument();
      expect(screen.queryByText('Sunnah After')).not.toBeInTheDocument();
      expect(screen.queryByText('Witr')).not.toBeInTheDocument();
    });

    it('should display complete breakdown for Dhuhr', () => {
      const prayer: PrayerTime = {
        ...mockIslamicPrayer,
        name: 'Dhuhr',
        sunnahBefore: 4,
        fard: 4,
        sunnahAfter: 2,
        witr: 0
      };
      render(<PrayerTimeCard prayer={prayer} />);
      expect(screen.getByText('Sunnah Before')).toBeInTheDocument();
      expect(screen.getByText('Fard')).toBeInTheDocument();
      expect(screen.getByText('Sunnah After')).toBeInTheDocument();
      expect(screen.queryByText('Witr')).not.toBeInTheDocument();
    });

    it('should display complete breakdown for Asr', () => {
      const prayer: PrayerTime = {
        ...mockIslamicPrayer,
        name: 'Asr',
        sunnahBefore: 4,
        fard: 4,
        sunnahAfter: 0,
        witr: 0
      };
      render(<PrayerTimeCard prayer={prayer} />);
      expect(screen.getByText('Sunnah Before')).toBeInTheDocument();
      expect(screen.getByText('Fard')).toBeInTheDocument();
      expect(screen.queryByText('Sunnah After')).not.toBeInTheDocument();
      expect(screen.queryByText('Witr')).not.toBeInTheDocument();
    });

    it('should display complete breakdown for Maghrib', () => {
      const prayer: PrayerTime = {
        ...mockIslamicPrayer,
        name: 'Maghrib',
        sunnahBefore: 2,
        fard: 3,
        sunnahAfter: 2,
        witr: 0
      };
      render(<PrayerTimeCard prayer={prayer} />);
      expect(screen.getByText('Sunnah Before')).toBeInTheDocument();
      expect(screen.getByText('Fard')).toBeInTheDocument();
      expect(screen.getByText('Sunnah After')).toBeInTheDocument();
      expect(screen.queryByText('Witr')).not.toBeInTheDocument();
    });

    it('should display complete breakdown for Isha with Witr', () => {
      const prayer: PrayerTime = {
        ...mockIslamicPrayer,
        name: 'Isha',
        sunnahBefore: 2,
        fard: 4,
        sunnahAfter: 2,
        witr: 3
      };
      render(<PrayerTimeCard prayer={prayer} />);
      expect(screen.getByText('Sunnah Before')).toBeInTheDocument();
      expect(screen.getByText('Fard')).toBeInTheDocument();
      expect(screen.getByText('Sunnah After')).toBeInTheDocument();
      expect(screen.getByText('Witr')).toBeInTheDocument();
    });

    it('should not display Rak\'ah section when all are 0 or undefined', () => {
      const prayer: PrayerTime = {
        ...mockIslamicPrayer,
        sunnahBefore: 0,
        fard: 0,
        sunnahAfter: 0,
        witr: 0,
        rakahOptional: 0
      };
      render(<PrayerTimeCard prayer={prayer} />);
      expect(screen.queryByText('Sunnah Before')).not.toBeInTheDocument();
      expect(screen.queryByText('Fard')).not.toBeInTheDocument();
      expect(screen.queryByText('Sunnah After')).not.toBeInTheDocument();
      expect(screen.queryByText('Witr')).not.toBeInTheDocument();
      expect(screen.queryByText('Optional')).not.toBeInTheDocument();
    });

    it('should not display Rak\'ah for non-Islamic traditions', () => {
      const prayer: PrayerTime = {
        ...mockJewishPrayer,
        sunnahBefore: 2,
        fard: 2,
        sunnahAfter: 0,
        witr: 0
      };
      render(<PrayerTimeCard prayer={prayer} />);
      expect(screen.queryByText('Sunnah Before')).not.toBeInTheDocument();
      expect(screen.queryByText('Fard')).not.toBeInTheDocument();
      expect(screen.queryByText('Sunnah After')).not.toBeInTheDocument();
      expect(screen.queryByText('Witr')).not.toBeInTheDocument();
    });

    it('should display Optional (Nafl) for backward compatibility', () => {
      const prayer: PrayerTime = {
        ...mockIslamicPrayer,
        name: 'Sunrise',
        sunnahBefore: 0,
        fard: 0,
        sunnahAfter: 0,
        witr: 0,
        rakahOptional: 2
      };
      render(<PrayerTimeCard prayer={prayer} />);
      expect(screen.getByText('Optional')).toBeInTheDocument();
      expect(screen.getByText('2 Rak\'ah')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long prayer names', () => {
      const prayer: PrayerTime = {
        ...mockIslamicPrayer,
        name: 'Very Long Prayer Name That Should Still Display Correctly'
      };
      render(<PrayerTimeCard prayer={prayer} />);
      expect(screen.getByText('Very Long Prayer Name That Should Still Display Correctly')).toBeInTheDocument();
    });

    it('should handle very long calculation method names', () => {
      const prayer: PrayerTime = {
        ...mockIslamicPrayer,
        calculationMethod: 'VeryLongCalculationMethodNameThatShouldStillFormat'
      };
      render(<PrayerTimeCard prayer={prayer} />);
      expect(screen.getByText(/Very Long Calculation Method Name That Should Still Format/i)).toBeInTheDocument();
    });


  });
});
