import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAlert } from '../../contexts/AlertContext';
import allocationService from '../../services/allocation.service';
import Loader from '../../components/common/Loader';
import { formatDate } from '../../utils/helpers';

const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { error: showError } = useAlert();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await allocationService.getHospitalRequests();
      console.log('Processed requests data:', data); // Debug log
      
      // Ensure we have an array
      if (Array.isArray(data)) {
        setRequests(data);
      } else {
        console.error('Expected array but got:', data);
        setRequests([]);
        setError('Invalid data format received from server');
      }
    } catch (err) {
      console.error('Failed to load requests:', err);
      setError(err.message || 'Failed to load requests');
      showError('Failed to load requests');
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

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Blood Requests</h1>
            <p className="text-gray-600 mt-2">Track your blood allocation requests</p>
          </div>
          <Link
            to="/hospital/request-blood"
            className="btn-primary"
          >
            New Request
          </Link>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <p className="text-red-600 text-lg mb-4">{error}</p>
            <button
              onClick={fetchRequests}
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <p className="text-gray-500 text-lg mb-4">No requests yet</p>
            <Link 
              to="/hospital/request-blood" 
              className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center"
            >
              Create your first request →
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="table-header">Blood Group</th>
                  <th className="table-header">Requested Units</th>
                  <th className="table-header">Allocated Units</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Date</th>
                  <th className="table-header">Emergency</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.map((req) => (
                  <tr key={`request-${req.id}`} className="hover:bg-gray-50">
                    <td className="table-cell font-medium">{req.blood_group}</td>
                    <td className="table-cell">{req.units_requested}</td>
                    <td className="table-cell">{req.units_allocated}</td>
                    <td className="table-cell">
                      <span className={getStatusBadge(req.status)}>
                        {req.status}
                      </span>
                    </td>
                    <td className="table-cell">{formatDate(req.requested_at)}</td>
                    <td className="table-cell">
                      {req.emergency_flag ? (
                        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">Emergency</span>
                      ) : 'No'}
                    </td>
                    <td className="table-cell">
                      <Link
                        to={`/hospital/requests/${req.id}`}
                        className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Add pagination if needed */}
            {requests.length > 0 && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Showing {requests.length} requests
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRequests;