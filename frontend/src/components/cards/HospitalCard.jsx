import React from 'react';
import { Link } from 'react-router-dom';
import { BuildingOfficeIcon, MapPinIcon, PhoneIcon } from '@heroicons/react/24/outline';

const HospitalCard = ({ hospital }) => {
  return (
    <Link to={`/admin/hospitals/${hospital.hospital_id}`}>
      <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        <div className="flex items-center mb-4">
          <div className="bg-primary-100 p-3 rounded-lg">
            <BuildingOfficeIcon className="h-6 w-6 text-primary-600" />
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-gray-900">{hospital.name}</h3>
            <p className="text-sm text-gray-500">ID: {hospital.hospital_id}</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center text-gray-600">
            <MapPinIcon className="h-4 w-4 mr-2" />
            <span className="text-sm">{hospital.city}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <PhoneIcon className="h-4 w-4 mr-2" />
            <span className="text-sm">{hospital.contact}</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-2">
          <div className="text-center">
            <p className="text-xs text-gray-500">Capacity</p>
            <p className="text-sm font-semibold text-gray-900">{hospital.capacity} beds</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Surgeries/day</p>
            <p className="text-sm font-semibold text-gray-900">{hospital.avg_daily_surgeries}</p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default HospitalCard;