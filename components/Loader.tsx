import React from 'react';

interface LoaderProps {
    message?: string;
}

const Loader: React.FC<LoaderProps> = ({ message = "Calculating Phases..." }) => {
  return (
    <div className="flex justify-center items-center py-16">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-accent-blue"></div>
      <span className="ml-4 text-lg text-slate-300">{message}</span>
    </div>
  );
};

export default Loader;