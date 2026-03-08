import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAlert } from '../../contexts/AlertContext';
import allocationService from '../../services/allocation.service';
import aiService from '../../services/ai.service';
import hospitalService from '../../services/hospital.service';
import { 
  BeakerIcon, 
  ClockIcon, 
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon 
} from '@heroicons/react/24/outline';
import DemandChart from '../../components/charts/DemandChart';
import Loader from '../../components/common/Loader';

const HospitalDashboard = () => {
  const { user } = useAuth();
  const { error } = useAlert();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    fulfilledRequests: 0,
    totalUnitsAllocated: 0,
  });
  const [recentRequests, setRecentRequests] = useState([]);
  const [demandForecast, setDemandForecast] = useState(null);
  const [hospital, setHospital] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // 1. Fetch hospital details
      const hospitalData = await hospitalService.getHospitalById(user.hospitalId);
      setHospital(hospitalData);

      // 2. Fetch allocation requests
      let requests = [];
      try {
        const requestsData = await allocationService.getHospitalRequests();
        console.log('Dashboard requests data:', requestsData); // Debug log
        
        // Ensure requestsData is an array
        if (Array.isArray(requestsData)) {
          requests = requestsData;
        } else {
          console.warn('Requests data is not an array:', requestsData);
          requests = [];
        }
      } catch (reqErr) {
        console.error('Failed to fetch requests:', reqErr);
        requests = [];
      }

      setRecentRequests(requests.slice(0, 5));

      const statsUpdate = {
        totalRequests: requests.length,
        pendingRequests: requests.filter(r => r && r.status === 'PENDING').length,
        fulfilledRequests: requests.filter(r => r && r.status === 'FULFILLED').length,
        totalUnitsAllocated: requests.reduce((sum, r) => sum + (r.units_allocated || 0), 0),
      };
      setStats(statsUpdate);

      // 3. Fetch demand forecast
      try {
        const forecast = await aiService.getDemandForecast(user.hospitalId, 'O+');
        setDemandForecast(forecast.forecast || []);
      } catch (forecastErr) {
        console.warn('Demand forecast unavailable:', forecastErr);
      }

    } catch (err) {
      console.error('Dashboard error:', err);
      error('Failed to load core dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-800">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {hospital?.name || 'Hospital'}
          </h1>
          <p className="text-gray-600 mt-2">
            Here's what's happening with your blood requests today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Requests"
            value={stats.totalRequests}
            icon={BeakerIcon}
            color="bg-blue-500"
          />
          <StatCard
            title="Pending"
            value={stats.pendingRequests}
            icon={ClockIcon}
            color="bg-yellow-500"
          />
          <StatCard
            title="Fulfilled"
            value={stats.fulfilledRequests}
            icon={ArrowTrendingUpIcon}
            color="bg-green-500"
          />
          <StatCard
            title="Units Allocated"
            value={stats.totalUnitsAllocated}
            icon={ExclamationTriangleIcon}
            color="bg-purple-500"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link 
            to="/hospital/request-blood"
            className="group relative bg-gradient-to-r from-blood to-blood-dark rounded-xl shadow-lg p-6 hover:shadow-xl transition overflow-hidden"
          >
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition"></div>
            <h3 className="text-xl font-bold text-white mb-2">Request Blood</h3>
            <p className="text-red-100 mb-4 opacity-90">Create a new blood allocation request</p>
            <span className="inline-block bg-white text-blood px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition">
              New Request →
            </span>
          </Link>

          <Link 
            to="/hospital/demand-forecast"
            className="group relative bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl shadow-lg p-6 hover:shadow-xl transition overflow-hidden"
          >
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition"></div>
            <h3 className="text-xl font-bold text-white mb-2">Demand Forecast</h3>
            <p className="text-primary-100 mb-4 opacity-90">View AI-powered demand predictions</p>
            <span className="inline-block bg-white text-primary-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition">
              View Forecast →
            </span>
          </Link>
        </div>

        {/* Charts and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              7-Day Demand Forecast (O+)
            </h3>
            {demandForecast && demandForecast.length > 0 ? (
              <DemandChart data={demandForecast} />
            ) : (
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <p className="text-gray-500 text-sm">No forecast data available for this hospital.</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Requests
            </h3>
            <div className="space-y-4">
              {recentRequests.length > 0 ? (
                recentRequests.map((request) => (
                  <Link
                    key={request.id}
                    to={`/hospital/requests/${request.id}`}
                    className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-gray-900">
                        {request.blood_group}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        request.status === 'FULFILLED' ? 'bg-green-100 text-green-800' :
                        request.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {request.status}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Requested: {request.units_requested} units</span>
                      <span>Allocated: {request.units_allocated || 0} units</span>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-center text-gray-500 py-10">No recent requests found.</p>
              )}
            </div>
            <Link
              to="/hospital/my-requests"
              className="block text-center mt-4 text-primary-600 hover:text-primary-700 font-medium"
            >
              View All Requests →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalDashboard;