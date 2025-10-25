import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';

// Mock the services
vi.mock('./services/lunarEphemeris', () => ({
  getUpcomingLunarEvents: vi.fn(() => [
    {
      eventName: 'New Moon',
      utcDate: new Date('2024-01-01T12:00:00Z'),
      localSolarDate: new Date('2024-01-01T12:00:00Z'),
      julianDate: 2460310.0,
      accuracyNote: 'Test accuracy note'
    }
  ]),
  getCurrentLunarIllumination: vi.fn(() => ({
    fraction: 0.5,
    phaseName: 'First Quarter Moon',
    phaseAngle: 90
  }))
}));

vi.mock('./services/solarEphemeris', () => ({
  getSolarTimes: vi.fn(() => ({
    sunrise: new Date('2024-01-01T07:00:00Z'),
    sunset: new Date('2024-01-01T17:00:00Z'),
    solarNoon: new Date('2024-01-01T12:00:00Z'),
    goldenHourStart: new Date('2024-01-01T16:00:00Z'),
    goldenHourEnd: new Date('2024-01-01T08:00:00Z'),
    nauticalDawn: new Date('2024-01-01T06:00:00Z'),
    nauticalDusk: new Date('2024-01-01T18:00:00Z')
  }))
}));

vi.mock('./services/geminiService', () => ({
  getLunarLore: vi.fn(() => Promise.resolve('Test lunar lore content'))
}));

// Mock religious services
vi.mock('./services/religious/IslamicCalendarService', () => ({
  IslamicCalendarService: vi.fn().mockImplementation(() => ({
    getPrayerTimes: vi.fn(() => Promise.resolve([
      {
        name: 'Fajr',
        time: new Date('2024-01-01T05:30:00Z'),
        tradition: 'islam',
        calculationMethod: 'MuslimWorldLeague'
      }
    ])),
    getIslamicHolidays: vi.fn(() => Promise.resolve([
      {
        id: 'test-holiday',
        name: 'Test Holiday',
        tradition: 'islam',
        date: new Date('2024-01-15T00:00:00Z'),
        description: 'Test holiday description',
        significance: 'Test significance',
        observanceType: 'holiday'
      }
    ]))
  }))
}));

vi.mock('./services/religious/JewishCalendarService', () => ({
  JewishCalendarService: vi.fn().mockImplementation(() => ({
    getPrayerTimes: vi.fn(() => Promise.resolve([])),
    getJewishObservances: vi.fn(() => Promise.resolve([]))
  }))
}));

vi.mock('./services/religious/ChristianCalendarService', () => ({
  ChristianCalendarService: vi.fn().mockImplementation(() => ({
    getCanonicalHours: vi.fn(() => Promise.resolve([])),
    getLiturgicalEvents: vi.fn(() => Promise.resolve([]))
  }))
}));

// Mock geolocation
const mockGeolocation = {
  getCurrentPosition: vi.fn()
};

Object.defineProperty(global.navigator, 'geolocation', {
  value: mockGeolocation,
  writable: true
});

describe('App Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock successful geolocation
    mockGeolocation.getCurrentPosition.mockImplementation((success) => {
      success({
        coords: {
          latitude: 40.7128,
          longitude: -74.0060
        }
      });
    });
  });

  it('renders main application with navigation', async () => {
    render(<App />);
    
    // Check that the main title is rendered
    expect(screen.getByText('Celestial Events Calculator')).toBeInTheDocument();
    
    // Check that navigation buttons are present
    expect(screen.getByRole('button', { name: /astronomical view/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /religious schedule view/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /calendar view/i })).toBeInTheDocument();
  });

  it('switches between astronomical and religious views', async () => {
    render(<App />);
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Current Moon Illumination')).toBeInTheDocument();
    });
    
    // Switch to religious view
    const religiousButton = screen.getByRole('button', { name: /religious schedule view/i });
    fireEvent.click(religiousButton);
    
    // Check that religious content is shown
    await waitFor(() => {
      expect(screen.getByText('Religious Schedule')).toBeInTheDocument();
    });
    
    // Switch back to astronomical view
    const astronomicalButton = screen.getByRole('button', { name: /astronomical view/i });
    fireEvent.click(astronomicalButton);
    
    // Check that astronomical content is shown again
    await waitFor(() => {
      expect(screen.getByText('Current Moon Illumination')).toBeInTheDocument();
    });
  });

  it('switches to calendar view', async () => {
    render(<App />);
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Current Moon Illumination')).toBeInTheDocument();
    });
    
    // Switch to calendar view
    const calendarButton = screen.getByRole('button', { name: /calendar view/i });
    fireEvent.click(calendarButton);
    
    // Check that calendar navigation is shown
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /month view/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /week view/i })).toBeInTheDocument();
    });
  });

  it('handles location changes across views', async () => {
    render(<App />);
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByDisplayValue('40.7128')).toBeInTheDocument();
    });
    
    // Change location
    const latInput = screen.getByLabelText(/latitude/i);
    const lonInput = screen.getByLabelText(/longitude/i);
    
    fireEvent.change(latInput, { target: { value: '51.5074' } });
    fireEvent.change(lonInput, { target: { value: '-0.1278' } });
    
    const calculateButton = screen.getByRole('button', { name: /calculate/i });
    fireEvent.click(calculateButton);
    
    // Switch to religious view and verify location is used
    const religiousButton = screen.getByRole('button', { name: /religious schedule view/i });
    fireEvent.click(religiousButton);
    
    await waitFor(() => {
      expect(screen.getByText('Religious Schedule')).toBeInTheDocument();
    });
  });

  it('shows demo when demo button is clicked', () => {
    render(<App />);
    
    const demoButton = screen.getByRole('button', { name: /demo/i });
    fireEvent.click(demoButton);
    
    // Check that demo is shown
    expect(screen.getByRole('button', { name: /back to main app/i })).toBeInTheDocument();
  });

  it('handles geolocation failure gracefully', async () => {
    // Mock geolocation failure
    mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
      error({ message: 'Location access denied' });
    });
    
    render(<App />);
    
    // Should fall back to default location (London)
    await waitFor(() => {
      expect(screen.getByDisplayValue('51.5072')).toBeInTheDocument();
      expect(screen.getByDisplayValue('-0.1276')).toBeInTheDocument();
    });
  });

  it('maintains responsive layout across different views', async () => {
    render(<App />);
    
    // Check that the main container has responsive classes
    const mainContainer = screen.getByText('Celestial Events Calculator').closest('.max-w-7xl');
    expect(mainContainer).toHaveClass('max-w-7xl', 'mx-auto');
    
    // Check navigation has responsive flex classes
    const navigation = screen.getByRole('button', { name: /astronomical view/i }).parentElement;
    expect(navigation).toHaveClass('flex', 'flex-wrap', 'justify-center');
  });

  it('integrates religious events with EventList component', async () => {
    render(<App />);
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Current Moon Illumination')).toBeInTheDocument();
    });
    
    // The EventList should be rendered with both lunar and religious events
    const eventList = screen.getByText('Upcoming Lunar Holy Days').nextElementSibling;
    expect(eventList).toBeInTheDocument();
  });

  it('handles religious event modal interactions', async () => {
    render(<App />);
    
    // Switch to religious view to load religious events
    const religiousButton = screen.getByRole('button', { name: /religious schedule view/i });
    fireEvent.click(religiousButton);
    
    await waitFor(() => {
      expect(screen.getByText('Religious Schedule')).toBeInTheDocument();
    });
    
    // Switch back to astronomical view
    const astronomicalButton = screen.getByRole('button', { name: /astronomical view/i });
    fireEvent.click(astronomicalButton);
    
    // Should show astronomical content with integrated religious events
    await waitFor(() => {
      expect(screen.getByText('Current Moon Illumination')).toBeInTheDocument();
    });
  });

  it('updates location across all components', async () => {
    render(<App />);
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByDisplayValue('40.7128')).toBeInTheDocument();
    });
    
    // Change location
    const latInput = screen.getByLabelText(/latitude/i);
    const lonInput = screen.getByLabelText(/longitude/i);
    
    fireEvent.change(latInput, { target: { value: '35.6762' } });
    fireEvent.change(lonInput, { target: { value: '139.6503' } });
    
    const calculateButton = screen.getByRole('button', { name: /calculate/i });
    fireEvent.click(calculateButton);
    
    // Verify location is updated in all views
    const religiousButton = screen.getByRole('button', { name: /religious schedule view/i });
    fireEvent.click(religiousButton);
    
    await waitFor(() => {
      expect(screen.getByText('Religious Schedule')).toBeInTheDocument();
    });
    
    // Switch to calendar view
    const calendarButton = screen.getByRole('button', { name: /calendar view/i });
    fireEvent.click(calendarButton);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /month view/i })).toBeInTheDocument();
    });
  });
});