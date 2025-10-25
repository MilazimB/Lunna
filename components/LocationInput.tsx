
import React, { useState, useEffect } from 'react';
import { LocationIcon } from './icons/LocationIcon';
import { locationManager } from '../services/LocationManager';
import { SavedLocation } from '../types';

interface LocationInputProps {
  initialLatitude: number;
  initialLongitude: number;
  onLocationChange: (location: { latitude: number; longitude: number }) => void;
  showSavedLocations?: boolean;
  showCityName?: boolean;
}

const LocationInput: React.FC<LocationInputProps> = ({
  initialLatitude,
  initialLongitude,
  onLocationChange,
  showSavedLocations = true,
  showCityName = false
}) => {
  const [latValue, setLatValue] = useState<string>(initialLatitude.toString());
  const [lonValue, setLonValue] = useState<string>(initialLongitude.toString());
  const [cityName, setCityName] = useState<string>('');
  const [isLoadingCity, setIsLoadingCity] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  const [showLocationDropdown, setShowLocationDropdown] = useState<boolean>(false);
  const [showManualInput, setShowManualInput] = useState<boolean>(false);
  const [citySearch, setCitySearch] = useState<string>('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [showSearchResults, setShowSearchResults] = useState<boolean>(false);

  useEffect(() => {
    setLatValue(initialLatitude.toString());
    setLonValue(initialLongitude.toString());

    // Load city name if showCityName is enabled
    if (showCityName) {
      getCityName(initialLatitude, initialLongitude);
    }
  }, [initialLatitude, initialLongitude, showCityName]);

  // Reverse geocoding function to get city name from coordinates
  const getCityName = async (lat: number, lon: number) => {
    setIsLoadingCity(true);
    try {
      // Using OpenStreetMap Nominatim API for reverse geocoding (free, no API key required)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`
      );

      if (response.ok) {
        const data = await response.json();
        const address = data.address || {};

        // Try to get city name from various fields
        const city = address.city ||
          address.town ||
          address.village ||
          address.municipality ||
          address.county ||
          address.state ||
          'Unknown Location';

        const country = address.country || '';
        const displayName = country ? `${city}, ${country}` : city;

        setCityName(displayName);
      } else {
        setCityName('Location not found');
      }
    } catch (error) {
      console.error('Error getting city name:', error);
      setCityName('Unable to load location');
    } finally {
      setIsLoadingCity(false);
    }
  };

  useEffect(() => {
    if (showSavedLocations) {
      setSavedLocations(locationManager.getSavedLocations());

      // Subscribe to changes in saved locations
      const unsubscribe = locationManager.subscribe(setSavedLocations);
      return unsubscribe;
    }
  }, [showSavedLocations]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(latValue);
    const lon = parseFloat(lonValue);

    let errors: string[] = [];
    if (isNaN(lat) || lat < -90 || lat > 90) {
      errors.push('Latitude must be between -90 and 90.');
    }
    if (isNaN(lon) || lon < -180 || lon > 180) {
      errors.push('Longitude must be between -180 and 180.');
    }

    if (errors.length > 0) {
      setError(errors.join(' '));
      return;
    }

    setError('');
    onLocationChange({ latitude: lat, longitude: lon });
    
    // Get city name if showCityName is enabled
    if (showCityName) {
      getCityName(lat, lon);
      setShowManualInput(false); // Close manual input after successful update
    }
  };

  const handleGeolocation = () => {
    setIsLocating(true);
    setError('');
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = parseFloat(position.coords.latitude.toFixed(4));
        const lon = parseFloat(position.coords.longitude.toFixed(4));
        setLatValue(lat.toString());
        setLonValue(lon.toString());
        onLocationChange({ latitude: lat, longitude: lon });

        // Get city name if showCityName is enabled
        if (showCityName) {
          getCityName(lat, lon);
        }

        setIsLocating(false);
      },
      () => {
        setError('Unable to retrieve location. Grant permission or enter manually.');
        setIsLocating(false);
      }
    );
  };

  const handleSavedLocationSelect = (location: SavedLocation) => {
    setLatValue(location.latitude.toString());
    setLonValue(location.longitude.toString());
    onLocationChange({ latitude: location.latitude, longitude: location.longitude });
    setShowLocationDropdown(false);
    setError('');

    // Get city name if showCityName is enabled
    if (showCityName) {
      getCityName(location.latitude, location.longitude);
    }
  };

  const formatCoordinates = (lat: number, lon: number): string => {
    const latDir = lat >= 0 ? 'N' : 'S';
    const lonDir = lon >= 0 ? 'E' : 'W';
    return `${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lon).toFixed(4)}°${lonDir}`;
  };

  const searchCity = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Using OpenStreetMap Nominatim API for geocoding (free, no API key required)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`
      );

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
        setShowSearchResults(true);
      }
    } catch (error) {
      console.error('Error searching for city:', error);
      setError('Failed to search for location');
    } finally {
      setIsSearching(false);
    }
  };

  const handleCitySearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCitySearch(value);
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      searchCity(value);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  const handleSearchResultSelect = (result: any) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    
    setLatValue(lat.toString());
    setLonValue(lon.toString());
    onLocationChange({ latitude: lat, longitude: lon });
    
    // Get city name
    if (showCityName) {
      getCityName(lat, lon);
      setShowManualInput(false);
    }
    
    setCitySearch('');
    setSearchResults([]);
    setShowSearchResults(false);
    setError('');
  };

  return (
    <div className="max-w-4xl mx-auto bg-card-bg p-6 rounded-lg shadow-md mb-8">
      {/* Saved Locations Dropdown */}
      {showSavedLocations && savedLocations.length > 0 && (
        <div className="mb-4 relative">
          <button
            type="button"
            onClick={() => setShowLocationDropdown(!showLocationDropdown)}
            className="w-full bg-slate-700 border border-slate-500 text-moonlight rounded-md p-2 text-left flex items-center justify-between hover:bg-slate-600 transition"
          >
            <span className="text-sm">
              {savedLocations.length === 1
                ? '1 saved location'
                : `${savedLocations.length} saved locations`}
            </span>
            <svg
              className={`w-4 h-4 transition-transform ${showLocationDropdown ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showLocationDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-slate-700 border border-slate-500 rounded-md shadow-lg max-h-48 overflow-y-auto">
              {savedLocations.map((location) => (
                <button
                  key={location.id}
                  type="button"
                  onClick={() => handleSavedLocationSelect(location)}
                  className="w-full text-left p-3 hover:bg-slate-600 transition-colors border-b border-slate-600 last:border-b-0"
                >
                  <div className="text-moonlight font-medium">{location.name}</div>
                  <div className="text-slate-400 text-sm">
                    {formatCoordinates(location.latitude, location.longitude)}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {showCityName && !showManualInput ? (
        // City name display mode
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-grow w-full">
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Current Location
            </label>
            <div className="w-full bg-slate-700 border border-slate-500 text-moonlight rounded-md p-3 min-h-[42px] flex items-center">
              {isLoadingCity ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-moonlight"></div>
                  <span className="text-slate-400">Loading location...</span>
                </div>
              ) : (
                <div className="flex flex-col">
                  <span className="text-moonlight font-medium">{cityName || 'Unknown Location'}</span>
                  <span className="text-slate-400 text-sm">
                    {formatCoordinates(initialLatitude, initialLongitude)}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto pt-2 sm:pt-5">
            <button
              type="button"
              onClick={handleGeolocation}
              disabled={isLocating}
              className="flex-shrink-0 w-full sm:w-auto bg-slate-600 text-moonlight font-bold p-2.5 rounded-md hover:bg-slate-500 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center"
              aria-label="Use my location"
              title="Use my current location"
            >
              {isLocating ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-moonlight"></div>
              ) : (
                <LocationIcon className="w-5 h-5" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setShowManualInput(true)}
              className="flex-shrink-0 w-full sm:w-auto bg-blue-600 text-white font-bold p-2.5 rounded-md hover:bg-blue-500 transition-colors duration-300 flex items-center justify-center gap-2"
              aria-label="Enter location manually"
              title="Enter coordinates manually"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span className="hidden sm:inline">Edit</span>
            </button>
          </div>
        </div>
      ) : (
        // Coordinate input mode
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* City Search */}
          <div className="w-full relative">
            <label htmlFor="citySearch" className="block text-sm font-medium text-slate-300 mb-1">
              Search by City Name
            </label>
            <div className="relative">
              <input
                type="text"
                id="citySearch"
                value={citySearch}
                onChange={handleCitySearchChange}
                placeholder="e.g., New York, London, Tokyo..."
                className="w-full bg-slate-700 border border-slate-500 text-moonlight rounded-md p-2 pr-10 focus:ring-accent-blue focus:border-accent-blue transition"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-moonlight"></div>
                </div>
              )}
            </div>
            
            {/* Search Results Dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute z-20 w-full mt-1 bg-slate-700 border border-slate-500 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {searchResults.map((result, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSearchResultSelect(result)}
                    className="w-full text-left p-3 hover:bg-slate-600 transition-colors border-b border-slate-600 last:border-b-0"
                  >
                    <div className="text-moonlight font-medium">{result.display_name}</div>
                    <div className="text-slate-400 text-sm mt-1">
                      {formatCoordinates(parseFloat(result.lat), parseFloat(result.lon))}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 border-t border-slate-600"></div>
            <span className="text-slate-400 text-sm">or enter coordinates</span>
            <div className="flex-1 border-t border-slate-600"></div>
          </div>

          {/* Coordinate Inputs */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow w-full">
              <label htmlFor="latitude" className="block text-sm font-medium text-slate-300 mb-1">
                Latitude (°N)
              </label>
              <input
                type="number"
                id="latitude"
                name="latitude"
                value={latValue}
                onChange={(e) => setLatValue(e.target.value)}
                placeholder="e.g., 40.7128"
                className="w-full bg-slate-700 border border-slate-500 text-moonlight rounded-md p-2 focus:ring-accent-blue focus:border-accent-blue transition"
                step="any"
              />
            </div>
            <div className="flex-grow w-full">
              <label htmlFor="longitude" className="block text-sm font-medium text-slate-300 mb-1">
                Longitude (°E)
              </label>
              <input
                type="number"
                id="longitude"
                name="longitude"
                value={lonValue}
                onChange={(e) => setLonValue(e.target.value)}
                placeholder="e.g., -74.0060"
                className="w-full bg-slate-700 border border-slate-500 text-moonlight rounded-md p-2 focus:ring-accent-blue focus:border-accent-blue transition"
                step="any"
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto pt-2 md:pt-5">
            <button
              type="button"
              onClick={handleGeolocation}
              disabled={isLocating}
              className="flex-shrink-0 w-full sm:w-auto bg-slate-600 text-moonlight font-bold p-2.5 rounded-md hover:bg-slate-500 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center"
              aria-label="Use my location"
              title="Use my current location"
            >
              {isLocating ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-moonlight"></div>
              ) : (
                <LocationIcon className="w-5 h-5" />
              )}
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto bg-accent-blue text-night-sky font-bold py-2 px-6 rounded-md hover:bg-sky-400 transition-colors duration-300"
            >
              Update
            </button>
            {showCityName && showManualInput && (
              <button
                type="button"
                onClick={() => setShowManualInput(false)}
                className="w-full sm:w-auto bg-slate-600 text-moonlight font-bold py-2 px-4 rounded-md hover:bg-slate-500 transition-colors duration-300"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}
      {error && <p className="text-red-400 text-sm mt-2 text-center">{error}</p>}
    </div>
  );
};

export default LocationInput;