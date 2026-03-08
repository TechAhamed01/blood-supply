import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAlert } from '../../contexts/AlertContext';
import allocationService from '../../services/allocation.service';
import Loader from '../../components/common/Loader';

const FulfillRequest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { error, success } = useAlert();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fulfilling, setFulfilling] = useState(false);

  useEffect(() => {
    fetchRequest();
  }, [id]);

  const fetchRequest = async () => {
    try {
      setLoading(true);
      const data = await allocationService.getRequestById(id);
      setRequest(data);
    } catch (err) {
      error('Failed to load request');
    } finally {
      setLoading(false);
    }
  };

  const handleFulfill = async () => {
    try {
      setFulfilling(true);
      await allocationService.fulfillRequest(id);
      success('Request fulfilled successfully');
      navigate('/bloodbank/pending-requests');
    } catch (err) {
      error('Failed to fulfill request');
    } finally {
      setFulfilling(false);
    }
  };

  if (loading) return <Loader />;
  if (!request) return null;

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-6">
            <h1 className="text-2xl font-bold text-white">Fulfill Blood Request</h1>
          </div>

          <div className="p-8">
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Hospital</p>
                  <p className="text-lg font-semibold text-gray-900">{request.hospital_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Blood Group</p>
                  <p className="text-lg font-semibold text-gray-900">{request.blood_group}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Units Requested</p>
                  <p className="text-lg font-semibold text-gray-900">{request.units_requested}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Emergency</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {request.emergency_flag ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>
            </div>

            {request.notes && (
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-2">Additional Notes</p>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{request.notes}</p>
              </div>
            )}

            <div className="flex space-x-4">
              <button
                onClick={handleFulfill}
                disabled={fulfilling || request.status !== 'PENDING'}
                className="flex-1 btn-primary disabled:opacity-50"
              >
                {fulfilling ? 'Fulfilling...' : 'Fulfill Request'}
              </button>
              <button
                onClick={() => navigate(-1)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>

            {request.status !== 'PENDING' && (
              <p className="text-center text-yellow-600 mt-4">
                This request is already {request.status.toLowerCase()}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FulfillRequest;