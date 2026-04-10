import React, { useState, useEffect } from 'react';
import { useAlert } from '../../contexts/AlertContext';
import bloodbankDonorService from '../../services/bloodbank-donor.service';
import Loader from '../../components/common/Loader';
import {
  UserGroupIcon,
  BellAlertIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  EnvelopeIcon,
  PhoneIcon,
  CheckCircleIcon,
  XCircleIcon,
  HeartIcon
} from '@heroicons/react/24/outline';

const DonorManagement = () => {
  const [donors, setDonors] = useState([]);
  const [filteredDonors, setFilteredDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('');
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { success, error } = useAlert();

  const bloodGroups = ['O+', 'A+', 'B+', 'O-', 'A-', 'AB+', 'B-', 'AB-'];

  useEffect(() => {
    fetchDonors();
  }, []);

  useEffect(() => {
    // Filter donors based on search term
    const filtered = donors.filter(donor =>
      donor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donor.donor_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donor.blood_group.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donor.phone.includes(searchTerm)
    );
    setFilteredDonors(filtered);
  }, [searchTerm, donors]);

  const fetchDonors = async () => {
    try {
      setLoading(true);
      const data = await bloodbankDonorService.getDonors();
      setDonors(data);
      setFilteredDonors(data);
    } catch (err) {
      console.error('Failed to load donors:', err);
      error('Failed to load donors');
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotification = async () => {
    try {
      setSending(true);
      await bloodbankDonorService.sendNotification({
        blood_group: selectedBloodGroup || null,
        message: message || 'Urgent blood needed in your area!'
      });
      success('Notifications sent successfully');
      setMessage('');
      setSelectedBloodGroup('');
    } catch (err) {
      console.error('Failed to send notifications:', err);
      error('Failed to send notifications');
    } finally {
      setSending(false);
    }
  };

  const getBloodGroupColor = (bg) => {
    const colors = {
      'O+': 'bg-red-100 text-red-800',
      'O-': 'bg-pink-100 text-pink-800',
      'A+': 'bg-blue-100 text-blue-800',
      'A-': 'bg-indigo-100 text-indigo-800',
      'B+': 'bg-green-100 text-green-800',
      'B-': 'bg-emerald-100 text-emerald-800',
      'AB+': 'bg-purple-100 text-purple-800',
      'AB-': 'bg-violet-100 text-violet-800',
    };
    return colors[bg] || 'bg-gray-100 text-gray-800';
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-primary-500 rounded-xl blur-md opacity-30 animate-pulse"></div>
              <div className="relative bg-white rounded-xl p-3 shadow-lg">
                <UserGroupIcon className="h-8 w-8 text-red-500" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Donor Management
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Manage and communicate with all donors in your area
              </p>
            </div>
          </div>
          <button
            onClick={fetchDonors}
            className="mt-4 md:mt-0 flex items-center px-4 py-2 bg-white text-gray-600 rounded-lg hover:bg-gray-50 transition-all shadow-sm border border-gray-200"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-red-500">
            <p className="text-sm text-gray-500 mb-1">Total Donors</p>
            <p className="text-2xl font-bold text-gray-900">{donors.length}</p>
            <p className="text-xs text-green-600 mt-1">{donors.filter(d => d.eligibility_status === 'Eligible Now').length} Ready to donate</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-blue-500">
            <p className="text-sm text-gray-500 mb-1">Blood Groups Available</p>
            <p className="text-2xl font-bold text-gray-900">
              {new Set(donors.map(d => d.blood_group)).size}
            </p>
            <p className="text-xs text-blue-600 mt-1">Different types</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-green-500">
            <p className="text-sm text-gray-500 mb-1">O+ Donors</p>
            <p className="text-2xl font-bold text-gray-900">
              {donors.filter(d => d.blood_group === 'O+').length}
            </p>
            <p className="text-xs text-green-600 mt-1">Most common type</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-purple-500">
            <p className="text-sm text-gray-500 mb-1">Last Updated</p>
            <p className="text-2xl font-bold text-gray-900">
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
            <p className="text-xs text-purple-600 mt-1">Today</p>
          </div>
        </div>

        {/* Notification Sender Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex items-center mb-4">
            <div className="bg-red-100 p-2 rounded-lg mr-3">
              <BellAlertIcon className="h-5 w-5 text-red-500" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Send Notification to Eligible Donors</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Blood Group (optional)
              </label>
              <div className="relative">
                <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={selectedBloodGroup}
                  onChange={(e) => setSelectedBloodGroup(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-sm"
                >
                  <option value="">All Blood Groups</option>
                  {bloodGroups.map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Notification Message
              </label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter your message here..."
                  className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSendNotification}
              disabled={sending}
              className="flex items-center px-6 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-medium hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </>
              ) : (
                <>
                  <BellAlertIcon className="h-4 w-4 mr-2" />
                  Send Notification
                </>
              )}
            </button>
          </div>
        </div>

        {/* Donors List Section */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Header with Search */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <HeartIcon className="h-5 w-5 text-red-500 mr-2" />
                  Donors in Your City
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {filteredDonors.length} donor{filteredDonors.length !== 1 ? 's' : ''} found
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-64">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search donors..."
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-sm"
                />
              </div>
            </div>
          </div>

          {/* Donors Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Donor ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Blood Group
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDonors.length > 0 ? (
                  filteredDonors.map((donor) => (
                    <tr key={donor.donor_id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">
                          {donor.donor_id}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 bg-gradient-to-br from-red-100 to-primary-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                            <span className="text-sm font-medium text-red-600">
                              {donor.name.charAt(0)}
                            </span>
                          </div>
                          <span className="ml-3 text-sm font-medium text-gray-900">
                            {donor.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getBloodGroupColor(donor.blood_group)}`}>
                          {donor.blood_group}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-600">
                          <PhoneIcon className="h-3 w-3 mr-1 text-gray-400" />
                          {donor.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-600">
                          <EnvelopeIcon className="h-3 w-3 mr-1 text-gray-400" />
                          <span className="truncate max-w-[200px]">{donor.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {donor.eligibility_status === 'Eligible Now' ? (
                            <>
                              <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
                              <span className="text-xs text-green-600 font-medium">Eligible Now</span>
                            </>
                          ) : (
                            <>
                              <XCircleIcon className="h-4 w-4 text-orange-500 mr-1" />
                              <span className="text-xs text-orange-600 font-medium">{donor.eligibility_status || 'Ineligible'}</span>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <UserGroupIcon className="h-12 w-12 text-gray-300 mb-3" />
                        <p className="text-gray-500 text-sm mb-1">No donors found</p>
                        <p className="text-xs text-gray-400">
                          {searchTerm ? 'Try adjusting your search' : 'Check back later for donors'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer with Pagination Info */}
          {filteredDonors.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>
                  Showing {filteredDonors.length} of {donors.length} donors
                </span>
                <span className="flex items-center">
                  <HeartIcon className="h-3 w-3 text-red-400 mr-1" />
                  Ready to save lives
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats Footer */}
        <div className="mt-6 bg-gradient-to-r from-red-50 to-primary-50 rounded-xl p-4 border border-red-100">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <div className="bg-white p-2 rounded-lg shadow-sm">
                <HeartIcon className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Blood Groups Distribution</p>
                <div className="flex space-x-2 mt-1">
                  {bloodGroups.slice(0, 4).map(bg => (
                    <span key={bg} className={`text-xs px-2 py-0.5 rounded-full ${getBloodGroupColor(bg)}`}>
                      {bg}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="text-xs text-gray-400">
              Last synced: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonorManagement;