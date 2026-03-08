import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useAlert } from '../../contexts/AlertContext';
import bloodbankService from '../../services/bloodbank.service';
import Loader from '../../components/common/Loader';
import { BuildingLibraryIcon, MapPinIcon, PhoneIcon, ServerStackIcon } from '@heroicons/react/24/outline';

const BloodBankProfile = () => {
  const { user } = useAuth();
  const { error } = useAlert();
  const [bloodbank, setBloodbank] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await bloodbankService.getBloodBankById(user.bloodbankId);
      setBloodbank(data);
    } catch (err) {
      error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;
  if (!bloodbank) return null;

  const statusColor = bloodbank.operational_status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blood to-blood-dark px-8 py-12">
            <h1 className="text-3xl font-bold text-white">{bloodbank.name}</h1>
            <p className="text-blood-light mt-2">Blood Bank Profile</p>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-blood-light p-2 rounded-lg">
                    <BuildingLibraryIcon className="h-5 w-5 text-blood" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Blood Bank ID</p>
                    <p className="text-lg font-semibold text-gray-900">{bloodbank.bloodbank_id}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="bg-blood-light p-2 rounded-lg">
                    <MapPinIcon className="h-5 w-5 text-blood" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="text-lg font-semibold text-gray-900">{bloodbank.city}</p>
                    <p className="text-sm text-gray-600">{bloodbank.address}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="bg-blood-light p-2 rounded-lg">
                    <PhoneIcon className="h-5 w-5 text-blood" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Contact</p>
                    <p className="text-lg font-semibold text-gray-900">{bloodbank.contact}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-blood-light p-2 rounded-lg">
                    <ServerStackIcon className="h-5 w-5 text-blood" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Storage Capacity</p>
                    <p className="text-lg font-semibold text-gray-900">{bloodbank.storage_capacity} units</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-2">Status</p>
                  <span className={`text-sm px-3 py-1 rounded-full ${statusColor}`}>
                    {bloodbank.operational_status}
                  </span>
                </div>

                {bloodbank.component_separation_available && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-700">✓ Component Separation Available</p>
                  </div>
                )}

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-2">Coordinates</p>
                  <p className="text-sm text-gray-700">Latitude: {bloodbank.latitude}</p>
                  <p className="text-sm text-gray-700">Longitude: {bloodbank.longitude}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BloodBankProfile;