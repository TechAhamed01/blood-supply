import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAlert } from '../../contexts/AlertContext';
import allocationService from '../../services/allocation.service';
import Loader from '../../components/common/Loader';
import { formatDateTime } from '../../utils/helpers';
import { 
  ArrowLeftIcon, 
  MapPinIcon, 
  ClockIcon, 
  PhoneIcon,
  BuildingLibraryIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

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
      console.log('Request details with assigned banks:', data);
      setRequest(data);
    } catch (err) {
      error('Failed to load request details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'PENDING': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'PARTIALLY_FULFILLED': 'bg-blue-100 text-blue-800 border-blue-200',
      'FULFILLED': 'bg-green-100 text-green-800 border-green-200',
      'CANCELLED': 'bg-red-100 text-red-800 border-red-200'
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getPriorityIcon = (priority) => {
    switch(priority) {
      case 'primary':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'secondary':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'backup':
        return <ExclamationCircleIcon className="h-5 w-5 text-orange-500" />;
      default:
        return <BuildingLibraryIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getPriorityText = (priority) => {
    switch(priority) {
      case 'primary':
        return 'Primary - Will fulfill first';
      case 'secondary':
        return 'Secondary - Backup if needed';
      case 'backup':
        return 'Backup - Emergency only';
      default:
        return 'Assigned';
    }
  };

  if (loading) return <Loader />;
  if (!request) return null;

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition group"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition" />
          Back to Requests
        </button>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-white">Blood Request Details</h1>
                <p className="text-primary-100 mt-1">ID: {request.id}</p>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusBadge(request.status)}`}>
                {request.status}
              </span>
            </div>
          </div>

          <div className="p-8">
            {/* Request Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-1">Blood Group</p>
                <p className="text-2xl font-bold text-gray-900">{request.blood_group}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-1">Requested Units</p>
                <p className="text-2xl font-bold text-gray-900">{request.units_requested}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-1">Allocated Units</p>
                <p className="text-2xl font-bold text-green-600">{request.units_allocated}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-1">Emergency</p>
                <p className="text-2xl font-bold text-gray-900">
                  {request.emergency_flag ? (
                    <span className="text-red-600">Yes</span>
                  ) : 'No'}
                </p>
              </div>
            </div>

            {/* Timestamps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="text-xs text-gray-500">Requested At</p>
                <p className="text-sm font-medium text-gray-900">{formatDateTime(request.requested_at)}</p>
              </div>
              {request.allocated_at && (
                <div>
                  <p className="text-xs text-gray-500">Allocated At</p>
                  <p className="text-sm font-medium text-gray-900">{formatDateTime(request.allocated_at)}</p>
                </div>
              )}
            </div>

            {/* Notes */}
            {request.notes && (
              <div className="mb-8 p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 mb-2">Additional Notes</p>
                <p className="text-gray-700">{request.notes}</p>
              </div>
            )}

            {/* Assigned Blood Banks Section - NEW */}
            {request.assigned_banks && request.assigned_banks.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <BuildingLibraryIcon className="h-6 w-6 mr-2 text-primary-600" />
                  Assigned Blood Banks
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  These blood banks have been notified and can fulfill your request
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {request.assigned_banks.map((bank, index) => (
                    <div
                      key={bank.bloodbank_id}
                      className={`relative rounded-xl border-2 p-5 transition-all hover:shadow-lg ${
                        bank.priority === 'primary' 
                          ? 'border-green-200 bg-green-50' 
                          : bank.priority === 'secondary'
                          ? 'border-yellow-200 bg-yellow-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      {/* Priority Badge */}
                      <div className="absolute -top-3 left-4 px-3 py-1 rounded-full text-xs font-medium bg-white shadow-sm border">
                        <span className="flex items-center">
                          {getPriorityIcon(bank.priority)}
                          <span className="ml-1">
                            {bank.priority === 'primary' && 'Nearest Bank'}
                            {bank.priority === 'secondary' && 'Second Nearest'}
                            {bank.priority === 'backup' && 'Backup Bank'}
                          </span>
                        </span>
                      </div>

                      {/* Bank Info */}
                      <div className="mt-2">
                        <h3 className="font-bold text-gray-900 mb-1">{bank.bloodbank_name}</h3>
                        <p className="text-sm text-gray-600 mb-3">{bank.city}</p>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center text-gray-600">
                            <MapPinIcon className="h-4 w-4 mr-2 text-primary-500" />
                            <span>{bank.distance_km} km away</span>
                          </div>
                          
                          <div className="flex items-center text-gray-600">
                            <ClockIcon className="h-4 w-4 mr-2 text-primary-500" />
                            <span>~{bank.estimated_delivery_min} min delivery</span>
                          </div>
                          
                          <div className="flex items-center text-gray-600">
                            <PhoneIcon className="h-4 w-4 mr-2 text-primary-500" />
                            <span className="text-xs">{bank.contact}</span>
                          </div>
                        </div>

                        {/* Stock Status */}
                        <div className="mt-4 pt-3 border-t border-gray-200">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500">Available Stock</span>
                            <span className={`text-sm font-semibold ${
                              bank.can_fulfill ? 'text-green-600' : 'text-orange-600'
                            }`}>
                              {bank.available_units} units
                            </span>
                          </div>
                          {!bank.can_fulfill && (
                            <p className="text-xs text-orange-600 mt-1">
                              ⚠️ Insufficient stock for full request
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Allocation Details */}
            {request.items && request.items.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Allocation Details</h2>
                <div className="bg-gray-50 rounded-xl overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Blood Bank</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Units</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Distance</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Est. Delivery</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {request.items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-white transition">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {item.bloodbank_name}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">{item.units_taken}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{item.distance_km} km</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{item.estimated_delivery_min} min</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Delivery Timeline UX */}
            {(request.status === 'FULFILLED' || request.status === 'PARTIALLY_FULFILLED') && (
              <div className="mt-8 border-t border-gray-200 pt-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <MapPinIcon className="h-6 w-6 mr-2 text-primary-600" />
                  Delivery Tracking
                </h2>
                <div className="relative pl-8 space-y-8">
                  {/* Vertical Line */}
                  <div className="absolute top-2 bottom-2 left-[15px] border-l-2 border-dashed border-primary-200"></div>
                  
                  {/* Steps */}
                  <div className="relative flex animate-fade-in-up">
                    <div className="absolute -left-[35px] h-8 w-8 bg-primary-100 border-2 border-primary-500 rounded-full flex items-center justify-center animate-pulse shadow-md z-10">
                      <span className="w-2 h-2 bg-primary-600 rounded-full"></span>
                    </div>
                    <div className="bg-white border shadow-sm rounded-xl p-4 w-full ml-2">
                      <h3 className="font-bold text-gray-900">Request Approved & Dispatched</h3>
                      <p className="text-sm text-gray-500 mt-1">{formatDateTime(request.allocated_at)}</p>
                    </div>
                  </div>
                  
                  <div className="relative flex animate-fade-in-up hover:opacity-100" style={{ animationDelay: '0.2s'}}>
                    <div className="absolute -left-[35px] h-8 w-8 bg-gray-50 border-2 border-gray-300 rounded-full flex items-center justify-center z-10"></div>
                    <div className="bg-white border rounded-xl p-4 w-full ml-2 opacity-50 hover:opacity-100 transition">
                      <h3 className="font-bold text-gray-900">In Transit</h3>
                      <p className="text-sm text-gray-500 mt-1">Pending live location updates...</p>
                    </div>
                  </div>

                  <div className="relative flex animate-fade-in-up" style={{ animationDelay: '0.4s'}}>
                    <div className="absolute -left-[35px] h-8 w-8 bg-gray-50 border-2 border-gray-300 rounded-full flex items-center justify-center z-10"></div>
                    <div className="bg-white border rounded-xl p-4 w-full ml-2 opacity-50 hover:opacity-100 transition">
                      <h3 className="font-bold text-gray-900">Arrived at Hospital</h3>
                      <p className="text-sm text-gray-500 mt-1">Expected soon</p>
                    </div>
                  </div>
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