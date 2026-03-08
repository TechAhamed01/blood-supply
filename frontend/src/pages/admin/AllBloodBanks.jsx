import React, { useState, useEffect } from 'react';
import { useAlert } from '../../contexts/AlertContext';
import bloodbankService from '../../services/bloodbank.service';
import BloodBankCard from '../../components/cards/BloodBankCard';
import Loader from '../../components/common/Loader';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const AllBloodBanks = () => {
  const [bloodbanks, setBloodbanks] = useState([]);
  const [filteredBloodbanks, setFilteredBloodbanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { error } = useAlert();

  useEffect(() => {
    fetchBloodBanks();
  }, []);

  useEffect(() => {
    if (Array.isArray(bloodbanks)) {
      const filtered = bloodbanks.filter(b => 
        b?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b?.city?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredBloodbanks(filtered);
    } else {
      setFilteredBloodbanks([]);
    }
  }, [searchTerm, bloodbanks]);

  const fetchBloodBanks = async () => {
    try {
      setLoading(true);
      const data = await bloodbankService.getAllBloodBanks();
      console.log('Processed bloodbanks data:', data);
      
      if (Array.isArray(data)) {
        setBloodbanks(data);
        setFilteredBloodbanks(data);
      } else {
        console.error('Expected array but got:', data);
        setBloodbanks([]);
        setFilteredBloodbanks([]);
        error('Invalid data format received from server');
      }
    } catch (err) {
      console.error('Failed to load blood banks:', err);
      error('Failed to load blood banks');
      setBloodbanks([]);
      setFilteredBloodbanks([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">All Blood Banks</h1>
          <p className="text-gray-600 mt-2">Manage and view all registered blood banks</p>
        </div>

        <div className="mb-6 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>

        {Array.isArray(filteredBloodbanks) && filteredBloodbanks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBloodbanks.map((bloodbank) => (
              <BloodBankCard key={bloodbank?.bloodbank_id || Math.random()} bloodbank={bloodbank} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <p className="text-gray-500 text-lg">
              {searchTerm ? 'No blood banks match your search' : 'No blood banks found'}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-4 text-primary-600 hover:text-primary-700"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllBloodBanks;