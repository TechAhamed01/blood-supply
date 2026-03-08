import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAlert } from '../../contexts/AlertContext';
import allocationService from '../../services/allocation.service';
import Loader from '../../components/common/Loader';
import { formatDate } from '../../utils/helpers';

const Allocations = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { error } = useAlert();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await allocationService.getAllRequests();
      setRequests(data);
    } catch (err) {
      error('Failed to load allocation requests');
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requests.filter(req => {
    if (filter === 'all') return true;
    return req.status === filter.toUpperCase();
  });

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Allocation Requests</h1>
          <p className="text-gray-600 mt-2">Monitor all blood allocation requests</p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex space-x-2">
          {['all', 'pending', 'fulfilled', 'cancelled'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === f
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Requests Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="table-header">Hospital</th>
                <th className="table-header">Blood Group</th>
                <th className="table-header">Requested</th>
                <th className="table-header">Allocated</th>
                <th className="table-header">Status</th>
                <th className="table-header">Date</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRequests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50">
                  <td className="table-cell font-medium">{req.hospital_name}</td>
                  <td className="table-cell">{req.blood_group}</td>
                  <td className="table-cell">{req.units_requested}</td>
                  <td className="table-cell">{req.units_allocated}</td>
                  <td className="table-cell">
                    <span className={getStatusBadge(req.status)}>
                      {req.status}
                    </span>
                  </td>
                  <td className="table-cell">{formatDate(req.requested_at)}</td>
                  <td className="table-cell">
                    <Link
                      to={`/admin/allocations/${req.id}`}
                      className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Allocations;