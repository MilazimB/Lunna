
import React, { useState, useEffect, useCallback } from 'react';
import { getUpcomingLunarEvents, getCurrentLunarIllumination } from './services/lunarEphemeris';
import { getSolarTimes } from './services/solarEphemeris';

import { LunarEvent, LunarIllumination, SolarTimesData, ReligiousTradition, Location, ReligiousEvent } from './types';
import EventList from './components/EventList';
import LocationInput from './components/LocationInput';
import Loader from './components/Loader';
import Modal from './components/Modal';
import CurrentIllumination from './components/CurrentIllumination';
import SolarTimes from './components/SolarTimes';
import ReligiousSchedulePanel from './components/religious/ReligiousSchedulePanel';
import ReligiousCalendarView from './components/religious/ReligiousCalendarView';
import QiblaView from './components/QiblaView';

import ResponsiveLayout from './components/ResponsiveLayout';
import ResponsiveNavigation from './components/ResponsiveNavigation';
import SwipeableViewSwitcher from './components/SwipeableViewSwitcher';
import { useResponsive } from './utils/responsive';

type ViewMode = 'astronomical' | 'religious' | 'calendar' | 'qibla';

const App: React.FC = () => {
  const { isMobile, isTablet, getTextSize } = useResponsive();

  const [currentView, setCurrentView] = useState<ViewMode>('astronomical');
  const [location, setLocation] = useState<Location | null>(null);
  const [events, setEvents] = useState<LunarEvent[]>([]);
  const [solarTimes, setSolarTimes] = useState<SolarTimesData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [illumination, setIllumination] = useState<LunarIllumination | null>(null);

  // Religious view state
  const [selectedTraditions, setSelectedTraditions] = useState<ReligiousTradition[]>(['islam', 'judaism', 'christianity']);
  const [calendarViewMode, setCalendarViewMode] = useState<'month' | 'week'>('month');



  // State for Religious Event Modal
  const [isReligiousModalOpen, setIsReligiousModalOpen] = useState<boolean>(false);
  const [selectedReligiousEvent, setSelectedReligiousEvent] = useState<ReligiousEvent | null>(null);
  const [religiousEvents] = useState<ReligiousEvent[]>([]);

  // Fetch user's location on initial load
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: parseFloat(position.coords.latitude.toFixed(4)),
          longitude: parseFloat(position.coords.longitude.toFixed(4)),
        });
      },
      (error) => {
        console.warn('Geolocation failed:', error.message, 'Using default location.');
        // Fallback to a default location (London) if user denies or there's an error
        setLocation({ latitude: 51.5072, longitude: -0.1276 });
      }
    );
  }, []); // Empty dependency array ensures this runs only once on mount


  const calculateData = useCallback((lat: number, lon: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const upcomingEvents = getUpcomingLunarEvents({ longitude: lon });
      const currentSolarTimes = getSolarTimes(new Date(), lat, lon);
      setEvents(upcomingEvents);
      setSolarTimes(currentSolarTimes);
      setIllumination(getCurrentLunarIllumination());
    } catch (e) {
      console.error(e);
      setError('Failed to calculate celestial events. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (location) {
        calculateData(location.latitude, location.longitude);
    }
  }, [calculateData, location]);

  const handleLocationChange = (newLocation: { latitude: number; longitude: number; }) => {
    setLocation(newLocation);
  };

  const handleViewChange = (view: ViewMode) => {
    setCurrentView(view);
  };

  const handleTraditionChange = (traditions: ReligiousTradition[]) => {
    setSelectedTraditions(traditions);
  };
  


  const handleReligiousEventClick = (event: ReligiousEvent) => {
    setSelectedReligiousEvent(event);
    setIsReligiousModalOpen(true);
  };

  const handleCloseReligiousModal = () => {
    setIsReligiousModalOpen(false);
    setSelectedReligiousEvent(null);
  };

  const getTraditionColor = (tradition: ReligiousTradition): string => {
    switch (tradition) {
      case 'islam':
        return 'text-green-400';
      case 'judaism':
        return 'text-blue-400';
      case 'christianity':
        return 'text-purple-400';
      default:
        return 'text-accent-blue';
    }
  };



  return (
    <ResponsiveLayout>
      <header className="text-center mb-10">
        <h1 className={`${getTextSize('text-4xl')} font-bold text-accent-blue mb-2`}>
          Celestial Events Calculator
        </h1>
        <p className={`${getTextSize('text-lg')} text-slate-400 ${isMobile ? 'px-2' : 'max-w-3xl mx-auto'}`}>
          High-precision calculation of lunar and solar events, enriched with AI-powered cultural insights and religious observances.
        </p>
        
        {/* Responsive Navigation */}
        <div className="mt-6">
          <ResponsiveNavigation
            currentView={currentView}
            onViewChange={handleViewChange}
          />
        </div>
      </header>

      <main>
        {/* Location Input - Always visible */}
        {location && (
          <LocationInput
              initialLatitude={location.latitude}
              initialLongitude={location.longitude}
              onLocationChange={handleLocationChange}
              showCityName={true}
          />
        )}

        {/* Swipeable Content based on current view */}
        <SwipeableViewSwitcher
          currentView={currentView}
          onViewChange={handleViewChange}
          className="mt-8"
        >
          {currentView === 'astronomical' && (
            <>
              <CurrentIllumination illumination={illumination} />
              {isLoading ? (
                <Loader message="Calculating Events..."/>
              ) : error ? (
                <div className="text-center text-red-400 bg-red-900/50 p-4 rounded-lg mt-8">
                  {error}
                </div>
              ) : (
                <>
                  <SolarTimes solarTimes={solarTimes} />
                  <h2 className={`${getTextSize('text-2xl')} font-bold text-center text-slate-300 mt-12 mb-6`}>
                    Upcoming Lunar Holy Days
                  </h2>
                  <EventList 
                    events={events} 
                    religiousEvents={religiousEvents}
                    onReligiousEventClick={handleReligiousEventClick}
                  />
                </>
              )}
            </>
          )}

          {currentView === 'religious' && location && (
            <ReligiousSchedulePanel
              location={location}
              selectedTraditions={selectedTraditions}
              onTraditionChange={handleTraditionChange}
            />
          )}

          {currentView === 'calendar' && location && (
            <ReligiousCalendarView
              location={location}
              selectedTraditions={selectedTraditions}
              viewMode={calendarViewMode}
              onViewModeChange={setCalendarViewMode}
            />
          )}

          {currentView === 'qibla' && location && (
            <QiblaView location={location} />
          )}

          {/* Loading state for religious views */}
          {(currentView === 'religious' || currentView === 'calendar' || currentView === 'qibla') && !location && (
            <Loader message="Loading location..."/>
          )}
        </SwipeableViewSwitcher>
      </main>
      
      <footer className={`text-center mt-12 text-slate-500 ${getTextSize('text-sm')} ${isMobile ? 'px-2' : ''}`}>
          <p>Calculations based on Jean Meeus' "Astronomical Algorithms" and SunCalc.js. Accuracy is typically within minutes.</p>
          <p>Lunar event times are in Local Apparent Solar Time ("sundial time"). Solar event times are in your device's local time.</p>
      </footer>



      {/* Religious Event Detail Modal */}
      <Modal
        isOpen={isReligiousModalOpen}
        onClose={handleCloseReligiousModal}
        title={selectedReligiousEvent?.name || 'Religious Event'}
        size="large"
      >
        {selectedReligiousEvent && (
          <div className="space-y-6">
            <div className={`grid grid-cols-1 ${isMobile ? '' : 'md:grid-cols-2'} gap-6`}>
              <div>
                <h3 className={`${getTextSize('text-lg')} font-semibold text-moonlight mb-2`}>Event Details</h3>
                <div className="space-y-3">
                  <div>
                    <p className={`${getTextSize('text-sm')} text-slate-400 mb-1`}>Date</p>
                    <p className="text-moonlight font-medium">
                      {selectedReligiousEvent.date.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>

                  <div>
                    <p className={`${getTextSize('text-sm')} text-slate-400 mb-1`}>Tradition</p>
                    <p className={`font-medium capitalize ${getTraditionColor(selectedReligiousEvent.tradition)}`}>
                      {selectedReligiousEvent.tradition}
                    </p>
                  </div>

                  <div>
                    <p className={`${getTextSize('text-sm')} text-slate-400 mb-1`}>Type</p>
                    <p className="text-moonlight capitalize">{selectedReligiousEvent.observanceType}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className={`${getTextSize('text-lg')} font-semibold text-moonlight mb-2`}>Description</h3>
                <p className="text-slate-300 leading-relaxed">{selectedReligiousEvent.description}</p>
              </div>
            </div>

            <div>
              <h3 className={`${getTextSize('text-lg')} font-semibold text-moonlight mb-2`}>Significance</h3>
              <p className="text-slate-300 leading-relaxed">{selectedReligiousEvent.significance}</p>
            </div>

            {selectedReligiousEvent.astronomicalBasis && (
              <div>
                <h3 className={`${getTextSize('text-lg')} font-semibold text-moonlight mb-2`}>Astronomical Basis</h3>
                <p className="text-slate-300 leading-relaxed italic">{selectedReligiousEvent.astronomicalBasis}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </ResponsiveLayout>
  );
};

export default App;