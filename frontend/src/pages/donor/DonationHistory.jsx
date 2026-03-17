import React, { useState, useEffect } from 'react';
import { useDonor } from '../../contexts/DonorContext';
import donorService from '../../services/donor.service';
import Loader from '../../components/common/Loader';
import { formatDate } from '../../utils/helpers';

const DonationHistory = () => {
  const { donor } = useDonor();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const data = await donorService.getHistory();
      setHistory(data);
    } catch (err) {
      console.error('Failed to load donation history', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-10">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-2">Donation History</h1>
        <p className="text-gray-600 mb-6">Your past donations</p>

        {history.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">No donation records found.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="table-header">Date</th>
                  <th className="table-header">Blood Bank</th>
                  <th className="table-header">Units</th>
                  <th className="table-header">Next Eligible</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {history.map((item) => (
                  <tr key={item.history_id}>
                    <td className="table-cell">{formatDate(item.donation_date)}</td>
                    <td className="table-cell">{item.bloodbank_name || 'Unknown'}</td>
                    <td className="table-cell">{item.units}</td>
                    <td className="table-cell">
                      {item.next_eligible_date ? formatDate(item.next_eligible_date) : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DonationHistory;