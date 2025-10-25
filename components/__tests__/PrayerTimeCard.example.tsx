/**
 * Example usage of PrayerTimeCard component
 * This file demonstrates how to use the PrayerTimeCard component with different prayer types
 */

import React from 'react';
import PrayerTimeCard from '../PrayerTimeCard';
import { PrayerTime } from '../../types';

export const PrayerTimeCardExamples: React.FC = () => {
  // Example Islamic prayer with Qibla direction
  const islamicPrayer: PrayerTime = {
    name: 'Fajr',
    time: new Date('2025-10-19T05:30:00'),
    tradition: 'islam',
    calculationMethod: 'MuslimWorldLeague',
    qiblaDirection: 58.5
  };

  // Example Jewish prayer
  const jewishPrayer: PrayerTime = {
    name: 'Shacharit',
    time: new Date('2025-10-19T07:00:00'),
    tradition: 'judaism',
    calculationMethod: 'standard'
  };

  // Example Christian prayer
  const christianPrayer: PrayerTime = {
    name: 'Lauds',
    time: new Date('2025-10-19T06:00:00'),
    tradition: 'christianity',
    calculationMethod: 'canonical-hours'
  };

  return (
    <div className="min-h-screen bg-night-sky p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-accent-blue mb-8 text-center">
          PrayerTimeCard Examples
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Islamic Prayer - with Qibla */}
          <div>
            <h2 className="text-xl font-semibold text-green-400 mb-4">Islamic Prayer</h2>
            <PrayerTimeCard prayer={islamicPrayer} isNext={true} />
          </div>

          {/* Jewish Prayer */}
          <div>
            <h2 className="text-xl font-semibold text-blue-400 mb-4">Jewish Prayer</h2>
            <PrayerTimeCard prayer={jewishPrayer} />
          </div>

          {/* Christian Prayer */}
          <div>
            <h2 className="text-xl font-semibold text-purple-400 mb-4">Christian Prayer</h2>
            <PrayerTimeCard prayer={christianPrayer} />
          </div>

          {/* Islamic Prayer without Qibla display */}
          <div>
            <h2 className="text-xl font-semibold text-green-400 mb-4">Islamic Prayer (No Qibla)</h2>
            <PrayerTimeCard prayer={islamicPrayer} showQibla={false} />
          </div>

          {/* Multiple Islamic prayers showing next prayer */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-green-400 mb-4">Daily Prayer Schedule</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <PrayerTimeCard 
                prayer={{
                  name: 'Fajr',
                  time: new Date('2025-10-19T05:30:00'),
                  tradition: 'islam',
                  calculationMethod: 'MuslimWorldLeague',
                  qiblaDirection: 58.5
                }}
              />
              <PrayerTimeCard 
                prayer={{
                  name: 'Dhuhr',
                  time: new Date('2025-10-19T12:15:00'),
                  tradition: 'islam',
                  calculationMethod: 'MuslimWorldLeague',
                  qiblaDirection: 58.5
                }}
                isNext={true}
              />
              <PrayerTimeCard 
                prayer={{
                  name: 'Asr',
                  time: new Date('2025-10-19T15:45:00'),
                  tradition: 'islam',
                  calculationMethod: 'MuslimWorldLeague',
                  qiblaDirection: 58.5
                }}
              />
              <PrayerTimeCard 
                prayer={{
                  name: 'Maghrib',
                  time: new Date('2025-10-19T18:30:00'),
                  tradition: 'islam',
                  calculationMethod: 'MuslimWorldLeague',
                  qiblaDirection: 58.5
                }}
              />
            </div>
          </div>
        </div>

        <div className="mt-12 p-6 bg-card-bg/50 rounded-lg">
          <h2 className="text-2xl font-bold text-moonlight mb-4">Usage Notes</h2>
          <ul className="space-y-2 text-slate-300">
            <li>• <strong>isNext</strong>: Highlights the card as the next upcoming prayer</li>
            <li>• <strong>showQibla</strong>: Controls whether to display Qibla direction (Islamic prayers only)</li>
            <li>• <strong>Tradition colors</strong>: Green for Islam, Blue for Judaism, Purple for Christianity</li>
            <li>• <strong>Calculation method</strong>: Automatically formatted for display</li>
            <li>• <strong>Qibla compass</strong>: Animated arrow pointing to Mecca (Islamic prayers only)</li>
            <li>• <strong>Accessibility</strong>: Full ARIA support for screen readers</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PrayerTimeCardExamples;
