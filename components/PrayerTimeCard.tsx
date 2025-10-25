import React from 'react';
import { PrayerTime } from '../types';

interface PrayerTimeCardProps {
  prayer: PrayerTime;
  isNext?: boolean;
}

/**
 * PrayerTimeCard component displays individual prayer times with calculation method
 */
const PrayerTimeCard: React.FC<PrayerTimeCardProps> = ({
  prayer,
  isNext = false
}) => {
  const [timeUntil, setTimeUntil] = React.useState<string>('');

  // Update countdown timer - only for next prayer
  React.useEffect(() => {
    if (!isNext) {
      setTimeUntil('');
      return;
    }

    const updateCountdown = () => {
      const now = new Date();
      const diff = prayer.time.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeUntil('Now');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (hours > 0) {
        setTimeUntil(`${hours}h ${minutes}m`);
      } else if (minutes > 0) {
        setTimeUntil(`${minutes}m ${seconds}s`);
      } else {
        setTimeUntil(`${seconds}s`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000); // Update every second for next prayer

    return () => clearInterval(interval);
  }, [prayer.time, isNext]);

  const formatTime = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  };

  const formatCalculationMethod = (method: string): string => {
    // Format calculation method for display
    // Convert camelCase or PascalCase to readable format
    return method
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  const getTraditionColor = (tradition: string): string => {
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

  const getTraditionBorder = (tradition: string): string => {
    switch (tradition) {
      case 'islam':
        return 'border-green-400/30';
      case 'judaism':
        return 'border-blue-400/30';
      case 'christianity':
        return 'border-purple-400/30';
      default:
        return 'border-accent-blue/30';
    }
  };

  const getTraditionBg = (tradition: string): string => {
    switch (tradition) {
      case 'islam':
        return 'bg-green-400/10';
      case 'judaism':
        return 'bg-blue-400/10';
      case 'christianity':
        return 'bg-purple-400/10';
      default:
        return 'bg-accent-blue/10';
    }
  };

  return (
    <div
      className={`
        bg-card-bg/70 rounded-lg p-4 border-2 transition-all duration-300
        ${isNext ? `${getTraditionBorder(prayer.tradition)} shadow-lg scale-105` : 'border-transparent'}
        hover:${getTraditionBorder(prayer.tradition)} hover:shadow-md
      `}
      role="article"
      aria-label={`${prayer.name} prayer time at ${formatTime(prayer.time)}`}
    >
      {/* Prayer Name */}
      <div className="flex items-center justify-between mb-2">
        <h3 className={`text-xl font-semibold ${getTraditionColor(prayer.tradition)}`}>
          {prayer.name}
        </h3>
        {isNext && (
          <span
            className={`text-xs font-bold px-2 py-1 rounded ${getTraditionBg(prayer.tradition)} ${getTraditionColor(prayer.tradition)}`}
            aria-label="Next prayer"
          >
            NEXT
          </span>
        )}
      </div>

      {/* Prayer Time */}
      <div className="mb-3">
        <p className="text-3xl font-mono text-moonlight font-bold">
          {formatTime(prayer.time)}
        </p>
        <p className="text-xs text-slate-400 mt-1">
          {prayer.time.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
          })}
        </p>
      </div>

      {/* Countdown Timer - Only show for next prayer */}
      {isNext && timeUntil && (
        <div className="mb-3 bg-green-400/20 border border-green-400/50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-green-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium">Time remaining</span>
            </div>
            <span className="text-2xl font-mono font-bold text-green-400">{timeUntil}</span>
          </div>
        </div>
      )}

      {/* Rak'ah Information (Islamic prayers only) */}
      {prayer.tradition === 'islam' && (
        (prayer.sunnahBefore !== undefined && prayer.sunnahBefore > 0) ||
        (prayer.fard !== undefined && prayer.fard > 0) ||
        (prayer.sunnahAfter !== undefined && prayer.sunnahAfter > 0) ||
        (prayer.witr !== undefined && prayer.witr > 0) ||
        (prayer.rakahOptional !== undefined && prayer.rakahOptional > 0)
      ) && (
        <div className="mb-3 space-y-2">
          {/* Sunnah Before */}
          {prayer.sunnahBefore !== undefined && prayer.sunnahBefore > 0 && (
            <div className="flex items-center justify-between bg-green-400/10 rounded px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="text-green-400 text-lg">📿</span>
                <span className="text-sm text-slate-300">Sunnah Before</span>
              </div>
              <span className="text-green-400 font-bold">{prayer.sunnahBefore} Rak'ah</span>
            </div>
          )}

          {/* Fard (Obligatory) */}
          {prayer.fard !== undefined && prayer.fard > 0 && (
            <div className="flex items-center justify-between bg-yellow-400/10 rounded px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="text-yellow-400 text-lg">⭐</span>
                <span className="text-sm text-slate-300">Fard</span>
              </div>
              <span className="text-yellow-400 font-bold">{prayer.fard} Rak'ah</span>
            </div>
          )}

          {/* Sunnah After */}
          {prayer.sunnahAfter !== undefined && prayer.sunnahAfter > 0 && (
            <div className="flex items-center justify-between bg-green-400/10 rounded px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="text-green-400 text-lg">📿</span>
                <span className="text-sm text-slate-300">Sunnah After</span>
              </div>
              <span className="text-green-400 font-bold">{prayer.sunnahAfter} Rak'ah</span>
            </div>
          )}

          {/* Witr (for Isha) */}
          {prayer.witr !== undefined && prayer.witr > 0 && (
            <div className="flex items-center justify-between bg-purple-400/10 rounded px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="text-purple-400 text-lg">🌙</span>
                <span className="text-sm text-slate-300">Witr</span>
              </div>
              <span className="text-purple-400 font-bold">{prayer.witr} Rak'ah</span>
            </div>
          )}

          {/* Optional (Nafl) - for backward compatibility */}
          {prayer.rakahOptional !== undefined && prayer.rakahOptional > 0 && (
            <div className="flex items-center justify-between bg-blue-400/10 rounded px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="text-blue-400 text-lg">🤲</span>
                <span className="text-sm text-slate-300">Optional</span>
              </div>
              <span className="text-blue-400 font-bold">{prayer.rakahOptional} Rak'ah</span>
            </div>
          )}
        </div>
      )}

      {/* Calculation Method */}
      <div className="pt-3 border-t border-slate-600">
        <p className="text-xs text-slate-400 mb-1">Calculation Method:</p>
        <p className="text-sm text-slate-300 font-medium">
          {formatCalculationMethod(prayer.calculationMethod)}
        </p>
      </div>
    </div>
  );
};

export default PrayerTimeCard;
