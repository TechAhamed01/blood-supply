import React, { useState } from 'react';
import { Cog6ToothIcon, BellIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { useAlert } from '../../contexts/AlertContext';

const Settings = () => {
  const { success } = useAlert();
  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(false);

  const handleSave = () => {
    success('Settings saved successfully');
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center space-x-4 mb-6 pt-4">
            <Cog6ToothIcon className="h-16 w-16 text-primary-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-500">Configure your preferences</p>
            </div>
          </div>
          
          <div className="border-t border-gray-100 pt-6 space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <BellIcon className="h-5 w-5 mr-2 text-gray-500" /> Notifications
</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Push Notifications</p>
                    <p className="text-xs text-gray-500">Receive alerts via push notifications</p>
                  </div>
                  <button 
                    onClick={() => setNotifications(!notifications)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${notifications ? 'bg-primary-600' : 'bg-gray-200'}`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${notifications ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Email Alerts</p>
                    <p className="text-xs text-gray-500">Receive daily summary emails</p>
                  </div>
                  <button 
                    onClick={() => setEmailAlerts(!emailAlerts)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${emailAlerts ? 'bg-primary-600' : 'bg-gray-200'}`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${emailAlerts ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <ShieldCheckIcon className="h-5 w-5 mr-2 text-gray-500" /> Security
              </h3>
              <button className="text-primary-600 text-sm font-medium hover:text-primary-700">
                Change Password
              </button>
            </div>
            
            <div className="flex justify-end pt-6">
              <button
                onClick={handleSave}
                className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition shadow-md"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;