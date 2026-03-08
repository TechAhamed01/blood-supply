import React from 'react';
import { Link } from 'react-router-dom';
import { BuildingLibraryIcon, MapPinIcon, PhoneIcon, ServerStackIcon } from '@heroicons/react/24/outline';

const BloodBankCard = ({ bloodbank }) => {
  const statusColor = bloodbank.operational_status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';

  return (
    <Link to={`/admin/bloodbanks/${bloodbank.bloodbank_id}`}>
      <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        <div className="flex items-center mb-4">
          <div className="bg-blood-light p-3 rounded-lg">
            <BuildingLibraryIcon className="h-6 w-6 text-blood" />
          </div>
          <div className="ml-4 flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{bloodbank.name}</h3>
            <span className={`text-xs px-2 py-1 rounded-full ${statusColor}`}>
              {bloodbank.operational_status}
            </span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center text-gray-600">
            <MapPinIcon className="h-4 w-4 mr-2" />
            <span className="text-sm">{bloodbank.city}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <PhoneIcon className="h-4 w-4 mr-2" />
            <span className="text-sm">{bloodbank.contact}</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ServerStackIcon className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-sm text-gray-600">Storage Capacity</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">{bloodbank.storage_capacity} units</span>
          </div>
          {bloodbank.component_separation_available && (
            <p className="text-xs text-green-600 mt-2">✓ Component Separation Available</p>
          )}
        </div>
      </div>
    </Link>
  );
};

export default BloodBankCard;