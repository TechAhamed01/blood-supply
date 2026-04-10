import React from 'react';

const Loader = ({ fullScreen = true }) => {
  if (!fullScreen) {
    return (
      <div className="flex w-full items-center justify-center p-8 animate-pulse">
        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-50 flex items-center justify-center z-50">
      <div className="flex flex-col items-center">
        <div className="relative">
          <div className="h-24 w-24 rounded-full border-t-4 border-b-4 border-primary-500 animate-spin opacity-80"></div>
          <div className="absolute inset-0 flex items-center justify-center animate-pulse">
            <span className="text-3xl filter drop-shadow-md">🩸</span>
          </div>
        </div>
        <div className="mt-8 space-y-3 w-64 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-DEFAULT"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6 mx-auto"></div>
        </div>
      </div>
    </div>
  );
};

export default Loader;