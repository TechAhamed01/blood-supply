import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAlert } from '../../contexts/AlertContext';
import allocationService from '../../services/allocation.service';
import Loader from '../../components/common/Loader';
import { formatDateTime } from '../../utils/helpers';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const RequestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { error } = useAlert();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequest();
  }, [id]);

  const fetchRequest = async () => {
    try {
      setLoading(true);
      const data = await allocationService.getRequestById(id);
      setRequest(data);
    } catch (err) {
      error('Failed to load request details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'PENDING': 'badge-warning',
      'PARTIALLY_FULFILLED': 'badge-info',
      'FULFILLED': 'badge-success',
      'CANCELLED': 'badge-danger'
    };
    return statusMap[status] || 'badge-info';
  };

  if (loading) return <Loader />;
  if (!request) return null;

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back
        </button>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-6">
            <h1 className="text-2xl font-bold text-white">Request Details</h1>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-sm text-gray-500">Request ID</p>
                <p className="text-lg font-semibold text-gray-900">{request.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span className={getStatusBadge(request.status)}>{request.status}</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Blood Group</p>
                <p className="text-lg font-semibold text-gray-900">{request.blood_group}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Requested Units</p>
                <p className="text-lg font-semibold text-gray-900">{request.units_requested}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Allocated Units</p>
                <p className="text-lg font-semibold text-gray-900">{request.units_allocated}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Emergency</p>
                <p className="text-lg font-semibold text-gray-900">
                  {request.emergency_flag ? 'Yes' : 'No'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Requested At</p>
                <p className="text-lg font-semibold text-gray-900">{formatDateTime(request.requested_at)}</p>
              </div>
              {request.allocated_at && (
                <div>
                  <p className="text-sm text-gray-500">Allocated At</p>
                  <p className="text-lg font-semibold text-gray-900">{formatDateTime(request.allocated_at)}</p>
                </div>
              )}
            </div>

            {request.notes && (
              <div className="mt-6">
                <p className="text-sm text-gray-500 mb-2">Notes</p>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{request.notes}</p>
              </div>
            )}

            {request.items && request.items.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Allocation Details</h3>
                <div className="bg-gray-50 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Blood Bank</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Units</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Distance</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Est. Delivery</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {request.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-2 text-sm text-gray-900">{item.bloodbank_name}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{item.units_taken}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{item.distance_km} km</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{item.estimated_delivery_min} min</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestDetail;