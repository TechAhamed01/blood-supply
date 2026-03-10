import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAlert } from '../../contexts/AlertContext';
import inventoryService from '../../services/inventory.service';
import allocationService from '../../services/allocation.service';
import bloodbankService from '../../services/bloodbank.service';
import { 
  ArchiveBoxIcon, 
  ClockIcon, 
  CheckCircleIcon,
  ExclamationCircleIcon 
} from '@heroicons/react/24/outline';
import InventoryChart from '../../components/charts/InventoryChart';
import Loader from '../../components/common/Loader';

const BloodBankDashboard = () => {
  const { user } = useAuth();
  const { error } = useAlert();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalInventory: 0,
    expiringSoon: 0,
    pendingRequests: 0,
    fulfilledToday: 0,
  });
  const [inventory, setInventory] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [bloodbank, setBloodBank] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // 1. Fetch blood bank details
      const bankData = await bloodbankService.getBloodBankById(user.bloodbankId);
      setBloodBank(bankData);

      // 2. Fetch inventory
      let inventoryData = [];
      try {
        const data = await inventoryService.getInventory();
        if (Array.isArray(data)) {
          inventoryData = data;
        } else {
          console.warn('Inventory data is not an array:', data);
          inventoryData = [];
        }
      } catch (invErr) {
        console.error('Failed to fetch inventory:', invErr);
        inventoryData = [];
      }
      setInventory(inventoryData);

      // 3. Fetch pending requests
      let requests = [];
      try {
        const requestsData = await allocationService.getPendingRequests();
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
      setPendingRequests(requests);

      // 4. Fetch today's fulfilled requests and calculate units
      let fulfilledToday = 0;
      try {
        // Primary Method: Using the specific today's fulfilled service
        const todaysFulfilled = await allocationService.getTodaysFulfilledRequests();
        
        fulfilledToday = todaysFulfilled.reduce((total, request) => {
          // Sum up units from items belonging specifically to this blood bank
          const bankItems = request.items?.filter(
            item => item.bloodbank_id === parseInt(user.bloodbankId)
          ) || [];
          return total + bankItems.reduce((sum, item) => sum + item.units_taken, 0);
        }, 0);
        
      } catch (fulfilledErr) {
        console.error('Failed to fetch today\'s fulfilled requests:', fulfilledErr);
        
        // Alternative Fallback Method: Filter from general fulfilled requests
        try {
          const allRequests = await allocationService.getAllRequests({
            status: 'FULFILLED',
            bloodbank_id: user.bloodbankId
          });
          
          const today = new Date().toDateString();
          fulfilledToday = allRequests.filter(req => {
            const allocatedDate = new Date(req.allocated_at).toDateString();
            return allocatedDate === today;
          }).length; // Note: Fallback counts requests, primary counts units
          
        } catch (altErr) {
          console.error('Alternative method also failed:', altErr);
        }
      }

      // 5. Calculate final stats
      const expiringSoon = inventoryData.filter(item => {
        if (!item || !item.expiry_date) return false;
        const daysUntilExpiry = Math.ceil(
          (new Date(item.expiry_date) - new Date()) / (1000 * 60 * 60 * 24)
        );
        return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
      }).length;

      const totalUnits = inventoryData.reduce(
        (sum, item) => sum + (item.units_available || 0), 0
      );

      setStats({
        totalInventory: totalUnits,
        expiringSoon,
        pendingRequests: requests.length,
        fulfilledToday: fulfilledToday,
      });

    } catch (err) {
      console.error('Dashboard error:', err);
      error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  const StatCard = ({ title, value, icon: Icon, color, subtext }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-800">{value}</p>
          {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
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
            Welcome back, {bloodbank?.name || 'Blood Bank'}
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your inventory and fulfill blood requests efficiently.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Inventory"
            value={stats.totalInventory}
            icon={ArchiveBoxIcon}
            color="bg-blue-500"
            subtext="units available"
          />
          <StatCard
            title="Expiring Soon"
            value={stats.expiringSoon}
            icon={ExclamationCircleIcon}
            color="bg-red-500"
            subtext="within 7 days"
          />
          <StatCard
            title="Pending Requests"
            value={stats.pendingRequests}
            icon={ClockIcon}
            color="bg-yellow-500"
          />
          <StatCard
            title="Fulfilled Today"
            value={stats.fulfilledToday}
            icon={CheckCircleIcon}
            color="bg-green-500"
            subtext="units contributed"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link 
            to="/bloodbank/inventory"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition border-l-4 border-blue-500"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Inventory</h3>
            <p className="text-gray-600 mb-4">Add, update, or remove inventory batches</p>
            <span className="text-blue-600 font-medium">Manage →</span>
          </Link>

          <Link 
            to="/bloodbank/pending-requests"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition border-l-4 border-yellow-500"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Pending Requests</h3>
            <p className="text-gray-600 mb-4">View and fulfill blood requests</p>
            <span className="text-yellow-600 font-medium">View →</span>
          </Link>

          <Link 
            to="/bloodbank/inventory/add"
            className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl shadow-lg p-6 hover:shadow-xl transition"
          >
            <h3 className="text-lg font-semibold text-white mb-2">Add New Batch</h3>
            <p className="text-primary-100 mb-4">Register new blood inventory</p>
            <button className="bg-white text-primary-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition">
              Add Batch →
            </button>
          </Link>
        </div>

        {/* Inventory and Requests */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Current Inventory by Blood Group
            </h3>
            {inventory && inventory.length > 0 ? (
              <InventoryChart inventory={inventory} />
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                No inventory available
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Pending Requests
            </h3>
            {pendingRequests.length > 0 ? (
              <div className="space-y-4">
                {pendingRequests.slice(0, 5).map((request) => (
                  <Link
                    key={request.id}
                    to={`/bloodbank/requests/${request.id}`}
                    className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition border border-transparent hover:border-gray-200"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-bold text-gray-900 text-lg">
                          {request.blood_group}
                        </span>
                        <span className="ml-2 text-sm text-gray-600">
                          - {request.units_requested} units
                        </span>
                      </div>
                      {request.emergency_flag && (
                        <span className="bg-red-100 text-red-800 text-[10px] uppercase font-bold tracking-tighter px-2 py-1 rounded-full animate-pulse">
                          Emergency
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Hospital: {request.hospital_name || 'N/A'}</span>
                      <span className="text-xs italic">
                        {request.your_rank ? `#${request.your_rank} nearest` : ''}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                No pending requests at the moment
              </p>
            )}
            {pendingRequests.length > 0 && (
              <Link
                to="/bloodbank/pending-requests"
                className="block text-center mt-4 text-primary-600 hover:text-primary-700 font-medium"
              >
                View All Pending Requests ({pendingRequests.length}) →
              </Link>
            )}
          </div>
        </div>

        {/* Expiring Soon Alert */}
        {stats.expiringSoon > 0 && (
          <div className="mt-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  <span className="font-bold">Critical Alert:</span> You have {stats.expiringSoon} batches expiring within 7 days. Check the inventory management page to prioritize these.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BloodBankDashboard;