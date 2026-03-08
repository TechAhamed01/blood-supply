import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip
} from 'recharts';

const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'];

const InventoryChart = ({ inventory }) => {
  // Ensure inventory is an array
  const inventoryArray = Array.isArray(inventory) ? inventory : [];
  
  if (inventoryArray.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-500">
        No inventory data available
      </div>
    );
  }

  // Aggregate inventory by blood group
  const data = inventoryArray.reduce((acc, item) => {
    // Skip invalid items
    if (!item || !item.blood_group) return acc;
    
    const existing = acc.find(i => i.blood_group === item.blood_group);
    if (existing) {
      existing.units += (item.units_available || 0);
    } else {
      acc.push({
        blood_group: item.blood_group,
        units: item.units_available || 0
      });
    }
    return acc;
  }, []);

  // Filter out zero values
  const filteredData = data.filter(item => item.units > 0);

  if (filteredData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-500">
        No inventory with available units
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={filteredData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="units"
          nameKey="blood_group"
          label={({ blood_group, percent }) => 
            `${blood_group} ${(percent * 100).toFixed(0)}%`
          }
        >
          {filteredData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value) => [`${value} units`, 'Available']}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default InventoryChart;