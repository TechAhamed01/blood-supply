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

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await allocationService.getHospitalRequests();
      
      if (Array.isArray(data)) {
        setRequests(data);
      } else {
        setRequests([]);
        setError('Invalid data format received from server');
      }
    } catch (err) {
      setError(err.message || 'Failed to load requests');
      showError('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'PARTIALLY_FULFILLED': 'bg-blue-100 text-blue-800',
      'FULFILLED': 'bg-green-100 text-green-800',
      'CANCELLED': 'bg-red-100 text-red-800'
    };
    return `px-2 py-1 rounded-full text-xs font-semibold ${statusMap[status] || 'bg-gray-100 text-gray-800'}`;
  };

  const filteredRequests = requests.filter(req => {
    const matchesSearch = 
      req.blood_group.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (req.id && req.id.toString().includes(searchTerm));
    const matchesStatus = statusFilter === 'ALL' || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex space-x-4">
              <input
                type="text"
                placeholder="Search by ID or Blood Group..."
                className="w-full max-w-sm rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-white p-2 border"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select
                className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-white p-2 border"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="PARTIALLY_FULFILLED">Partially Fulfilled</option>
                <option value="FULFILLED">Fulfilled</option>
              </select>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blood Group</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Allocated</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.map((req) => (
                  <tr key={`request-${req.id}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{req.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{req.blood_group}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.units_requested}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.units_allocated}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadge(req.status)}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(req.requested_at)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        to={`/hospital/requests/${req.id}`}
                        className="text-primary-600 hover:text-primary-800"
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