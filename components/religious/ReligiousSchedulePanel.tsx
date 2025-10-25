import React, { useState, useEffect } from 'react';
import { 
  ReligiousTradition, 
  PrayerTime, 
  ReligiousEvent,
  Location,
  IslamicCalculationConfig,
  JewishCalculationConfig
} from '../../types';
import PrayerTimeCard from '../PrayerTimeCard';
import ResponsiveGrid from '../ResponsiveGrid';
import { IslamicCalendarService } from '../../services/religious/IslamicCalendarService';
import { JewishCalendarService } from '../../services/religious/JewishCalendarService';
import { ChristianCalendarService } from '../../services/religious/ChristianCalendarService';
import { useResponsive } from '../../utils/responsive';

interface ReligiousSchedulePanelProps {
  location: Location;
  selectedTraditions?: ReligiousTradition[];
  islamicConfig?: IslamicCalculationConfig;
  jewishConfig?: JewishCalculationConfig;
  onTraditionChange?: (traditions: ReligiousTradition[]) => void;
}

/**
 * Main panel for displaying religious events and prayer times
 * Supports tradition selection, switching, and countdown timers
 */
const ReligiousSchedulePanel: React.FC<ReligiousSchedulePanelProps> = ({
  location,
  selectedTraditions = ['islam'],
  islamicConfig = {
    method: 'MuslimWorldLeague',
    madhab: 'shafi'
  },
  jewishConfig = {
    method: 'standard',
    candleLightingMinutes: 18,
    havdalahMinutes: 42,
    useElevation: false
  },
  onTraditionChange
}) => {
  const { isMobile, isTablet, getTextSize } = useResponsive();
  const [activeTradition, setActiveTradition] = useState<ReligiousTradition>(selectedTraditions[0]);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<ReligiousEvent[]>([]);
  const [nextPrayer, setNextPrayer] = useState<PrayerTime | null>(null);
  const [timeUntilNext, setTimeUntilNext] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load prayer times and events
  useEffect(() => {
    loadReligiousData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.latitude, location.longitude, activeTradition]);

  // Update countdown timer
  useEffect(() => {
    if (!nextPrayer) return;

    const updateCountdown = () => {
      const now = new Date();
      const diff = nextPrayer.time.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeUntilNext('Now');
        // Reload data when prayer time passes
        loadReligiousData();
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (hours > 0) {
        setTimeUntilNext(`${hours}h ${minutes}m`);
      } else if (minutes > 0) {
        setTimeUntilNext(`${minutes}m ${seconds}s`);
      } else {
        setTimeUntilNext(`${seconds}s`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [nextPrayer]);

  const loadReligiousData = async () => {
    setLoading(true);
    setError(null);

    try {
      const today = new Date();
      let prayers: PrayerTime[] = [];
      let events: ReligiousEvent[] = [];

      // Load data based on active tradition
      switch (activeTradition) {
        case 'islam': {
          const islamicService = new IslamicCalendarService();
          prayers = await islamicService.getPrayerTimes(today, location, islamicConfig);
          const endDate = new Date(today);
          endDate.setDate(endDate.getDate() + 30);
          events = await islamicService.getIslamicHolidays(today, endDate);
          break;
        }

        case 'judaism': {
          const jewishService = new JewishCalendarService();
          prayers = await jewishService.getPrayerTimes(today, location, jewishConfig);
          const jewishEndDate = new Date(today);
          jewishEndDate.setDate(jewishEndDate.getDate() + 30);
          events = await jewishService.getJewishObservances(today, jewishEndDate, location);
          break;
        }

        case 'christianity': {
          const christianService = new ChristianCalendarService();
          prayers = await christianService.getCanonicalHours(today, location);
          const christianEndDate = new Date(today);
          christianEndDate.setDate(christianEndDate.getDate() + 30);
          events = await christianService.getLiturgicalEvents(today, christianEndDate);
          break;
        }
      }

      setPrayerTimes(prayers);
      setUpcomingEvents(events ? events.slice(0, 5) : []); // Show next 5 events

      // Find next prayer
      const now = new Date();
      const futurePrayers = prayers.filter(p => p.time > now);
      
      if (futurePrayers.length > 0) {
        setNextPrayer(futurePrayers[0]);
      } else {
        // No prayers left today, get tomorrow's first prayer
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        let tomorrowPrayers: PrayerTime[] = [];
        switch (activeTradition) {
          case 'islam': {
            const islamicService = new IslamicCalendarService();
            tomorrowPrayers = await islamicService.getPrayerTimes(tomorrow, location, islamicConfig);
            break;
          }
          case 'judaism': {
            const jewishService = new JewishCalendarService();
            tomorrowPrayers = await jewishService.getPrayerTimes(tomorrow, location, jewishConfig);
            break;
          }
          case 'christianity': {
            const christianService = new ChristianCalendarService();
            tomorrowPrayers = await christianService.getCanonicalHours(tomorrow, location);
            break;
          }
        }
        
        setNextPrayer(tomorrowPrayers.length > 0 ? tomorrowPrayers[0] : null);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error loading religious data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load religious data');
      setLoading(false);
    }
  };

  const handleTraditionSelect = (tradition: ReligiousTradition) => {
    // If tradition is not selected, add it to selected traditions first
    if (!selectedTraditions.includes(tradition)) {
      const newTraditions = [...selectedTraditions, tradition];
      if (onTraditionChange) {
        onTraditionChange(newTraditions);
      }
    }
    setActiveTradition(tradition);
  };

  const toggleTradition = (tradition: ReligiousTradition) => {
    const newTraditions = selectedTraditions.includes(tradition)
      ? selectedTraditions.filter(t => t !== tradition)
      : [...selectedTraditions, tradition];
    
    if (newTraditions.length > 0 && onTraditionChange) {
      onTraditionChange(newTraditions);
      
      // If we removed the active tradition, switch to the first available
      if (!newTraditions.includes(activeTradition)) {
        setActiveTradition(newTraditions[0]);
      }
    }
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

  const getTraditionBg = (tradition: ReligiousTradition): string => {
    switch (tradition) {
      case 'islam':
        return 'bg-green-400/20';
      case 'judaism':
        return 'bg-blue-400/20';
      case 'christianity':
        return 'bg-purple-400/20';
      default:
        return 'bg-accent-blue/20';
    }
  };

  const getTraditionBorder = (tradition: ReligiousTradition): string => {
    switch (tradition) {
      case 'islam':
        return 'border-green-400';
      case 'judaism':
        return 'border-blue-400';
      case 'christianity':
        return 'border-purple-400';
      default:
        return 'border-accent-blue';
    }
  };

  const getTraditionLabel = (tradition: ReligiousTradition): string => {
    switch (tradition) {
      case 'islam':
        return 'Islamic';
      case 'judaism':
        return 'Jewish';
      case 'christianity':
        return 'Christian';
      default:
        return tradition;
    }
  };

  if (loading) {
    return (
      <div className="bg-card-bg/70 rounded-lg p-6 border border-slate-600">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-blue"></div>
          <span className="ml-3 text-slate-300">Loading religious schedule...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card-bg/70 rounded-lg p-6 border border-red-500/50">
        <div className="text-red-400">
          <p className="font-semibold mb-2">Error loading religious data</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card-bg/70 rounded-lg p-6 border border-slate-600">
      {/* Header with Tradition Selector */}
      <div className="mb-6">
        <h2 className={`${getTextSize('text-2xl')} font-bold text-moonlight mb-4`}>Religious Schedule</h2>
        
        {/* Tradition Tabs */}
        <div className={`flex ${isMobile ? 'flex-col' : 'flex-wrap'} gap-2 mb-4`}>
          {(['islam', 'judaism', 'christianity'] as ReligiousTradition[]).map(tradition => (
            <button
              key={tradition}
              onClick={() => handleTraditionSelect(tradition)}
              className={`
                px-4 py-2 rounded-lg font-medium transition-all duration-200
                ${isMobile ? 'w-full' : ''}
                ${activeTradition === tradition
                  ? `${getTraditionBg(tradition)} ${getTraditionColor(tradition)} ${getTraditionBorder(tradition)} border-2`
                  : selectedTraditions.includes(tradition)
                    ? 'bg-slate-700 text-slate-300 border border-slate-600 hover:bg-slate-600'
                    : 'bg-slate-800 text-slate-400 border border-slate-600 hover:bg-slate-700 hover:text-slate-300'
                }
              `}
              aria-label={`Switch to ${getTraditionLabel(tradition)} tradition`}
              aria-pressed={activeTradition === tradition}
            >
              {getTraditionLabel(tradition)}
              {!selectedTraditions.includes(tradition) && (
                <span className="ml-2 text-xs opacity-75">(click to enable)</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Next Prayer Countdown */}
      {nextPrayer && (
        <div 
          className={`
            mb-6 p-4 rounded-lg border-2 ${getTraditionBorder(activeTradition)}
            ${getTraditionBg(activeTradition)}
          `}
          role="status"
          aria-live="polite"
        >
          <div className={`flex items-center ${isMobile ? 'flex-col text-center' : 'justify-between'}`}>
            <div className={isMobile ? 'mb-4' : ''}>
              <p className={`${getTextSize('text-sm')} text-slate-300 mb-1`}>Next Prayer</p>
              <p className={`${getTextSize('text-2xl')} font-bold ${getTraditionColor(activeTradition)}`}>
                {nextPrayer.name}
              </p>
            </div>
            <div className={isMobile ? '' : 'text-right'}>
              <p className={`${getTextSize('text-sm')} text-slate-300 mb-1`}>In</p>
              <p className={`${getTextSize('text-3xl')} font-mono font-bold ${getTraditionColor(activeTradition)}`}>
                {timeUntilNext}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Prayer Times */}
      <div className="mb-6">
        <h3 className={`${getTextSize('text-lg')} font-semibold text-moonlight mb-3`}>Today's Prayer Times</h3>
        <ResponsiveGrid type="prayers" gap="medium">
          {prayerTimes.map((prayer, index) => (
            <PrayerTimeCard
              key={`${prayer.name}-${index}`}
              prayer={prayer}
              isNext={nextPrayer?.name === prayer.name && nextPrayer?.time.getTime() === prayer.time.getTime()}
            />
          ))}
        </ResponsiveGrid>
      </div>

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <div>
          <h3 className={`${getTextSize('text-lg')} font-semibold text-moonlight mb-3`}>Upcoming Observances</h3>
          <div className="space-y-3">
            {upcomingEvents.map(event => (
              <div
                key={event.id}
                className="bg-slate-800/50 rounded-lg p-4 border border-slate-600 hover:border-slate-500 transition-colors"
              >
                <div className={`flex items-start ${isMobile ? 'flex-col' : 'justify-between'}`}>
                  <div className="flex-1">
                    <h4 className={`font-semibold ${getTraditionColor(activeTradition)} mb-1`}>
                      {event.name}
                    </h4>
                    <p className={`${getTextSize('text-sm')} text-slate-300 mb-2`}>{event.description}</p>
                    <p className={`${getTextSize('text-xs')} text-slate-400`}>{event.significance}</p>
                  </div>
                  <div className={`${isMobile ? 'mt-3 w-full' : 'ml-4'} ${isMobile ? 'text-left' : 'text-right'}`}>
                    <p className={`${getTextSize('text-sm')} font-mono text-moonlight`}>
                      {event.date.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                    <p className={`${getTextSize('text-xs')} text-slate-400 mt-1 capitalize`}>
                      {event.observanceType}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReligiousSchedulePanel;
