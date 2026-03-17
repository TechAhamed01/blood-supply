import React, { useEffect, useState } from 'react';
import donorService from '../../services/donor.service';
import Loader from '../../components/common/Loader';
import { MapPinIcon, PhoneIcon } from '@heroicons/react/24/outline';

const NearbyBloodBanks = () => {
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBanks();
  }, []);

  const fetchBanks = async () => {
    try {
      const data = await donorService.getNearbyBanks();
      setBanks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-10">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">Blood Banks in Your City</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {banks.map(bank => (
            <div key={bank.bloodbank_id} className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-lg mb-2">{bank.name}</h3>
              <p className="text-gray-600 flex items-center mb-1">
                <MapPinIcon className="h-4 w-4 mr-2" /> {bank.address}, {bank.city}
              </p>
              <p className="text-gray-600 flex items-center">
                <PhoneIcon className="h-4 w-4 mr-2" /> {bank.contact}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NearbyBloodBanks;