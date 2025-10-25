import React, { useState, useEffect } from 'react';
import { Location } from '../types';
import QiblaCompass from './QiblaCompass';
import { IslamicCalendarService } from '../services/religious/IslamicCalendarService';
import { useResponsive } from '../utils/responsive';

interface QiblaViewProps {
  location: Location;
}

/**
 * QiblaView component provides a dedicated full-screen view for Qibla direction
 * Displays a large compass, location information, and distance to Mecca
 */
const QiblaView: React.FC<QiblaViewProps> = ({ location }) => {
  const { isMobile, isTablet, getTextSize } = useResponsive();
  const [qiblaDirection, setQiblaDirection] = useState<number>(0);
  const [deviceHeading, setDeviceHeading] = useState<number | null>(null);
  const [distanceToMecca, setDistanceToMecca] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [compassSupported, setCompassSupported] = useState<boolean>(false);
  const [compassPermission, setCompassPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');

  useEffect(() => {
    calculateQiblaData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.latitude, location.longitude]);

  // Device orientation support
  useEffect(() => {
    // Check if device orientation is supported
    if ('DeviceOrientationEvent' in window) {
      setCompassSupported(true);

      // Request permission for iOS 13+
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        // iOS requires explicit permission
        setCompassPermission('prompt');
      } else {
        // Android and older iOS - permission not required
        setCompassPermission('granted');
        startCompass();
      }
    } else {
      console.log('DeviceOrientationEvent not supported');
      setCompassSupported(false);
    }

    return () => {
      stopCompass();
    };
  }, [deviceHeading]);

  const requestCompassPermission = async () => {
    try {
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        setCompassPermission(permission);
        if (permission === 'granted') {
          startCompass();
        }
      }
    } catch (error) {
      console.error('Error requesting compass permission:', error);
      setCompassPermission('denied');
    }
  };

  const startCompass = () => {
    console.log('Starting compass...');
    window.addEventListener('deviceorientationabsolute', handleOrientation as any, true);
    window.addEventListener('deviceorientation', handleOrientation as any, true);
  };

  const stopCompass = () => {
    window.removeEventListener('deviceorientationabsolute', handleOrientation as any, true);
    window.removeEventListener('deviceorientation', handleOrientation as any, true);
  };

  // Check if compass is actually working
  useEffect(() => {
    if (compassSupported && compassPermission === 'granted') {
      const timeoutId = setTimeout(() => {
        if (deviceHeading === null) {
          console.warn('Compass not responding - device may not have magnetometer or permission denied');
          setCompassPermission('denied');
        }
      }, 3000);

      return () => clearTimeout(timeoutId);
    }
  }, [compassSupported, compassPermission]);

  const handleOrientation = (event: DeviceOrientationEvent) => {
    // Get the compass heading
    let heading = event.alpha; // Z-axis rotation (compass direction)

    // Use webkitCompassHeading for iOS if available
    if ((event as any).webkitCompassHeading !== undefined && (event as any).webkitCompassHeading !== null) {
      heading = (event as any).webkitCompassHeading;
    } else if (event.alpha !== null && event.alpha !== undefined) {
      // For Android, alpha gives us the heading
      // We need to adjust it: 0 = North, 90 = East, 180 = South, 270 = West
      heading = 360 - event.alpha;
    }

    // Only update if we have a valid heading
    if (heading !== null && heading !== undefined && !isNaN(heading)) {
      setDeviceHeading(heading);
      console.log('Device heading updated:', heading);
    }
  };

  const calculateQiblaData = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('QiblaView: Calculating Qibla for location:', location);
      
      const islamicService = new IslamicCalendarService();
      const direction = await islamicService.getQiblaDirection(location);
      console.log('QiblaView: Qibla direction calculated:', direction);
      setQiblaDirection(direction);

      // Calculate distance to Mecca (21.4225° N, 39.8262° E)
      const meccaLat = 21.4225;
      const meccaLon = 39.8262;
      const distance = calculateDistance(
        location.latitude,
        location.longitude,
        meccaLat,
        meccaLon
      );
      console.log('QiblaView: Distance to Mecca:', distance, 'km');
      setDistanceToMecca(distance);

      setLoading(false);
    } catch (err) {
      console.error('Error calculating Qibla direction:', err);
      setError(err instanceof Error ? err.message : 'Failed to calculate Qibla direction');
      setLoading(false);
    }
  };

  /**
   * Calculate distance between two coordinates using Haversine formula
   * Returns distance in kilometers
   */
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const toRadians = (degrees: number): number => {
    return degrees * (Math.PI / 180);
  };

  const formatDistance = (km: number): string => {
    if (km < 1) {
      return `${Math.round(km * 1000)} m`;
    } else if (km < 100) {
      return `${km.toFixed(1)} km`;
    } else {
      return `${Math.round(km).toLocaleString()} km`;
    }
  };

  const formatCoordinates = (lat: number, lon: number): string => {
    const latDir = lat >= 0 ? 'N' : 'S';
    const lonDir = lon >= 0 ? 'E' : 'W';
    return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lon).toFixed(4)}° ${lonDir}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-400 mx-auto mb-4"></div>
          <p className="text-slate-300 text-lg">Calculating Qibla direction...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-6">
        <div className="bg-card-bg/70 rounded-lg p-8 border border-red-500/50 max-w-md">
          <div className="text-red-400 text-center">
            <svg
              className="w-16 h-16 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <p className="font-semibold text-xl mb-2">Error Calculating Qibla</p>
            <p className="text-sm mb-4">{error}</p>
            <div className="text-left text-slate-300 text-xs bg-slate-800/50 p-3 rounded">
              <p className="font-semibold mb-2">Troubleshooting:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Check your location permissions</li>
                <li>Ensure GPS is enabled</li>
                <li>Try refreshing the page</li>
                <li>Update your location manually</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const compassSize = isMobile ? 280 : isTablet ? 350 : 400;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            {/* Kaaba Icon */}
            <svg
              className="w-12 h-12 mr-3 text-green-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              {/* Kaaba cube */}
              <rect x="6" y="8" width="12" height="12" rx="1" fill="currentColor" opacity="0.2" />
              <rect x="6" y="8" width="12" height="12" rx="1" />
              {/* Door */}
              <rect x="10" y="13" width="4" height="6" fill="currentColor" opacity="0.4" />
              {/* Top detail */}
              <line x1="6" y1="8" x2="12" y2="4" />
              <line x1="18" y1="8" x2="12" y2="4" />
              <line x1="12" y1="4" x2="12" y2="8" />
            </svg>
            <h1 className={`${getTextSize('text-4xl')} font-bold text-green-400`}>
              Qibla Direction
            </h1>
          </div>
          <p className={`${getTextSize('text-lg')} text-slate-300`}>
            Direction to Mecca for Islamic Prayer
          </p>
        </div>

        {/* Location Info Banner */}
        <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-slate-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className={`${getTextSize('text-sm')} text-slate-300`}>
                To change your location, use the <span className="font-semibold">Location Input</span> at the top of the page, or click the "Change Location" button below.
              </p>
            </div>
          </div>
        </div>

        {/* Compass Permission Button (iOS) */}
        {compassSupported && compassPermission === 'prompt' && (
          <div className="bg-blue-500/20 border border-blue-400/50 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-blue-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className={`${getTextSize('text-sm')} text-blue-300 mb-2`}>
                  Enable device compass for real-time orientation
                </p>
                <button
                  onClick={requestCompassPermission}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Enable Compass
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Compass Status - Active */}
        {compassSupported && compassPermission === 'granted' && deviceHeading !== null && (
          <div className="bg-green-500/20 border border-green-400/50 rounded-lg p-3 mb-6 text-center">
            <p className={`${getTextSize('text-sm')} text-green-300`}>
              ✓ Live compass active - Rotate your device to find Qibla
            </p>
          </div>
        )}

        {/* Compass Status - Not Available */}
        {compassSupported && compassPermission === 'denied' && (
          <div className="bg-amber-500/20 border border-amber-400/50 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-amber-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0 4v2M6.343 3.665c.886-.887 2.318-.887 3.203 0l9.759 9.759c.886.886.886 2.318 0 3.203l-9.759 9.759c-.886.886-2.317.886-3.203 0L3.14 16.168c-.886-.886-.886-2.317 0-3.203L6.343 3.665z" />
              </svg>
              <div className="flex-1">
                <p className={`${getTextSize('text-sm')} text-amber-300 font-semibold mb-1`}>
                  Compass Not Available
                </p>
                <p className={`${getTextSize('text-xs')} text-amber-200`}>
                  Your device doesn't have a magnetometer or compass access is not available. The compass will show the calculated direction, but won't rotate with your device.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Compass Display */}
        <div className="bg-card-bg/70 rounded-2xl p-8 border border-green-400/30 shadow-2xl mb-6">
          <div className="flex justify-center mb-6">
            <QiblaCompass
              direction={deviceHeading !== null ? qiblaDirection - deviceHeading : qiblaDirection}
              size={compassSize}
              showDegrees={true}
              showLabel={true}
            />
          </div>

          {/* Direction Info */}
          <div className="text-center">
            <p className={`${getTextSize('text-2xl')} text-slate-300 mb-2`}>
              Point towards <span className="text-green-400 font-bold">Mecca</span>
            </p>
            <p className={`${getTextSize('text-lg')} text-slate-400`}>
              {deviceHeading !== null 
                ? 'Rotate your device until the arrow points up'
                : 'Align yourself with the green arrow for prayer'
              }
            </p>
            {deviceHeading !== null && (
              <p className={`${getTextSize('text-sm')} text-slate-500 mt-2`}>
                Device heading: {Math.round(deviceHeading)}° | Qibla: {Math.round(qiblaDirection)}°
              </p>
            )}
          </div>
        </div>

        {/* Location and Distance Info */}
        <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
          {/* Current Location */}
          <div className="bg-card-bg/70 rounded-lg p-6 border border-slate-600">
            <div className="flex items-start">
              <svg
                className="w-6 h-6 text-green-400 mr-3 mt-1 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <div className="flex-1">
                <h3 className={`${getTextSize('text-lg')} font-semibold text-moonlight mb-2`}>
                  Your Location
                </h3>
                {location.name ? (
                  <p className={`${getTextSize('text-base')} text-slate-300 mb-1`}>
                    {location.name}
                  </p>
                ) : (
                  <p className={`${getTextSize('text-sm')} text-slate-400 mb-1 italic`}>
                    Location detected
                  </p>
                )}
                <p className={`${getTextSize('text-sm')} text-slate-400 font-mono`}>
                  {formatCoordinates(location.latitude, location.longitude)}
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={calculateQiblaData}
                    className="text-xs text-green-400 hover:text-green-300 flex items-center"
                    aria-label="Recalculate Qibla direction"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Recalculate
                  </button>
                  <button
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center"
                    aria-label="Change location"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Change Location
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Distance to Mecca */}
          <div className="bg-card-bg/70 rounded-lg p-6 border border-slate-600">
            <div className="flex items-start">
              <svg
                className="w-6 h-6 text-green-400 mr-3 mt-1 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
              <div>
                <h3 className={`${getTextSize('text-lg')} font-semibold text-moonlight mb-2`}>
                  Distance to Mecca
                </h3>
                <p className={`${getTextSize('text-3xl')} font-bold text-green-400 mb-1`}>
                  {formatDistance(distanceToMecca)}
                </p>
                <p className={`${getTextSize('text-sm')} text-slate-400`}>
                  As the crow flies
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 bg-card-bg/50 rounded-lg p-6 border border-slate-700">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-blue-400 mr-3 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className={`${getTextSize('text-sm')} text-slate-300 mb-2`}>
                <span className="font-semibold">How to use:</span> Face the direction indicated by the green arrow.
                The compass shows the bearing from your current location to the Kaaba in Mecca.
              </p>
              <p className={`${getTextSize('text-xs')} text-slate-400`}>
                Note: For best accuracy, ensure your device location is enabled and up to date.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QiblaView;
