import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import ReligiousSchedulePanel from '../religious/ReligiousSchedulePanel';
import { Location, ReligiousTradition } from '../../types';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { beforeEach } from 'node:test';
import { describe } from 'node:test';

// Mock the responsive hook
vi.mock('../../utils/responsive', () => ({
  useResponsive: vi.fn(() => ({
    isMobile: false,
    isTablet: false,
    getTextSize: (size: string) => size
  }))
}));

// Mock the religious services
vi.mock('../../services/religious/IslamicCalendarService', () => ({
  IslamicCalendarService: vi.fn(() => ({
    getPrayerTimes: vi.fn().mockResolvedValue([]),
    getIslamicHolidays: vi.fn().mockResolvedValue([])
  }))
}));

vi.mock('../../services/religious/JewishCalendarService', () => ({
  JewishCalendarService: vi.fn(() => ({
    getPrayerTimes: vi.fn().mockResolvedValue([]),
    getJewishObservances: vi.fn().mockResolvedValue([])
  }))
}));

vi.mock('../../services/religious/ChristianCalendarService', () => ({
  ChristianCalendarService: vi.fn(() => ({
    getCanonicalHours: vi.fn().mockResolvedValue([]),
    getLiturgicalEvents: vi.fn().mockResolvedValue([])
  }))
}));

describe('ReligiousSchedulePanel', () => {
  const mockLocation: Location = {
    latitude: 40.7128,
    longitude: -74.0060
  };

  const mockOnTraditionChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all tradition buttons', async () => {
    render(
      <ReligiousSchedulePanel
        location={mockLocation}
        selectedTraditions={['islam']}
        onTraditionChange={mockOnTraditionChange}
      />
    );

    // Wait for loading to complete
    await screen.findByText('Religious Schedule');

    expect(screen.getByText('Islamic')).toBeInTheDocument();
    expect(screen.getByText('Jewish')).toBeInTheDocument();
    expect(screen.getByText('Christian')).toBeInTheDocument();
  });

  it('allows clicking on unselected traditions', async () => {
    render(
      <ReligiousSchedulePanel
        location={mockLocation}
        selectedTraditions={['islam']}
        onTraditionChange={mockOnTraditionChange}
      />
    );

    await screen.findByText('Religious Schedule');

    const jewishButton = screen.getByText(/Jewish/);
    expect(jewishButton).not.toBeDisabled();
    
    fireEvent.click(jewishButton);
    
    // Should call onTraditionChange to add the tradition
    expect(mockOnTraditionChange).toHaveBeenCalledWith(['islam', 'judaism']);
  });

  it('shows helper text for unselected traditions', async () => {
    render(
      <ReligiousSchedulePanel
        location={mockLocation}
        selectedTraditions={['islam']}
        onTraditionChange={mockOnTraditionChange}
      />
    );

    await screen.findByText('Religious Schedule');

    const helperTexts = screen.getAllByText('(click to enable)');
    expect(helperTexts).toHaveLength(2); // Jewish and Christian buttons
  });

  it('handles all traditions being selected', async () => {
    render(
      <ReligiousSchedulePanel
        location={mockLocation}
        selectedTraditions={['islam', 'judaism', 'christianity']}
        onTraditionChange={mockOnTraditionChange}
      />
    );

    await screen.findByText('Religious Schedule');

    const jewishButton = screen.getByText('Jewish');
    const christianButton = screen.getByText('Christian');
    
    expect(jewishButton).not.toBeDisabled();
    expect(christianButton).not.toBeDisabled();
    expect(screen.queryByText('(click to enable)')).not.toBeInTheDocument();
  });
});