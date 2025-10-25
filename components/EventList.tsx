import React from 'react';
import { LunarEvent, ReligiousEvent } from '../types';
import EventCard from './EventCard';
import ResponsiveGrid from './ResponsiveGrid';
import { useResponsive } from '../utils/responsive';

interface EventListProps {
  events: LunarEvent[];
  religiousEvents?: ReligiousEvent[];
  onReligiousEventClick?: (event: ReligiousEvent) => void;
}

const EventList: React.FC<EventListProps> = ({ 
  events, 
  religiousEvents = [], 
  onReligiousEventClick 
}) => {
  const { getTextSize } = useResponsive();
  
  // Combine and sort all events by date
  const allEvents = [
    ...events.map(event => ({ type: 'lunar' as const, event, date: event.utcDate })),
    ...religiousEvents.map(event => ({ type: 'religious' as const, event, date: event.date }))
  ].sort((a, b) => a.date.getTime() - b.date.getTime());

  const getTraditionColor = (tradition: string): string => {
    switch (tradition) {
      case 'islam':
        return 'border-green-400 bg-green-400/10';
      case 'judaism':
        return 'border-blue-400 bg-blue-400/10';
      case 'christianity':
        return 'border-purple-400 bg-purple-400/10';
      default:
        return 'border-accent-blue bg-accent-blue/10';
    }
  };

  const renderReligiousEventCard = (religiousEvent: ReligiousEvent) => (
    <div
      key={religiousEvent.id}
      className={`
        bg-card-bg rounded-lg p-4 border-2 transition-all duration-300 cursor-pointer
        hover:scale-105 hover:shadow-lg ${getTraditionColor(religiousEvent.tradition)}
      `}
      onClick={() => onReligiousEventClick?.(religiousEvent)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onReligiousEventClick?.(religiousEvent);
        }
      }}
      aria-label={`Religious event: ${religiousEvent.name}`}
    >
      <div className="text-center">
        <h3 className="text-lg font-bold text-moonlight mb-2">{religiousEvent.name}</h3>
        <p className="text-sm text-slate-400 mb-2 capitalize">{religiousEvent.tradition}</p>
        <p className="text-xs text-slate-500 mb-3">{religiousEvent.description}</p>
        <div className="text-accent-blue font-mono text-sm">
          {religiousEvent.date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })}
        </div>
        <div className="text-xs text-slate-400 mt-1 capitalize">
          {religiousEvent.observanceType}
        </div>
      </div>
    </div>
  );

  return (
    <div className="mt-8">
      {religiousEvents.length > 0 && (
        <div className="mb-8">
          <h3 className={`${getTextSize('text-xl')} font-semibold text-slate-300 mb-4 text-center`}>
            Upcoming Religious Observances
          </h3>
          <ResponsiveGrid type="events" gap="large">
            {religiousEvents.slice(0, 4).map(renderReligiousEventCard)}
          </ResponsiveGrid>
        </div>
      )}
      
      <ResponsiveGrid type="events" gap="large">
        {events.map((event) => (
          <EventCard key={event.julianDate} event={event} />
        ))}
      </ResponsiveGrid>
    </div>
  );
};

export default EventList;