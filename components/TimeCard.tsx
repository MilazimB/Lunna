import React from 'react';

interface TimeCardProps {
  icon: React.ReactNode;
  title: string;
  time: string;
}

const TimeCard: React.FC<TimeCardProps> = ({ icon, title, time }) => {
  return (
    <div className="bg-card-bg/70 rounded-lg p-4 flex flex-col items-center justify-center text-center">
      <div className="mb-2">{icon}</div>
      <p className="text-sm font-semibold text-slate-300">{title}</p>
      <p className="text-lg font-mono text-moonlight mt-1">{time}</p>
    </div>
  );
};

export default TimeCard;
