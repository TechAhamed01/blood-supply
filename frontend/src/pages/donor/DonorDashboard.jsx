import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDonor } from '../../contexts/DonorContext';
import { useAlert } from '../../contexts/AlertContext';
import donorService from '../../services/donor.service';
import Loader from '../../components/common/Loader';
import {
  HeartIcon,
  CalendarIcon,
  BellIcon,
  MapPinIcon,
  ArrowRightOnRectangleIcon,
  ArrowRightIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

const DonorDashboard = () => {
  const { donor, logout } = useDonor();
  const navigate = useNavigate();
  const { success } = useAlert();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const [data, notifs] = await Promise.all([
        donorService.getDashboard(),
        donorService.getNotifications()
      ]);
      setDashboard(data);
      const unread = notifs.filter(n => !n.is_read).length;
      setDashboard(prev => ({ ...prev, unreadNotifications: unread }));
    } catch (err) {
      console.error('Failed to load dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    success('Logged out successfully');
    navigate('/');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Eligible Now':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Eligible Soon':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Not Eligible':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Eligible Now':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'Eligible Soon':
        return <ClockIcon className="h-5 w-5 text-yellow-600" />;
      case 'Not Eligible':
        return <CalendarIcon className="h-5 w-5 text-gray-600" />;
      default:
        return <HeartIcon className="h-5 w-5 text-blue-600" />;
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Welcome Message and Logout */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-primary-500 rounded-full blur-md opacity-30 animate-pulse"></div>
              <div className="relative bg-white rounded-full p-3 shadow-lg">
                <HeartIcon className="h-8 w-8 text-red-500" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Welcome back, {donor?.name}
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Your donor dashboard • Last login: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-4 md:mt-0 flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
          >
            <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
            Logout
          </button>
        </div>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {/* Blood Group Card */}
          <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Blood Group</p>
                <p className="text-3xl font-bold text-gray-900">{dashboard?.blood_group || donor?.blood_group}</p>
                <p className="text-xs text-gray-400 mt-2">Your blood type</p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <HeartIcon className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </div>

          {/* Total Donations Card */}
          <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total Donations</p>
                <p className="text-3xl font-bold text-gray-900">{dashboard?.total_donations || 0}</p>
                <p className="text-xs text-green-600 mt-2">
                  <span className="flex items-center">
                    <CheckCircleIcon className="h-3 w-3 mr-1" />
                    {dashboard?.total_units || 0} units donated
                  </span>
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CalendarIcon className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </div>

          {/* Next Eligible Card */}
          <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Next Eligible</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboard?.next_eligible_date
                    ? new Date(dashboard.next_eligible_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })
                    : 'New Donor'}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  {dashboard?.next_eligible_date
                    ? Math.ceil((new Date(dashboard.next_eligible_date) - new Date()) / (1000 * 60 * 60 * 24)) > 0
                      ? `${Math.ceil((new Date(dashboard.next_eligible_date) - new Date()) / (1000 * 60 * 60 * 24))} days remaining`
                      : 'Eligible now!'
                    : 'Complete your first donation'}
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <ClockIcon className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
          </div>

          {/* Status Card */}
          <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Status</p>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(dashboard?.eligibility_status)}
                  <p className="text-xl font-bold text-gray-900">{dashboard?.eligibility_status || 'New Donor'}</p>
                </div>
                <p className={`text-xs mt-2 px-2 py-1 rounded-full inline-block ${getStatusColor(dashboard?.eligibility_status)}`}>
                  {dashboard?.eligibility_status === 'Eligible Now'
                    ? '✅ Ready to donate'
                    : dashboard?.eligibility_status === 'Eligible Soon'
                    ? '⏳ Almost ready'
                    : '📅 On hold'}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <UserGroupIcon className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Donation Progress Bar (if eligible) */}
        {dashboard?.eligibility_status === 'Eligible Now' && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-green-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Ready to Donate</h3>
              <span className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full">Immediate Need</span>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              You're eligible to donate! Check nearby blood banks for urgent requirements.
            </p>
            <Link
              to="/donor/nearby-banks"
              className="inline-flex items-center text-sm text-green-600 hover:text-green-700 font-medium"
            >
              Find nearby blood banks
              <ArrowRightIcon className="h-3 w-3 ml-1" />
            </Link>
          </div>
        )}

        {/* Quick Actions Section */}
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Donation History Card */}
          <Link
            to="/donor/history"
            className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
          >
            <div className="h-2 bg-gradient-to-r from-blue-500 to-blue-600"></div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-blue-100 p-3 rounded-lg group-hover:scale-110 transition-transform">
                  <CalendarIcon className="h-6 w-6 text-blue-500" />
                </div>
                <ArrowRightIcon className="h-5 w-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Donation History</h3>
              <p className="text-sm text-gray-500 mb-4">View all your past donations and impact</p>
              <div className="flex items-center text-xs text-gray-400">
                <span>{dashboard?.total_donations || 0} donations • {dashboard?.total_units || 0} units</span>
              </div>
            </div>
          </Link>

          {/* Notifications Card */}
          <Link
            to="/donor/notifications"
            className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
          >
            <div className="h-2 bg-gradient-to-r from-yellow-500 to-yellow-600"></div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-yellow-100 p-3 rounded-lg group-hover:scale-110 transition-transform">
                  <BellIcon className="h-6 w-6 text-yellow-500" />
                </div>
                <ArrowRightIcon className="h-5 w-5 text-gray-400 group-hover:text-yellow-500 group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Notifications</h3>
              <p className="text-sm text-gray-500 mb-4">Check alerts and updates from blood banks</p>
              <div className="flex items-center text-xs text-gray-400">
                {dashboard?.unreadNotifications > 0 ? (
                  <span className="flex items-center text-red-600 font-bold">
                    <span className="h-2 w-2 bg-red-500 rounded-full animate-pulse mr-2"></span>
                    {dashboard.unreadNotifications} unread message{dashboard.unreadNotifications > 1 ? 's' : ''}
                  </span>
                ) : (
                  <span className="flex items-center">
                    <span className="h-2 w-2 bg-gray-300 rounded-full mr-2"></span>
                    All caught up
                  </span>
                )}
              </div>
            </div>
          </Link>

          {/* Nearby Blood Banks Card */}
          <Link
            to="/donor/nearby-banks"
            className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
          >
            <div className="h-2 bg-gradient-to-r from-purple-500 to-purple-600"></div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-purple-100 p-3 rounded-lg group-hover:scale-110 transition-transform">
                  <MapPinIcon className="h-6 w-6 text-purple-500" />
                </div>
                <ArrowRightIcon className="h-5 w-5 text-gray-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nearby Blood Banks</h3>
              <p className="text-sm text-gray-500 mb-4">Find blood banks in your city</p>
              <div className="flex items-center text-xs text-gray-400">
                <span>{donor?.city} • View locations</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Impact Summary Footer */}
        <div className="mt-8 bg-gradient-to-r from-red-50 to-primary-50 rounded-xl p-6 border border-red-100">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-1">Your Impact</h3>
              <p className="text-2xl font-bold text-red-500">{dashboard?.total_units || 0} units</p>
              <p className="text-xs text-gray-500">lives impacted through your donations</p>
            </div>
            <div className="flex space-x-6">
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-900">{dashboard?.total_donations || 0}</p>
                <p className="text-xs text-gray-500">Donations</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-900">{donor?.city || 'N/A'}</p>
                <p className="text-xs text-gray-500">Your City</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-900">{donor?.blood_group || 'N/A'}</p>
                <p className="text-xs text-gray-500">Blood Type</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonorDashboard;