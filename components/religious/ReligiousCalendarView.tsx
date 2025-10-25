import React, { useState, useEffect } from 'react';
import {
  ReligiousTradition,
  ReligiousEvent,
  Location
} from '../../types';
import { IslamicCalendarService } from '../../services/religious/IslamicCalendarService';
import { JewishCalendarService } from '../../services/religious/JewishCalendarService';
import { ChristianCalendarService } from '../../services/religious/ChristianCalendarService';
import Modal from '../Modal';
import SwipeableCalendar from '../SwipeableCalendar';
import { useResponsive } from '../../utils/responsive';

interface ReligiousCalendarViewProps {
  location: Location;
  selectedTraditions: ReligiousTradition[];
  viewMode?: 'month' | 'week';
  onViewModeChange?: (mode: 'month' | 'week') => void;
}

interface CalendarDay {
  date: Date;
  events: ReligiousEvent[];
  isCurrentMonth: boolean;
  isToday: boolean;
}

/**
 * Calendar view component for displaying religious observances
 * Supports monthly/weekly views and multi-tradition overlay
 */
const ReligiousCalendarView: React.FC<ReligiousCalendarViewProps> = ({
  location,
  selectedTraditions,
  viewMode = 'month',
  onViewModeChange
}) => {
  const { isMobile, isTablet, getTextSize } = useResponsive();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [allEvents, setAllEvents] = useState<ReligiousEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<ReligiousEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load events for the current view
  useEffect(() => {
    loadEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate, selectedTraditions, viewMode, location.latitude, location.longitude]);

  const loadEvents = async () => {
    setLoading(true);
    setError(null);

    try {
      const { startDate, endDate } = getDateRange();
      const events: ReligiousEvent[] = [];

      // Load events for each selected tradition
      for (const tradition of selectedTraditions) {
        switch (tradition) {
          case 'islam': {
            const islamicService = new IslamicCalendarService();
            const islamicEvents = await islamicService.getIslamicHolidays(startDate, endDate);
            events.push(...islamicEvents);
            break;
          }

          case 'judaism': {
            const jewishService = new JewishCalendarService();
            const jewishEvents = await jewishService.getJewishObservances(startDate, endDate, location);
            events.push(...jewishEvents);
            break;
          }

          case 'christianity': {
            const christianService = new ChristianCalendarService();
            const christianEvents = await christianService.getLiturgicalEvents(startDate, endDate);
            events.push(...christianEvents);
            break;
          }
        }
      }

      setAllEvents(events);
      generateCalendarDays(events);
      setLoading(false);
      
      // Debug logging
      console.log(`Loaded ${events.length} religious events for ${selectedTraditions.join(', ')} from ${startDate.toDateString()} to ${endDate.toDateString()}`);
      if (events.length > 0) {
        console.log('Events found:', events.map(e => `${e.name} on ${e.date.toDateString()} (${e.tradition})`));
      } else {
        console.log('No events found. Selected traditions:', selectedTraditions);
        
        // Additional debugging for Islamic events specifically
        if (selectedTraditions.includes('islam')) {
          console.log('Debugging Islamic events...');
          try {
            const islamicService = new IslamicCalendarService();
            const testEvents = await islamicService.getIslamicHolidays(startDate, endDate);
            console.log(`Islamic service returned ${testEvents.length} events:`, testEvents.map(e => `${e.name} on ${e.date.toDateString()}`));
          } catch (error) {
            console.error('Error testing Islamic service:', error);
          }
        }
      }
    } catch (err) {
      console.error('Error loading calendar events:', err);
      setError(err instanceof Error ? err.message : 'Failed to load calendar events');
      setLoading(false);
    }
  };

  const getDateRange = (): { startDate: Date; endDate: Date } => {
    if (viewMode === 'week') {
      // Get the week containing currentDate
      const startDate = new Date(currentDate);
      startDate.setDate(startDate.getDate() - startDate.getDay()); // Start of week (Sunday)
      
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6); // End of week (Saturday)
      
      return { startDate, endDate };
    } else {
      // Get the month containing currentDate, including partial weeks
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const firstDay = startDate.getDay();
      startDate.setDate(startDate.getDate() - firstDay); // Start from Sunday of first week
      
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      const lastDay = endDate.getDay();
      endDate.setDate(endDate.getDate() + (6 - lastDay)); // End on Saturday of last week
      
      return { startDate, endDate };
    }
  };

  const generateCalendarDays = (events: ReligiousEvent[]) => {
    const { startDate, endDate } = getDateRange();
    const days: CalendarDay[] = [];
    const currentMonth = currentDate.getMonth();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const current = new Date(startDate);
    while (current <= endDate) {
      const dayEvents = events.filter(event => {
        const eventDate = new Date(event.date);
        eventDate.setHours(0, 0, 0, 0);
        const currentDay = new Date(current);
        currentDay.setHours(0, 0, 0, 0);
        return eventDate.getTime() === currentDay.getTime();
      });

      days.push({
        date: new Date(current),
        events: dayEvents,
        isCurrentMonth: current.getMonth() === currentMonth,
        isToday: current.getTime() === today.getTime()
      });

      current.setDate(current.getDate() + 1);
    }

    setCalendarDays(days);
  };

  const navigatePrevious = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };

  const navigateNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const navigateToday = () => {
    setCurrentDate(new Date());
  };

  const findNextEventsMonth = async () => {
    // Look ahead up to 12 months to find events
    const searchDate = new Date(currentDate);
    
    for (let i = 0; i < 12; i++) {
      searchDate.setMonth(searchDate.getMonth() + 1);
      
      const monthStart = new Date(searchDate.getFullYear(), searchDate.getMonth(), 1);
      const monthEnd = new Date(searchDate.getFullYear(), searchDate.getMonth() + 1, 0);
      
      try {
        const events: ReligiousEvent[] = [];
        
        for (const tradition of selectedTraditions) {
          switch (tradition) {
            case 'islam': {
              const islamicService = new IslamicCalendarService();
              const islamicEvents = await islamicService.getIslamicHolidays(monthStart, monthEnd);
              events.push(...islamicEvents);
              break;
            }
            case 'judaism': {
              const jewishService = new JewishCalendarService();
              const jewishEvents = await jewishService.getJewishObservances(monthStart, monthEnd, location);
              events.push(...jewishEvents);
              break;
            }
            case 'christianity': {
              const christianService = new ChristianCalendarService();
              const christianEvents = await christianService.getLiturgicalEvents(monthStart, monthEnd);
              events.push(...christianEvents);
              break;
            }
          }
        }
        
        if (events.length > 0) {
          setCurrentDate(new Date(searchDate));
          return;
        }
      } catch (error) {
        console.error('Error searching for events:', error);
      }
    }
  };

  const getTraditionColor = (tradition: ReligiousTradition): string => {
    switch (tradition) {
      case 'islam':
        return 'bg-green-400';
      case 'judaism':
        return 'bg-blue-400';
      case 'christianity':
        return 'bg-purple-400';
      default:
        return 'bg-accent-blue';
    }
  };

  const getTraditionTextColor = (tradition: ReligiousTradition): string => {
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

  const formatMonthYear = (): string => {
    return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const formatWeekRange = (): string => {
    const { startDate, endDate } = getDateRange();
    return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (loading) {
    return (
      <div className="bg-card-bg/70 rounded-lg p-6 border border-slate-600">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-blue"></div>
          <span className="ml-3 text-slate-300">Loading calendar...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card-bg/70 rounded-lg p-6 border border-red-500/50">
        <div className="text-red-400">
          <p className="font-semibold mb-2">Error loading calendar</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card-bg/70 rounded-lg p-6 border border-slate-600">
      {/* Header */}
      <div className="mb-6">
        <div className={`flex items-center ${isMobile ? 'flex-col gap-4' : 'justify-between'} mb-4`}>
          <h2 className={`${getTextSize('text-2xl')} font-bold text-moonlight ${isMobile ? 'text-center' : ''}`}>
            {viewMode === 'month' ? formatMonthYear() : formatWeekRange()}
          </h2>
          
          {/* View Mode Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => onViewModeChange?.('month')}
              className={`
                px-3 py-1 rounded ${getTextSize('text-sm')} font-medium transition-colors
                ${viewMode === 'month'
                  ? 'bg-accent-blue text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }
              `}
              aria-label="Month view"
              aria-pressed={viewMode === 'month'}
            >
              Month
            </button>
            <button
              onClick={() => onViewModeChange?.('week')}
              className={`
                px-3 py-1 rounded ${getTextSize('text-sm')} font-medium transition-colors
                ${viewMode === 'week'
                  ? 'bg-accent-blue text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }
              `}
              aria-label="Week view"
              aria-pressed={viewMode === 'week'}
            >
              Week
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className={`flex items-center ${isMobile ? 'flex-col gap-3' : 'justify-between'}`}>
          <button
            onClick={navigatePrevious}
            className={`px-4 py-2 bg-slate-700 text-slate-300 rounded hover:bg-slate-600 transition-colors ${isMobile ? 'w-full' : ''}`}
            aria-label={`Previous ${viewMode}`}
          >
            ← Previous
          </button>
          
          <button
            onClick={navigateToday}
            className={`px-4 py-2 bg-accent-blue text-white rounded hover:bg-accent-blue/80 transition-colors ${isMobile ? 'w-full' : ''}`}
            aria-label="Go to today"
          >
            Today
          </button>
          
          <button
            onClick={navigateNext}
            className={`px-4 py-2 bg-slate-700 text-slate-300 rounded hover:bg-slate-600 transition-colors ${isMobile ? 'w-full' : ''}`}
            aria-label={`Next ${viewMode}`}
          >
            Next →
          </button>
        </div>

        {/* Color Legend */}
        {selectedTraditions.length > 0 && (
          <div className="mt-4 p-3 bg-slate-800/30 rounded-lg border border-slate-600/50">
            <div className="flex items-center justify-between">
              <h3 className={`${getTextSize('text-sm')} font-medium text-slate-300`}>
                {selectedTraditions.length === 1 ? 'Showing Events For' : 'Event Colors by Tradition'}
              </h3>
              <span className={`${getTextSize('text-xs')} text-slate-400`}>
                Click events for details
              </span>
            </div>
            <div className={`flex ${isMobile ? 'flex-col gap-2' : 'flex-wrap gap-4'} mt-2`}>
              {selectedTraditions.map(tradition => {
                const getTraditionIcon = (tradition: ReligiousTradition): string => {
                  switch (tradition) {
                    case 'islam': return '☪️';
                    case 'judaism': return '✡️';
                    case 'christianity': return '✝️';
                    default: return '📿';
                  }
                };
                
                const getTraditionLabel = (tradition: ReligiousTradition): string => {
                  switch (tradition) {
                    case 'islam': return 'Islamic';
                    case 'judaism': return 'Jewish';
                    case 'christianity': return 'Christian';
                    default: return tradition;
                  }
                };

                return (
                  <div key={tradition} className="flex items-center gap-2">
                    <div 
                      className={`w-3 h-3 rounded-sm ${getTraditionColor(tradition)}`}
                      aria-hidden="true"
                    />
                    <span className={`${getTextSize('text-sm')} ${getTraditionTextColor(tradition)} font-medium`}>
                      {getTraditionLabel(tradition)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Calendar Grid with Swipe Support */}
      <SwipeableCalendar
        onSwipeLeft={navigateNext}
        onSwipeRight={navigatePrevious}
        className="relative"
      >
        <div className={`grid grid-cols-7 ${isMobile ? 'gap-1' : 'gap-2'}`}>
        {/* Week day headers */}
        {weekDays.map(day => (
          <div
            key={day}
            className={`text-center font-semibold text-slate-400 py-2 ${getTextSize('text-sm')}`}
          >
            {isMobile ? day.slice(0, 1) : day}
          </div>
        ))}

        {/* Calendar days */}
        {calendarDays.map((day, index) => (
          <div
            key={index}
            className={`
              ${isMobile ? 'min-h-16 p-1' : 'min-h-24 p-2'} rounded border transition-colors
              ${day.isToday
                ? 'border-accent-blue bg-accent-blue/10'
                : day.isCurrentMonth
                  ? 'border-slate-600 bg-slate-800/50'
                  : 'border-slate-700 bg-slate-900/30'
              }
              ${day.events.length > 0 ? 'cursor-pointer hover:border-slate-500' : ''}
            `}
            role={day.events.length > 0 ? 'button' : undefined}
            tabIndex={day.events.length > 0 ? 0 : undefined}
            onClick={() => day.events.length > 0 && setSelectedEvent(day.events[0])}
            onKeyDown={(e) => {
              if (day.events.length > 0 && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                setSelectedEvent(day.events[0]);
              }
            }}
            aria-label={`${day.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}${day.events.length > 0 ? `, ${day.events.length} event${day.events.length > 1 ? 's' : ''}` : ''}`}
          >
            {/* Date number */}
            <div
              className={`
                ${getTextSize('text-sm')} font-medium mb-1
                ${day.isToday
                  ? 'text-accent-blue font-bold'
                  : day.isCurrentMonth
                    ? 'text-moonlight'
                    : 'text-slate-500'
                }
              `}
            >
              {day.date.getDate()}
            </div>

            {/* Event indicators */}
            {day.events.length > 0 && (
              <div className="space-y-1">
                {day.events.slice(0, isMobile ? 1 : 3).map((event, eventIndex) => (
                  <div
                    key={eventIndex}
                    className={`
                      ${getTextSize('text-xs')} px-1 py-0.5 rounded truncate
                      ${getTraditionColor(event.tradition)} bg-opacity-20
                      ${getTraditionTextColor(event.tradition)}
                    `}
                    title={event.name}
                  >
                    {isMobile ? '•' : event.name}
                  </div>
                ))}
                {day.events.length > (isMobile ? 1 : 3) && (
                  <div className={`${getTextSize('text-xs')} text-slate-400 px-1`}>
                    +{day.events.length - (isMobile ? 1 : 3)} more
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        </div>
      </SwipeableCalendar>

      {/* No events message */}
      {!loading && allEvents.length === 0 && (
        <div className="mt-6 text-center">
          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-600">
            <h3 className={`${getTextSize('text-lg')} font-semibold text-moonlight mb-2`}>
              No Religious Events This {viewMode === 'month' ? 'Month' : 'Week'}
            </h3>
            <p className="text-slate-400 mb-4">
              There are no major religious observances for the selected traditions ({selectedTraditions.join(', ')}) during this time period.
            </p>
            <div className="flex flex-col items-center space-y-3">
              <p className={`${getTextSize('text-sm')} text-slate-500`}>
                Try navigating to different months to find upcoming holidays and observances.
              </p>
              <button
                onClick={findNextEventsMonth}
                className="px-4 py-2 bg-accent-blue text-white rounded-lg hover:bg-accent-blue/80 transition-colors text-sm"
              >
                Find Next Events
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedEvent(null)}
          title={selectedEvent.name}
        >
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-400 mb-1">Date</p>
              <p className="text-moonlight font-medium">
                {selectedEvent.date.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-400 mb-1">Tradition</p>
              <p className={`font-medium capitalize ${getTraditionTextColor(selectedEvent.tradition)}`}>
                {selectedEvent.tradition}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-400 mb-1">Type</p>
              <p className="text-moonlight capitalize">{selectedEvent.observanceType}</p>
            </div>

            <div>
              <p className="text-sm text-slate-400 mb-2">Description</p>
              <p className="text-slate-300">{selectedEvent.description}</p>
            </div>

            <div>
              <p className="text-sm text-slate-400 mb-2">Significance</p>
              <p className="text-slate-300">{selectedEvent.significance}</p>
            </div>

            {selectedEvent.astronomicalBasis && (
              <div>
                <p className="text-sm text-slate-400 mb-2">Astronomical Basis</p>
                <p className="text-slate-300 italic">{selectedEvent.astronomicalBasis}</p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ReligiousCalendarView;
