import React, { useState, useEffect } from 'react';
import { LocationIcon } from './icons/LocationIcon';
import { locationManager, LocationWithTimezone, GeolocationResult } from '../services/LocationManager';
import { SavedLocation } from '../types';

interface LocationSelectorProps {
  onLocationChange: (location: { latitude: number; longitude: number }) => void;
  className?: string;
}

interface LocationFormData {
  name: string;
  latitude: string;
  longitude: string;
  elevation?: string;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({ onLocationChange, className = '' }) => {
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  const [currentLocation, setCurrentLocation] = useState<SavedLocation | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState<string>('');
  const [formData, setFormData] = useState<LocationFormData>({
    name: '',
    latitude: '',
    longitude: '',
    elevation: ''
  });

  useEffect(() => {
    // Load initial data
    setSavedLocations(locationManager.getSavedLocations());
    setCurrentLocation(locationManager.getCurrentLocation());

    // Subscribe to changes
    const unsubscribeLocations = locationManager.subscribe(setSavedLocations);
    const unsubscribeCurrentLocation = locationManager.subscribeToCurrentLocation(setCurrentLocation);

    return () => {
      unsubscribeLocations();
      unsubscribeCurrentLocation();
    };
  }, []);

  useEffect(() => {
    // Notify parent when current location changes
    if (currentLocation) {
      onLocationChange({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude
      });
    }
  }, [currentLocation, onLocationChange]);

  const handleLocationSelect = (locationId: string) => {
    const success = locationManager.setCurrentLocation(locationId);
    if (!success) {
      setError('Failed to set location');
    } else {
      setError('');
    }
  };

  const handleGPSLocation = async () => {
    setIsLocating(true);
    setError('');

    try {
      const result: GeolocationResult = await locationManager.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000 // 5 minutes
      });

      const { location, accuracy } = result;
      
      // Create a temporary location name based on coordinates
      const locationName = `GPS Location (±${Math.round(accuracy)}m)`;
      
      // Save as a new location
      const savedLocation = await locationManager.saveLocation({
        id: `gps-${Date.now()}`,
        name: locationName,
        latitude: location.latitude,
        longitude: location.longitude,
        elevation: location.elevation,
        isDefault: false,
        timezone: location.timezone
      });

      // Set as current location
      locationManager.setCurrentLocation(savedLocation.id);
      
      setIsLocating(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get GPS location');
      setIsLocating(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const lat = parseFloat(formData.latitude);
    const lon = parseFloat(formData.longitude);
    const elevation = formData.elevation ? parseFloat(formData.elevation) : undefined;

    // Validate coordinates
    const validation = locationManager.validateCoordinates(lat, lon);
    if (!validation.valid) {
      setError(validation.errors.join(' '));
      return;
    }

    if (!formData.name.trim()) {
      setError('Location name is required');
      return;
    }

    try {
      const savedLocation = await locationManager.saveLocation({
        id: `manual-${Date.now()}`,
        name: formData.name.trim(),
        latitude: lat,
        longitude: lon,
        elevation,
        isDefault: savedLocations.length === 0 // First location becomes default
      });

      // Set as current location
      locationManager.setCurrentLocation(savedLocation.id);

      // Reset form
      setFormData({ name: '', latitude: '', longitude: '', elevation: '' });
      setShowAddForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save location');
    }
  };

  const handleDeleteLocation = (locationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (savedLocations.length <= 1) {
      setError('Cannot delete the last location');
      return;
    }

    const success = locationManager.removeLocation(locationId);
    if (!success) {
      setError('Failed to delete location');
    }
  };

  const formatCoordinates = (lat: number, lon: number): string => {
    const latDir = lat >= 0 ? 'N' : 'S';
    const lonDir = lon >= 0 ? 'E' : 'W';
    return `${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lon).toFixed(4)}°${lonDir}`;
  };

  const getTimezoneDisplay = (location: SavedLocation): string => {
    if (!location.timezone) return '';
    
    try {
      const timezoneInfo = locationManager.getTimezoneInfo(location.timezone);
      return `${timezoneInfo.abbreviation} (UTC${timezoneInfo.utcOffset})`;
    } catch {
      return location.timezone;
    }
  };

  return (
    <div className={`max-w-4xl mx-auto bg-card-bg p-6 rounded-lg shadow-md mb-8 ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-moonlight mb-2">Location</h3>
        
        {/* Current Location Display */}
        {currentLocation && (
          <div className="bg-slate-700 p-3 rounded-md mb-4 border-l-4 border-accent-blue">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-moonlight font-medium">{currentLocation.name}</p>
                <p className="text-slate-300 text-sm">
                  {formatCoordinates(currentLocation.latitude, currentLocation.longitude)}
                </p>
                {currentLocation.timezone && (
                  <p className="text-slate-400 text-xs">
                    {getTimezoneDisplay(currentLocation)}
                  </p>
                )}
              </div>
              <LocationIcon className="w-5 h-5 text-accent-blue" />
            </div>
          </div>
        )}

        {/* Saved Locations */}
        {savedLocations.length > 0 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Saved Locations
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {savedLocations.map((location) => (
                <div
                  key={location.id}
                  className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${
                    currentLocation?.id === location.id
                      ? 'bg-accent-blue bg-opacity-20 border border-accent-blue'
                      : 'bg-slate-600 hover:bg-slate-500'
                  }`}
                  onClick={() => handleLocationSelect(location.id)}
                >
                  <div className="flex-grow">
                    <p className="text-moonlight text-sm font-medium">{location.name}</p>
                    <p className="text-slate-300 text-xs">
                      {formatCoordinates(location.latitude, location.longitude)}
                    </p>
                    {location.timezone && (
                      <p className="text-slate-400 text-xs">
                        {getTimezoneDisplay(location)}
                      </p>
                    )}
                  </div>
                  {savedLocations.length > 1 && (
                    <button
                      onClick={(e) => handleDeleteLocation(location.id, e)}
                      className="ml-2 text-red-400 hover:text-red-300 text-xs px-2 py-1 rounded"
                      title="Delete location"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <button
            type="button"
            onClick={handleGPSLocation}
            disabled={isLocating}
            className="flex-1 bg-slate-600 text-moonlight font-medium p-2.5 rounded-md hover:bg-slate-500 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLocating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-moonlight"></div>
                Getting Location...
              </>
            ) : (
              <>
                <LocationIcon className="w-4 h-4" />
                Use GPS Location
              </>
            )}
          </button>
          
          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex-1 bg-accent-blue text-night-sky font-medium py-2 px-4 rounded-md hover:bg-sky-400 transition-colors duration-300"
          >
            {showAddForm ? 'Cancel' : 'Add Location'}
          </button>
        </div>

        {/* Add Location Form */}
        {showAddForm && (
          <form onSubmit={handleFormSubmit} className="bg-slate-700 p-4 rounded-md space-y-3">
            <div>
              <label htmlFor="location-name" className="block text-sm font-medium text-slate-300 mb-1">
                Location Name
              </label>
              <input
                type="text"
                id="location-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Home, Office, New York"
                className="w-full bg-slate-600 border border-slate-500 text-moonlight rounded-md p-2 focus:ring-accent-blue focus:border-accent-blue transition"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label htmlFor="form-latitude" className="block text-sm font-medium text-slate-300 mb-1">
                  Latitude (°N)
                </label>
                <input
                  type="number"
                  id="form-latitude"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  placeholder="e.g., 40.7128"
                  className="w-full bg-slate-600 border border-slate-500 text-moonlight rounded-md p-2 focus:ring-accent-blue focus:border-accent-blue transition"
                  step="any"
                  min="-90"
                  max="90"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="form-longitude" className="block text-sm font-medium text-slate-300 mb-1">
                  Longitude (°E)
                </label>
                <input
                  type="number"
                  id="form-longitude"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  placeholder="e.g., -74.0060"
                  className="w-full bg-slate-600 border border-slate-500 text-moonlight rounded-md p-2 focus:ring-accent-blue focus:border-accent-blue transition"
                  step="any"
                  min="-180"
                  max="180"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="form-elevation" className="block text-sm font-medium text-slate-300 mb-1">
                Elevation (meters) - Optional
              </label>
              <input
                type="number"
                id="form-elevation"
                value={formData.elevation}
                onChange={(e) => setFormData({ ...formData, elevation: e.target.value })}
                placeholder="e.g., 100"
                className="w-full bg-slate-600 border border-slate-500 text-moonlight rounded-md p-2 focus:ring-accent-blue focus:border-accent-blue transition"
                step="1"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 bg-accent-blue text-night-sky font-medium py-2 px-4 rounded-md hover:bg-sky-400 transition-colors duration-300"
              >
                Save Location
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setFormData({ name: '', latitude: '', longitude: '', elevation: '' });
                }}
                className="flex-1 bg-slate-500 text-moonlight font-medium py-2 px-4 rounded-md hover:bg-slate-400 transition-colors duration-300"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-3 p-3 bg-red-900 bg-opacity-50 border border-red-500 rounded-md">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Polar Region Warning */}
        {currentLocation && locationManager.isPolarRegion(currentLocation.latitude) && (
          <div className="mt-3 p-3 bg-yellow-900 bg-opacity-50 border border-yellow-500 rounded-md">
            <p className="text-yellow-300 text-sm">
              ⚠️ This location is in a polar region. Some astronomical calculations may be less accurate or unavailable during certain times of the year.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationSelector;