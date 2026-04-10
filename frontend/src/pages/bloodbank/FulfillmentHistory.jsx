import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAlert } from '../../contexts/AlertContext';
import allocationService from '../../services/allocation.service';
import Loader from '../../components/common/Loader';
import { ArchiveBoxIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const FulfillmentHistory = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { error } = useAlert();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      // Get all requests and filter them here, as backend returns contributed ones
      const data = await allocationService.getAllRequests({ bloodbank_id: user.bloodbankId });
      
      // Filter for requests that have been FULFILLED and where this bloodbank contributed items
      const fulfilled = data.filter(req => 
        (req.status === 'FULFILLED' || req.status === 'PARTIALLY_FULFILLED') && 
        req.items && req.items.some(item => item.bloodbank_id.toString() === user.bloodbankId.toString())
      );
      
      setHistory(fulfilled);
    } catch (err) {
      console.error('Failed to load fulfillment history:', err);
      // error('Failed to load fulfillment history');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Fulfillment History</h1>
          <p className="text-gray-600 mt-2">
            Log of all hospital blood requests your blood bank has successfully contributed to.
          </p>
        </div>

        {history.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="flex justify-center mb-4">
              <ArchiveBoxIcon className="h-16 w-16 text-gray-300" />
            </div>
            <p className="text-gray-500 text-lg mb-2">No fulfillment history found</p>
            <p className="text-gray-400 text-sm">
              Requests you fulfill will appear here after completion.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {history.map((req) => {
              // Calculate how many units this specific bank provided
              const myContribution = req.items
                .filter(i => i.bloodbank_id.toString() === user.bloodbankId.toString())
                .reduce((sum, item) => sum + item.units_taken, 0);

              return (
                <div key={req.id} className="bg-white rounded-xl shadow p-6 flex flex-col md:flex-row justify-between items-center border border-gray-100 hover:shadow-md transition">
                  <div className="flex items-center space-x-4 mb-4 md:mb-0">
                    <div className="bg-green-100 p-3 rounded-full">
                      <CheckCircleIcon className="h-8 w-8 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{req.hospital_name}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(req.allocated_at || req.requested_at).toLocaleDateString()} at {new Date(req.allocated_at || req.requested_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:space-x-8 items-center space-y-4 sm:space-y-0 w-full md:w-auto">
                    <div className="text-center">
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Blood Group</p>
                      <p className="text-xl font-bold text-red-600">{req.blood_group}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Your Contribution</p>
                      <p className="text-xl font-bold text-green-600">{myContribution} Units</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Total Request</p>
                      <p className="text-lg font-semibold text-gray-800">{req.units_requested} Units</p>
                    </div>
                    <div className="text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${req.status === 'FULFILLED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {req.status}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FulfillmentHistory;
