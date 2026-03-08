import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAlert } from '../../contexts/AlertContext';
import hospitalService from '../../services/hospital.service';
import bloodbankService from '../../services/bloodbank.service';
import allocationService from '../../services/allocation.service';
import aiService from '../../services/ai.service';
import { 
  BuildingOfficeIcon, 
  BuildingLibraryIcon,
  BeakerIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';
import Loader from '../../components/common/Loader';

const AdminDashboard = () => {
  const { error } = useAlert();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalHospitals: 0,
    totalBloodBanks: 0,
    totalRequests: 0,
    shortageRisks: 0,
  });
  const [shortageRisks, setShortageRisks] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const [hospitals, bloodbanks, requests, risks] = await Promise.all([
        hospitalService.getAllHospitals(),
        bloodbankService.getAllBloodBanks(),
        allocationService.getAllRequests(),
        aiService.getShortageRisks(),
      ]);

      setStats({
        totalHospitals: hospitals.length,
        totalBloodBanks: bloodbanks.length,
        totalRequests: requests.length,
        shortageRisks: risks.length,
      });

      setShortageRisks(risks.slice(0, 5));
      setRecentActivity(requests.slice(0, 10));

    } catch (err) {
      error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  const StatCard = ({ title, value, icon: Icon, color, link }) => (
    <Link to={link} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-800">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">System overview and management</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Hospitals"
            value={stats.totalHospitals}
            icon={BuildingOfficeIcon}
            color="bg-blue-500"
            link="/admin/hospitals"
          />
          <StatCard
            title="Blood Banks"
            value={stats.totalBloodBanks}
            icon={BuildingLibraryIcon}
            color="bg-green-500"
            link="/admin/bloodbanks"
          />
          <StatCard
            title="Total Requests"
            value={stats.totalRequests}
            icon={BeakerIcon}
            color="bg-purple-500"
            link="/admin/allocations"
          />
          <StatCard
            title="Shortage Risks"
            value={stats.shortageRisks}
            icon={ExclamationTriangleIcon}
            color="bg-red-500"
            link="/admin/shortage-risks"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Shortage Risks */}
          <div className="lg:col-span-1 bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              ⚠️ Shortage Risks
            </h3>
            {shortageRisks.length > 0 ? (
              <div className="space-y-3">
                {shortageRisks.map((risk, index) => (
                  <div key={index} className="p-3 bg-red-50 rounded-lg">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-gray-900">{risk.city}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        risk.risk_level === 'CRITICAL' ? 'bg-red-200 text-red-800' :
                        risk.risk_level === 'HIGH' ? 'bg-orange-200 text-orange-800' :
                        'bg-yellow-200 text-yellow-800'
                      }`}>
                        {risk.risk_level}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {risk.blood_group}: Stock {risk.current_stock} vs Demand {risk.predicted_7day_demand}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                No shortage risks detected
              </p>
            )}
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Allocation Requests
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="table-header">Hospital</th>
                    <th className="table-header">Blood Group</th>
                    <th className="table-header">Units</th>
                    <th className="table-header">Status</th>
                    <th className="table-header">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentActivity.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="table-cell">{request.hospital_name}</td>
                      <td className="table-cell font-medium">{request.blood_group}</td>
                      <td className="table-cell">{request.units_requested}</td>
                      <td className="table-cell">
                        <span className={`badge-${
                          request.status === 'FULFILLED' ? 'success' :
                          request.status === 'PENDING' ? 'warning' :
                          'info'
                        }`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="table-cell">
                        {new Date(request.requested_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;