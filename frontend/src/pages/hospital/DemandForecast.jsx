import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useAlert } from '../../contexts/AlertContext';
import aiService from '../../services/ai.service';
import { BLOOD_GROUPS } from '../../utils/constants';
import DemandChart from '../../components/charts/DemandChart';
import Loader from '../../components/common/Loader';

const DemandForecast = () => {
  const { user } = useAuth();
  const { error } = useAlert();
  const [selectedGroup, setSelectedGroup] = useState('O+');
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchForecast();
  }, [selectedGroup]);

  const fetchForecast = async () => {
    try {
      setLoading(true);
      const data = await aiService.getDemandForecast(user.hospitalId, selectedGroup);
      setForecast(data.forecast || []);
    } catch (err) {
      error('Failed to load forecast');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Demand Forecast</h1>
          <p className="text-gray-600 mt-2">AI-powered 7-day demand prediction</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Blood Group
          </label>
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="input-field w-full md:w-64"
          >
            {BLOOD_GROUPS.map(bg => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <Loader />
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              7-Day Demand Forecast for {selectedGroup}
            </h3>
            {forecast.length > 0 ? (
              <>
                <DemandChart data={forecast} />
                <div className="mt-6 grid grid-cols-7 gap-2">
                  {forecast.map(([date, value]) => (
                    <div key={date} className="text-center p-2 bg-gray-50 rounded">
                      <p className="text-xs text-gray-500">
                        {new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                      </p>
                      <p className="text-sm font-semibold text-gray-900">{value} units</p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-gray-500 text-center py-8">No forecast data available</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DemandForecast;