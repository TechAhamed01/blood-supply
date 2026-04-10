import React, { useState, useEffect } from 'react';
import hospitalService from '../../services/hospital.service';
import { useAlert } from '../../contexts/AlertContext';
import { PlusIcon } from '@heroicons/react/24/outline';

const BLOOD_GROUPS = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

const LocalInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { error, success } = useAlert();

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const data = await hospitalService.getInventory();
      // Ensure all blood groups are represented even if 0
      const currentMap = data.results.reduce((acc, item) => ({ ...acc, [item.blood_group]: item.units_available }), {});
      
      const fullInventory = BLOOD_GROUPS.map(bg => ({
        blood_group: bg,
        units_available: currentMap[bg] || 0
      }));
      setInventory(fullInventory);
    } catch (err) {
      console.log(err);
      error('Failed to load local inventory');
    } finally {
      setLoading(false);
    }
  };

  const updateUnits = async (bg, newUnits) => {
    if (newUnits < 0) return;
    try {
      await hospitalService.updateInventory({
        blood_group: bg,
        units_available: parseInt(newUnits, 10)
      });
      setInventory(prev => 
        prev.map(item => item.blood_group === bg ? { ...item, units_available: parseInt(newUnits, 10) } : item)
      );
      success(`${bg} inventory updated`);
    } catch (err) {
      error('Failed to update inventory');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {[1,2,3,4].map(i => <div key={i} className="h-10 bg-gray-100 rounded"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Local In-House Inventory
      </h3>
      <p className="text-sm text-gray-500 mb-4">Update your on-site blood stock to assist forecast modeling.</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {inventory.map((item) => (
          <div key={item.blood_group} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-gray-800">{item.blood_group}</span>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => updateUnits(item.blood_group, item.units_available - 1)}
                className="w-8 h-8 rounded bg-white shadow flex items-center justify-center hover:bg-gray-100 text-gray-600 font-bold"
                disabled={item.units_available === 0}
              >
                -
              </button>
              <input 
                type="number" 
                value={item.units_available}
                onChange={(e) => updateUnits(item.blood_group, e.target.value)}
                className="w-full text-center border-gray-200 rounded p-1"
                min="0"
              />
              <button 
                onClick={() => updateUnits(item.blood_group, item.units_available + 1)}
                className="w-8 h-8 rounded bg-white shadow flex items-center justify-center hover:bg-gray-100 text-gray-600 font-bold"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LocalInventory;
