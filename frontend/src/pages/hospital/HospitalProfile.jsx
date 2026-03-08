import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useAlert } from '../../contexts/AlertContext';
import hospitalService from '../../services/hospital.service';
import Loader from '../../components/common/Loader';
import { BuildingOfficeIcon, MapPinIcon, PhoneIcon, ServerStackIcon } from '@heroicons/react/24/outline';

const HospitalProfile = () => {
  const { user } = useAuth();
  const { error } = useAlert();
  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await hospitalService.getHospitalById(user.hospitalId);
      setHospital(data);
    } catch (err) {
      error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;
  if (!hospital) return null;

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-12">
            <h1 className="text-3xl font-bold text-white">{hospital.name}</h1>
            <p className="text-primary-100 mt-2">Hospital Profile</p>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-primary-100 p-2 rounded-lg">
                    <BuildingOfficeIcon className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Hospital ID</p>
                    <p className="text-lg font-semibold text-gray-900">{hospital.hospital_id}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="bg-primary-100 p-2 rounded-lg">
                    <MapPinIcon className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="text-lg font-semibold text-gray-900">{hospital.city}</p>
                    <p className="text-sm text-gray-600">{hospital.address}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="bg-primary-100 p-2 rounded-lg">
                    <PhoneIcon className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Contact</p>
                    <p className="text-lg font-semibold text-gray-900">{hospital.contact}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-primary-100 p-2 rounded-lg">
                    <ServerStackIcon className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Bed Capacity</p>
                    <p className="text-lg font-semibold text-gray-900">{hospital.capacity} beds</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-2">Operational Stats</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-400">Avg Daily Surgeries</p>
                      <p className="text-xl font-bold text-gray-900">{hospital.avg_daily_surgeries}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Emergency Cases/Day</p>
                      <p className="text-xl font-bold text-gray-900">{hospital.emergency_cases_per_day}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-2">Coordinates</p>
                  <p className="text-sm text-gray-700">Latitude: {hospital.latitude}</p>
                  <p className="text-sm text-gray-700">Longitude: {hospital.longitude}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalProfile;