import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import QiblaView from '../QiblaView';
import { Location } from '../../types';

// Mock the IslamicCalendarService
vi.mock('../../services/religious/IslamicCalendarService', () => ({
  IslamicCalendarService: vi.fn().mockImplementation(() => ({
    getQiblaDirection: vi.fn().mockResolvedValue(137)
  }))
}));

// Mock the responsive hook
vi.mock('../../utils/responsive', () => ({
  useResponsive: () => ({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    getTextSize: (size: string) => size
  })
}));

describe('QiblaView', () => {
  const mockLocation: Location = {
    latitude: 40.7128,
    longitude: -74.0060,
    name: 'New York, NY'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(<QiblaView location={mockLocation} />);
    expect(screen.getByText('Calculating Qibla direction...')).toBeInTheDocument();
  });

  it('renders Qibla compass after loading', async () => {
    render(<QiblaView location={mockLocation} />);

    await waitFor(() => {
      expect(screen.getByText('Qibla Direction')).toBeInTheDocument();
    });

    expect(screen.getByText('Direction to Mecca for Islamic Prayer')).toBeInTheDocument();
  });

  it('displays location information', async () => {
    render(<QiblaView location={mockLocation} />);

    await waitFor(() => {
      expect(screen.getByText('Your Location')).toBeInTheDocument();
    });

    expect(screen.getByText('New York, NY')).toBeInTheDocument();
  });

  it('displays distance to Mecca', async () => {
    render(<QiblaView location={mockLocation} />);

    await waitFor(() => {
      expect(screen.getByText('Distance to Mecca')).toBeInTheDocument();
    });

    // Distance should be calculated and displayed
    const distanceElement = screen.getByText(/km/);
    expect(distanceElement).toBeInTheDocument();
  });

  it('displays usage instructions', async () => {
    render(<QiblaView location={mockLocation} />);

    await waitFor(() => {
      expect(screen.getByText(/How to use:/)).toBeInTheDocument();
    });

    expect(screen.getByText(/Face the direction indicated by the green arrow/)).toBeInTheDocument();
  });

  it('formats coordinates correctly', async () => {
    render(<QiblaView location={mockLocation} />);

    await waitFor(() => {
      expect(screen.getByText(/40.7128° N, 74.0060° W/)).toBeInTheDocument();
    });
  });

  it('handles location without name', async () => {
    const locationWithoutName: Location = {
      latitude: 40.7128,
      longitude: -74.0060
    };

    render(<QiblaView location={locationWithoutName} />);

    await waitFor(() => {
      expect(screen.getByText('Your Location')).toBeInTheDocument();
    });

    // Should still show coordinates
    expect(screen.getByText(/40.7128° N, 74.0060° W/)).toBeInTheDocument();
  });

  it('displays error state when calculation fails', async () => {
    const { IslamicCalendarService } = await import('../../services/religious/IslamicCalendarService');
    vi.mocked(IslamicCalendarService).mockImplementation(() => ({
      getQiblaDirection: vi.fn().mockRejectedValue(new Error('Calculation failed')),
      getPrayerTimes: vi.fn(),
      getIslamicHolidays: vi.fn()
    }) as any);

    render(<QiblaView location={mockLocation} />);

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
    });

    expect(screen.getByText('Calculation failed')).toBeInTheDocument();
  });
});
