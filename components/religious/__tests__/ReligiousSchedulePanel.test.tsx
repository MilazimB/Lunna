import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ReligiousSchedulePanel from '../ReligiousSchedulePanel';
import { Location } from '../../../types';

// Mock all religious services
vi.mock('../../../services/religious/IslamicCalendarService', () => ({
  IslamicCalendarService: vi.fn().mockImplementation(() => ({
    getPrayerTimes: vi.fn().mockResolvedValue([]),
    getIslamicHolidays: vi.fn().mockResolvedValue([])
  }))
}));

vi.mock('../../../services/religious/JewishCalendarService', () => ({
  JewishCalendarService: vi.fn().mockImplementation(() => ({
    getPrayerTimes: vi.fn().mockResolvedValue([]),
    getJewishObservances: vi.fn().mockResolvedValue([])
  }))
}));

vi.mock('../../../services/religious/ChristianCalendarService', () => ({
  ChristianCalendarService: vi.fn().mockImplementation(() => ({
    getCanonicalHours: vi.fn().mockResolvedValue([]),
    getLiturgicalEvents: vi.fn().mockResolvedValue([])
  }))
}));

describe('ReligiousSchedulePanel - Basic Tests', () => {
  const mockLocation: Location = {
    latitude: 40.7128,
    longitude: -74.0060,
    elevation: 10,
    timezone: 'America/New_York'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(<ReligiousSchedulePanel location={mockLocation} />);
    expect(screen.getByText(/loading religious schedule/i)).toBeInTheDocument();
  });

  it('renders the component title', async () => {
    render(<ReligiousSchedulePanel location={mockLocation} />);
    
    // Wait for loading to complete
    await screen.findByText('Religious Schedule');
    expect(screen.getByText('Religious Schedule')).toBeInTheDocument();
  });

  it('renders tradition selector buttons', async () => {
    render(<ReligiousSchedulePanel location={mockLocation} selectedTraditions={['islam', 'judaism', 'christianity']} />);
    
    await screen.findByText('Religious Schedule');
    
    expect(screen.getByRole('button', { name: /switch to islamic tradition/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /switch to jewish tradition/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /switch to christian tradition/i })).toBeInTheDocument();
  });

  it('renders prayer times section', async () => {
    render(<ReligiousSchedulePanel location={mockLocation} />);
    
    await screen.findByText('Religious Schedule');
    expect(screen.getByText("Today's Prayer Times")).toBeInTheDocument();
  });

  it('applies correct ARIA labels for accessibility', async () => {
    render(<ReligiousSchedulePanel location={mockLocation} selectedTraditions={['islam']} />);
    
    await screen.findByText('Religious Schedule');
    
    const islamicButton = screen.getByRole('button', { name: /switch to islamic tradition/i });
    expect(islamicButton).toHaveAttribute('aria-pressed');
  });
});
