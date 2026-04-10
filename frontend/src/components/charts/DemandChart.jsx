import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const DemandChart = ({ data }) => {
  // Format data for recharts
  const chartData = data.map(([date, value]) => ({
    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    demand: value
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="date" stroke="#6b7280" />
        <YAxis stroke="#6b7280" />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white', 
            border: 'none', 
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }} 
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="demand" 
          stroke="#ef4444" 
          strokeWidth={2}
          dot={{ fill: '#ef4444', r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default DemandChart;