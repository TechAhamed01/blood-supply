import React, { useState, useEffect } from 'react';
import { useAlert } from '../../contexts/AlertContext';
import hospitalService from '../../services/hospital.service';
import HospitalCard from '../../components/cards/HospitalCard';
import Loader from '../../components/common/Loader';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const AllHospitals = () => {
  const [hospitals, setHospitals] = useState([]);
  const [filteredHospitals, setFilteredHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { error } = useAlert();

  useEffect(() => {
    fetchHospitals();
  }, []);

  useEffect(() => {
    if (Array.isArray(hospitals)) {
      const filtered = hospitals.filter(h => 
        h?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h?.city?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredHospitals(filtered);
    } else {
      setFilteredHospitals([]);
    }
  }, [searchTerm, hospitals]);

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const data = await hospitalService.getAllHospitals();
      console.log('Processed hospitals data:', data);
      
      // Ensure data is an array
      if (Array.isArray(data)) {
        setHospitals(data);
        setFilteredHospitals(data);
      } else {
        console.error('Expected array but got:', data);
        setHospitals([]);
        setFilteredHospitals([]);
        error('Invalid data format received from server');
      }
    } catch (err) {
      console.error('Failed to load hospitals:', err);
      error('Failed to load hospitals');
      setHospitals([]);
      setFilteredHospitals([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">All Hospitals</h1>
          <p className="text-gray-600 mt-2">Manage and view all registered hospitals</p>
        </div>

        {/* Search Bar */}
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

        {/* Hospitals Grid */}
        {Array.isArray(filteredHospitals) && filteredHospitals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHospitals.map((hospital) => (
              <HospitalCard key={hospital?.hospital_id || Math.random()} hospital={hospital} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <p className="text-gray-500 text-lg">
              {searchTerm ? 'No hospitals match your search' : 'No hospitals found'}
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

export default AllHospitals;