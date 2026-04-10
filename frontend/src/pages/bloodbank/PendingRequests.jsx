import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAlert } from '../../contexts/AlertContext';
import allocationService from '../../services/allocation.service';
import Loader from '../../components/common/Loader';
import { MapPinIcon, ClockIcon } from '@heroicons/react/24/outline';

const PendingRequests = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGroup, setFilterGroup] = useState('All');
  const { error } = useAlert();
  
  const bloodGroups = ['All', 'O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    let result = requests;
    
    if (searchTerm) {
      result = result.filter(req => 
        (req.hospital_name && req.hospital_name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    if (filterGroup !== 'All') {
      result = result.filter(req => req.blood_group === filterGroup);
    }
    
    setFilteredRequests(result);
  }, [requests, searchTerm, filterGroup]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await allocationService.getPendingRequests();
      console.log('Pending requests:', data);
      setRequests(Array.isArray(data) ? data : []);
      setFilteredRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load pending requests:', err);
      error('Failed to load pending requests');
      setRequests([]);
      setFilteredRequests([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pending Blood Requests</h1>
            <p className="text-gray-600 mt-2">
              Showing requests from hospitals where you are among the top 3 nearest blood banks
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <input
              type="text"
              placeholder="Search hospital..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            />
            <select
              value={filterGroup}
              onChange={(e) => setFilterGroup(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-white"
            >
              {bloodGroups.map(bg => (
                <option key={bg} value={bg}>{bg === 'All' ? 'All Groups' : bg}</option>
              ))}
            </select>
          </div>
        </div>

        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="flex justify-center mb-4">
              <MapPinIcon className="h-16 w-16 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg mb-2">No pending requests in your service area</p>
            <p className="text-gray-400 text-sm">
              You'll see requests here when hospitals within your proximity need blood
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRequests.map((req) => (
              <div key={req.id} className={`bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition border-l-4 ${req.is_emergency_broadcast ? 'border-red-600' : 'border-primary-500'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{req.hospital_name}</h3>
                    <p className="text-sm text-gray-500">{req.hospital?.city || 'Unknown'}</p>
                  </div>
                  {req.is_emergency_broadcast ? (
                    <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-full animate-pulse tracking-wide shadow-sm">
                      BROADCAST ALERT
                    </span>
                  ) : req.emergency_flag ? (
                    <span className="bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded-full">
                      Emergency
                    </span>
                  ) : null}
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Blood Group:</span>
                    <span className="text-lg font-bold text-gray-900">{req.blood_group}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Units Needed:</span>
                    <span className="text-lg font-bold text-primary-600">
                      {req.units_requested - req.units_allocated} / {req.units_requested}
                    </span>
                  </div>
                  {req.distance && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPinIcon className="h-4 w-4 mr-1 text-primary-500" />
                      <span>{req.distance} km away (estimated)</span>
                    </div>
                  )}
                  <div className="flex items-center text-sm text-gray-600">
                    <ClockIcon className="h-4 w-4 mr-1 text-primary-500" />
                    <span>Requested {new Date(req.requested_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <Link
                  to={`/bloodbank/requests/${req.id}`}
                  className="block w-full text-center btn-primary"
                >
                  View & Fulfill Request
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingRequests;