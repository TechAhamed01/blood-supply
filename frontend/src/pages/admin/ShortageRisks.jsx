import React, { useState, useEffect } from 'react';
import { useAlert } from '../../contexts/AlertContext';
import aiService from '../../services/ai.service';
import Loader from '../../components/common/Loader';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const ShortageRisks = () => {
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { error } = useAlert();

  useEffect(() => {
    fetchRisks();
  }, []);

  const fetchRisks = async () => {
    try {
      setLoading(true);
      const data = await aiService.getShortageRisks();
      setRisks(data);
    } catch (err) {
      error('Failed to load shortage risks');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level) => {
    switch(level) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Shortage Risk Detection</h1>
          <p className="text-gray-600 mt-2">AI-powered prediction of potential blood shortages</p>
        </div>

        {risks.length === 0 ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
            <p className="text-green-800 text-lg">✅ No shortage risks detected</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {risks.map((risk, index) => (
              <div
                key={index}
                className={`border rounded-xl p-6 ${getRiskColor(risk.risk_level)}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">{risk.city}</h3>
                  <ExclamationTriangleIcon className="h-6 w-6" />
                </div>
                <p className="text-sm mb-2">
                  <span className="font-medium">Blood Group:</span> {risk.blood_group}
                </p>
                <p className="text-sm mb-2">
                  <span className="font-medium">Current Stock:</span> {risk.current_stock} units
                </p>
                <p className="text-sm mb-2">
                  <span className="font-medium">7-Day Demand:</span> {risk.predicted_7day_demand} units
                </p>
                <div className="mt-4 pt-4 border-t border-current border-opacity-20">
                  <p className="text-sm font-medium">Risk Level: {risk.risk_level}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShortageRisks;