import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LocationInput from '../LocationInput';
import { locationManager } from '../../services/LocationManager';

// Mock the LocationManager
vi.mock('../../services/LocationManager', () => ({
  locationManager: {
    getSavedLocations: vi.fn(() => []),
    subscribe: vi.fn(() => () => {}),
    validateCoordinates: vi.fn(() => ({ valid: true, errors: [] }))
  }
}));

// Mock geolocation
const mockGeolocation = {
  getCurrentPosition: vi.fn()
};

Object.defineProperty(global.navigator, 'geolocation', {
  value: mockGeolocation,
  writable: true
});

describe('LocationInput Component Integration', () => {
  const mockOnLocationChange = vi.fn();
  const defaultProps = {
    initialLatitude: 40.7128,
    initialLongitude: -74.0060,
    onLocationChange: mockOnLocationChange
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGeolocation.getCurrentPosition.mockImplementation((success) => {
      success({
        coords: {
          latitude: 40.7128,
          longitude: -74.0060
        }
      });
    });
  });

  it('renders basic location input without saved locations', () => {
    render(<LocationInput {...defaultProps} showSavedLocations={false} />);

    expect(screen.getByLabelText(/latitude/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/longitude/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /use my location/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /calculate/i })).toBeInTheDocument();
    
    // Should not show saved locations dropdown
    expect(screen.queryByText(/saved location/i)).not.toBeInTheDocument();
  });

  it('shows saved locations dropdown when locations exist', () => {
    const mockSavedLocations = [
      {
        id: 'home',
        name: 'Home',
        latitude: 40.7128,
        longitude: -74.0060,
        isDefault: true
      },
      {
        id: 'office',
        name: 'Office',
        latitude: 40.7589,
        longitude: -73.9851,
        isDefault: false
      }
    ];

    (locationManager.getSavedLocations as any).mockReturnValue(mockSavedLocations);

    render(<LocationInput {...defaultProps} />);

    expect(screen.getByText('2 saved locations')).toBeInTheDocument();
  });

  it('handles saved location selection', async () => {
    const mockSavedLocations = [
      {
        id: 'home',
        name: 'Home',
        latitude: 51.5074,
        longitude: -0.1278,
        isDefault: true
      }
    ];

    (locationManager.getSavedLocations as any).mockReturnValue(mockSavedLocations);

    render(<LocationInput {...defaultProps} />);

    // Open dropdown
    const dropdownButton = screen.getByText('1 saved location');
    fireEvent.click(dropdownButton);

    // Select saved location
    const homeLocation = screen.getByText('Home');
    fireEvent.click(homeLocation);

    // Verify location change was called
    expect(mockOnLocationChange).toHaveBeenCalledWith({
      latitude: 51.5074,
      longitude: -0.1278
    });

    // Verify input values were updated
    await waitFor(() => {
      expect(screen.getByDisplayValue('51.5074')).toBeInTheDocument();
      expect(screen.getByDisplayValue('-0.1278')).toBeInTheDocument();
    });
  });

  it('handles manual location input and validation', () => {
    render(<LocationInput {...defaultProps} />);

    const latInput = screen.getByLabelText(/latitude/i);
    const lonInput = screen.getByLabelText(/longitude/i);
    const calculateButton = screen.getByRole('button', { name: /calculate/i });

    // Enter valid coordinates
    fireEvent.change(latInput, { target: { value: '35.6762' } });
    fireEvent.change(lonInput, { target: { value: '139.6503' } });
    fireEvent.click(calculateButton);

    expect(mockOnLocationChange).toHaveBeenCalledWith({
      latitude: 35.6762,
      longitude: 139.6503
    });
  });

  it('shows validation errors for invalid coordinates', () => {
    render(<LocationInput {...defaultProps} />);

    const latInput = screen.getByLabelText(/latitude/i);
    const lonInput = screen.getByLabelText(/longitude/i);
    const calculateButton = screen.getByRole('button', { name: /calculate/i });

    // Enter invalid coordinates
    fireEvent.change(latInput, { target: { value: '95' } }); // Invalid latitude
    fireEvent.change(lonInput, { target: { value: '200' } }); // Invalid longitude
    fireEvent.click(calculateButton);

    expect(screen.getByText(/latitude must be between -90 and 90/i)).toBeInTheDocument();
    expect(screen.getByText(/longitude must be between -180 and 180/i)).toBeInTheDocument();
    expect(mockOnLocationChange).not.toHaveBeenCalled();
  });

  it('handles GPS location request', async () => {
    render(<LocationInput {...defaultProps} />);

    const gpsButton = screen.getByRole('button', { name: /use my location/i });
    fireEvent.click(gpsButton);

    // Should show loading state
    expect(screen.getByRole('button', { name: /use my location/i })).toBeDisabled();

    await waitFor(() => {
      expect(mockOnLocationChange).toHaveBeenCalledWith({
        latitude: 40.7128,
        longitude: -74.0060
      });
    });
  });

  it('handles GPS location failure', async () => {
    mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
      error({ message: 'Location access denied' });
    });

    render(<LocationInput {...defaultProps} />);

    const gpsButton = screen.getByRole('button', { name: /use my location/i });
    fireEvent.click(gpsButton);

    await waitFor(() => {
      expect(screen.getByText(/unable to retrieve location/i)).toBeInTheDocument();
    });
  });

  it('handles geolocation not supported', () => {
    // Mock geolocation as undefined
    Object.defineProperty(global.navigator, 'geolocation', {
      value: undefined,
      writable: true
    });

    render(<LocationInput {...defaultProps} />);

    const gpsButton = screen.getByRole('button', { name: /use my location/i });
    fireEvent.click(gpsButton);

    expect(screen.getByText(/geolocation is not supported/i)).toBeInTheDocument();
  });

  it('toggles saved locations dropdown', () => {
    const mockSavedLocations = [
      {
        id: 'home',
        name: 'Home',
        latitude: 40.7128,
        longitude: -74.0060,
        isDefault: true
      }
    ];

    (locationManager.getSavedLocations as any).mockReturnValue(mockSavedLocations);

    render(<LocationInput {...defaultProps} />);

    const dropdownButton = screen.getByText('1 saved location');
    
    // Open dropdown
    fireEvent.click(dropdownButton);
    expect(screen.getByText('Home')).toBeInTheDocument();

    // Close dropdown
    fireEvent.click(dropdownButton);
    expect(screen.queryByText('Home')).not.toBeInTheDocument();
  });

  it('maintains responsive layout', () => {
    render(<LocationInput {...defaultProps} />);

    // Check main container has responsive classes
    const container = screen.getByLabelText(/latitude/i).closest('.max-w-4xl');
    expect(container).toHaveClass('max-w-4xl', 'mx-auto');

    // Check form has responsive flex classes
    const form = screen.getByLabelText(/latitude/i).closest('form');
    expect(form).toHaveClass('flex', 'flex-col', 'md:flex-row');
  });

  it('updates input values when props change', () => {
    const { rerender } = render(<LocationInput {...defaultProps} />);

    expect(screen.getByDisplayValue('40.7128')).toBeInTheDocument();
    expect(screen.getByDisplayValue('-74.0060')).toBeInTheDocument();

    // Update props
    rerender(
      <LocationInput 
        {...defaultProps}
        initialLatitude={51.5074}
        initialLongitude={-0.1278}
      />
    );

    expect(screen.getByDisplayValue('51.5074')).toBeInTheDocument();
    expect(screen.getByDisplayValue('-0.1278')).toBeInTheDocument();
  });
});