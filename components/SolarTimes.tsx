import React from 'react';
import { SolarTimesData } from '../types';
import TimeCard from './TimeCard';
import { SunriseIcon, SunsetIcon, SolarNoonIcon, GoldenHourIcon, TwilightIcon } from './icons/SunIcons';

interface SolarTimesProps {
  solarTimes: SolarTimesData | null;
}

const SolarTimes: React.FC<SolarTimesProps> = ({ solarTimes }) => {
  if (!solarTimes) return null;

  const formatTime = (date: Date) => {
      return new Intl.DateTimeFormat('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
      }).format(date);
  }

  return (
    <div className="mb-10">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-300">Key Solar Times for Today</h2>
        <p className="text-sm text-slate-400">(Times are shown in your local time zone)</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <TimeCard 
            icon={<SunriseIcon className="w-8 h-8 text-yellow-400" />} 
            title="Sunrise" 
            time={formatTime(solarTimes.sunrise)} 
        />
        <TimeCard 
            icon={<SolarNoonIcon className="w-8 h-8 text-yellow-300" />} 
            title="Solar Noon" 
            time={formatTime(solarTimes.solarNoon)} 
        />
        <TimeCard 
            icon={<SunsetIcon className="w-8 h-8 text-orange-400" />} 
            title="Sunset" 
            time={formatTime(solarTimes.sunset)} 
        />
        <TimeCard 
            icon={<GoldenHourIcon className="w-8 h-8 text-amber-400" />} 
            title="Morning Golden Hour End" 
            time={formatTime(solarTimes.goldenHourEnd)} 
        />
        <TimeCard 
            icon={<GoldenHourIcon className="w-8 h-8 text-amber-500" />} 
            title="Evening Golden Hour Start" 
            time={formatTime(solarTimes.goldenHourStart)} 
        />
        <TimeCard 
            icon={<TwilightIcon className="w-8 h-8 text-indigo-400" />} 
            title="Nautical Dusk" 
            time={formatTime(solarTimes.nauticalDusk)} 
        />
      </div>
    </div>
  );
};

export default SolarTimes;