import React from 'react';
import { LunarEvent } from '../types';
import MoonPhaseIcon from './MoonPhaseIcon';

interface EventCardProps {
  event: LunarEvent;
}

const PhaseIcon: React.FC<{ phase: string }> = ({ phase }) => {
  // Map phase names to phase angles and illumination fractions
  const getPhaseData = (phaseName: string): { phaseAngle: number; fraction: number } => {
    switch (phaseName) {
      case 'New Moon':
        return { phaseAngle: 0, fraction: 0.005 }; // Very thin crescent
      case 'First Quarter Moon':
        return { phaseAngle: 90, fraction: 0.5 };
      case 'Full Moon':
        return { phaseAngle: 180, fraction: 0.995 }; // Nearly full
      case 'Third Quarter Moon':
        return { phaseAngle: 270, fraction: 0.5 };
      default:
        return { phaseAngle: 0, fraction: 0.005 };
    }
  };

  const { phaseAngle, fraction } = getPhaseData(phase);

  return (
    <div className="mx-auto mb-4">
      <MoonPhaseIcon
        phaseAngle={phaseAngle}
        fraction={fraction}
        size={80}
        className="drop-shadow-lg"
      />
    </div>
  );
};

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const formatDate = (date: Date, options: Intl.DateTimeFormatOptions): string => {
    return new Intl.DateTimeFormat('en-US', options).format(date);
  };

  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  };

  return (
    <div className="bg-card-bg rounded-xl shadow-lg p-6 flex flex-col items-center text-center transform hover:scale-105 transition-transform duration-300">
      <PhaseIcon phase={event.eventName} />
      <h3 className="text-2xl font-semibold text-moonlight mb-2">{event.eventName}</h3>
      
      <div className="w-full mt-4 pt-4 border-t border-slate-600 flex-grow">
        <p className="font-bold text-lg text-accent-blue">Local Solar Time</p>
        <p className="text-slate-300">{formatDate(event.localSolarDate, dateOptions)}</p>
        <p className="text-slate-300 text-xl font-mono">{formatDate(event.localSolarDate, timeOptions)}</p>
      </div>
      
      <div className="w-full mt-4 pt-4 border-t border-slate-600 text-sm">
        <p className="font-semibold text-slate-400">UTC</p>
        <p className="text-slate-400">{event.utcDate.toUTCString()}</p>
      </div>
      

    </div>
  );
};

export default EventCard;