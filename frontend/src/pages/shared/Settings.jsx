import React from 'react';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';

const Settings = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center space-x-4 mb-6">
            <Cog6ToothIcon className="h-16 w-16 text-primary-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-500">Configure your preferences</p>
            </div>
          </div>
          
          <div className="border-t pt-6">
            <p className="text-gray-700">Settings page coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;