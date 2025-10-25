import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import LocationSelector from '../LocationSelector';
import { locationManager } from '../../services/LocationManager';
import { SavedLocation } from '../../types';

// Mock the LocationManager
vi.mock('../../services/LocationManager', () => {
  const mockLocationManager = {
    getSavedLocations: vi.fn(() => []),
    getCurrentLocation: vi.fn(() => null),
    subscribe: vi.fn(() => vi.fn()),
    subscribeToCurrentLocation: vi.fn(() => vi.fn()),
    setCurrentLocation: vi.fn(() => true),
    removeLocation: vi.fn(() => true),
    validateCoordinates: vi.fn(() => ({ valid: true, errors: [] })),
    saveLocation: vi.fn(),
    getCurrentPosition: vi.fn(),
    getTimezoneInfo: vi.fn(() => ({
      timezone: 'America/New_York',
      offset: -300,
      isDST: false,
      abbreviation: 'EST',
      utcOffset: '-05:00'
    })),
    isPolarRegion: vi.fn(() => false)
  };

  return {
    locationManager: mockLocationManager,
    LocationManager: {
      getInstance: () => mockLocationManager
    }
  };
});

// Mock LocationIcon
vi.mock('../icons/LocationIcon', () => ({
  LocationIcon: ({ className }: { className?: string }) => (
    <div data-testid="location-icon" className={className}>📍</div>
  )
}));

describe('LocationSelector', () => {
  const mockOnLocationChange = vi.fn();
  
  const mockSavedLocations: SavedLocation[] = [
    {
      id: 'loc-1',
      name: 'New York',
      latitude: 40.7128,
      longitude: -74.0060,
      timezone: 'America/New_York',
      isDefault: true
    },
    {
      id: 'loc-2',
      name: 'London',
      latitude: 51.5074,
      longitude: -0.1278,
      timezone: 'Europe/London',
      isDefault: false
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (locationManager.getSavedLocations as any).mockReturnValue([]);
    (locationManager.getCurrentLocation as any).mockReturnValue(null);
    (locationManager.subscribe as any).mockReturnValue(vi.fn());
    (locationManager.subscribeToCurrentLocation as any).mockReturnValue(vi.fn());
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<LocationSelector onLocationChange={mockOnLocationChange} />);
    expect(screen.getByText('Location')).toBeInTheDocument();
  });

  it('displays current location when available', () => {
    (locationManager.getCurrentLocation as any).mockReturnValue(mockSavedLocations[0]);
    
    render(<LocationSelector onLocationChange={mockOnLocationChange} />);
    
    expect(screen.getByText('New York')).toBeInTheDocument();
    expect(screen.getByText('40.7128°N, 74.0060°W')).toBeInTheDocument();
  });

  it('displays saved locations list', () => {
    (locationManager.getSavedLocations as any).mockReturnValue(mockSavedLocations);
    
    render(<LocationSelector onLocationChange={mockOnLocationChange} />);
    
    expect(screen.getByText('Saved Locations')).toBeInTheDocument();
    expect(screen.getByText('New York')).toBeInTheDocument();
    expect(screen.getByText('London')).toBeInTheDocument();
  });

  it('handles location selection', async () => {
    (locationManager.getSavedLocations as any).mockReturnValue(mockSavedLocations);
    
    render(<LocationSelector onLocationChange={mockOnLocationChange} />);
    
    const londonLocation = screen.getByText('London').closest('div');
    fireEvent.click(londonLocation!);
    
    expect(locationManager.setCurrentLocation).toHaveBeenCalledWith('loc-2');
  });

  it('shows add location form when button is clicked', () => {
    render(<LocationSelector onLocationChange={mockOnLocationChange} />);
    
    const addButton = screen.getByText('Add Location');
    fireEvent.click(addButton);
    
    expect(screen.getByText('Location Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g., Home, Office, New York')).toBeInTheDocument();
  });

  it('validates form input and shows errors', async () => {
    (locationManager.validateCoordinates as any).mockReturnValue({
      valid: false,
      errors: ['Latitude must be between -90 and 90 degrees']
    });
    
    render(<LocationSelector onLocationChange={mockOnLocationChange} />);
    
    // Open form
    fireEvent.click(screen.getByText('Add Location'));
    
    // Fill form with invalid data
    fireEvent.change(screen.getByPlaceholderText('e.g., Home, Office, New York'), {
      target: { value: 'Test Location' }
    });
    fireEvent.change(screen.getByPlaceholderText('e.g., 40.7128'), {
      target: { value: '91' }
    });
    fireEvent.change(screen.getByPlaceholderText('e.g., -74.0060'), {
      target: { value: '-74' }
    });
    
    // Submit form
    fireEvent.click(screen.getByText('Save Location'));
    
    await waitFor(() => {
      expect(screen.getByText('Latitude must be between -90 and 90 degrees')).toBeInTheDocument();
    });
  });

  it('successfully saves a new location', async () => {
    const mockSavedLocation = {
      id: 'new-loc',
      name: 'Test Location',
      latitude: 40.7128,
      longitude: -74.0060,
      timezone: 'America/New_York',
      isDefault: false
    };
    
    (locationManager.saveLocation as any).mockResolvedValue(mockSavedLocation);
    
    render(<LocationSelector onLocationChange={mockOnLocationChange} />);
    
    // Open form
    fireEvent.click(screen.getByText('Add Location'));
    
    // Fill form
    fireEvent.change(screen.getByPlaceholderText('e.g., Home, Office, New York'), {
      target: { value: 'Test Location' }
    });
    fireEvent.change(screen.getByPlaceholderText('e.g., 40.7128'), {
      target: { value: '40.7128' }
    });
    fireEvent.change(screen.getByPlaceholderText('e.g., -74.0060'), {
      target: { value: '-74.0060' }
    });
    
    // Submit form
    fireEvent.click(screen.getByText('Save Location'));
    
    await waitFor(() => {
      expect(locationManager.saveLocation).toHaveBeenCalledWith({
        id: expect.stringContaining('manual-'),
        name: 'Test Location',
        latitude: 40.7128,
        longitude: -74.0060,
        elevation: undefined,
        isDefault: true // First location becomes default
      });
    });
  });

  it('handles GPS location request', async () => {
    const mockGPSResult = {
      location: {
        latitude: 40.7128,
        longitude: -74.0060,
        timezone: 'America/New_York',
        timezoneOffset: -300,
        isDST: false
      },
      accuracy: 10,
      timestamp: new Date()
    };
    
    (locationManager.getCurrentPosition as any).mockResolvedValue(mockGPSResult);
    (locationManager.saveLocation as any).mockResolvedValue({
      id: 'gps-loc',
      name: 'GPS Location (±10m)',
      latitude: 40.7128,
      longitude: -74.0060,
      timezone: 'America/New_York',
      isDefault: false
    });
    
    render(<LocationSelector onLocationChange={mockOnLocationChange} />);
    
    const gpsButton = screen.getByText('Use GPS Location');
    fireEvent.click(gpsButton);
    
    // Should show loading state
    expect(screen.getByText('Getting Location...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(locationManager.getCurrentPosition).toHaveBeenCalled();
      expect(locationManager.saveLocation).toHaveBeenCalledWith({
        id: expect.stringContaining('gps-'),
        name: 'GPS Location (±10m)',
        latitude: 40.7128,
        longitude: -74.0060,
        elevation: undefined,
        isDefault: false,
        timezone: 'America/New_York'
      });
    });
  });

  it('handles GPS errors gracefully', async () => {
    (locationManager.getCurrentPosition as any).mockRejectedValue(new Error('Location access denied'));
    
    render(<LocationSelector onLocationChange={mockOnLocationChange} />);
    
    const gpsButton = screen.getByText('Use GPS Location');
    fireEvent.click(gpsButton);
    
    await waitFor(() => {
      expect(screen.getByText('Location access denied')).toBeInTheDocument();
    });
  });

  it('handles location deletion', () => {
    (locationManager.getSavedLocations as any).mockReturnValue(mockSavedLocations);
    
    render(<LocationSelector onLocationChange={mockOnLocationChange} />);
    
    // Find delete button (×) for the first location
    const deleteButtons = screen.getAllByText('×');
    fireEvent.click(deleteButtons[0]);
    
    expect(locationManager.removeLocation).toHaveBeenCalledWith('loc-1');
  });

  it('prevents deletion of last location', () => {
    (locationManager.getSavedLocations as any).mockReturnValue([mockSavedLocations[0]]);
    
    render(<LocationSelector onLocationChange={mockOnLocationChange} />);
    
    // Should not show delete button for single location
    expect(screen.queryByText('×')).not.toBeInTheDocument();
  });

  it('shows polar region warning', () => {
    const polarLocation = {
      ...mockSavedLocations[0],
      latitude: 70, // Arctic region
      name: 'Arctic Station'
    };
    
    (locationManager.getCurrentLocation as any).mockReturnValue(polarLocation);
    (locationManager.isPolarRegion as any).mockReturnValue(true);
    
    render(<LocationSelector onLocationChange={mockOnLocationChange} />);
    
    expect(screen.getByText(/This location is in a polar region/)).toBeInTheDocument();
  });

  it('calls onLocationChange when current location changes', () => {
    const { rerender } = render(<LocationSelector onLocationChange={mockOnLocationChange} />);
    
    // Simulate location change
    (locationManager.getCurrentLocation as any).mockReturnValue(mockSavedLocations[0]);
    
    rerender(<LocationSelector onLocationChange={mockOnLocationChange} />);
    
    expect(mockOnLocationChange).toHaveBeenCalledWith({
      latitude: 40.7128,
      longitude: -74.0060
    });
  });

  it('formats coordinates correctly', () => {
    (locationManager.getCurrentLocation as any).mockReturnValue(mockSavedLocations[0]);
    
    render(<LocationSelector onLocationChange={mockOnLocationChange} />);
    
    expect(screen.getByText('40.7128°N, 74.0060°W')).toBeInTheDocument();
  });

  it('displays timezone information', () => {
    (locationManager.getCurrentLocation as any).mockReturnValue(mockSavedLocations[0]);
    
    render(<LocationSelector onLocationChange={mockOnLocationChange} />);
    
    expect(screen.getByText('EST (UTC-05:00)')).toBeInTheDocument();
  });
});