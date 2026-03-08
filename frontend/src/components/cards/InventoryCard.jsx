import React from 'react';
import { formatDistanceToNow } from 'date-fns';

const InventoryCard = ({ item, onEdit, onDelete }) => {
  const daysUntilExpiry = Math.ceil(
    (new Date(item.expiry_date) - new Date()) / (1000 * 60 * 60 * 24)
  );

  const expiryStatus = 
    daysUntilExpiry <= 0 ? 'bg-gray-100 text-gray-800' :
    daysUntilExpiry <= 7 ? 'bg-red-100 text-red-800' :
    daysUntilExpiry <= 30 ? 'bg-yellow-100 text-yellow-800' :
    'bg-green-100 text-green-800';

  return (
    <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition">
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className="text-lg font-bold text-gray-900">{item.blood_group}</span>
          <span className={`ml-2 text-xs px-2 py-1 rounded-full ${expiryStatus}`}>
            {daysUntilExpiry <= 0 ? 'Expired' : `${daysUntilExpiry} days left`}
          </span>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(item)}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(item.inventory_id)}
            className="text-red-600 hover:text-red-800 text-sm"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div>
          <p className="text-xs text-gray-500">Available</p>
          <p className="text-sm font-semibold text-gray-900">{item.units_available} units</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Reserved</p>
          <p className="text-sm font-semibold text-gray-900">{item.units_reserved} units</p>
        </div>
      </div>

      <div className="text-xs text-gray-500">
        <p>Expiry: {new Date(item.expiry_date).toLocaleDateString()}</p>
        <p>Last Updated: {formatDistanceToNow(new Date(item.last_updated), { addSuffix: true })}</p>
      </div>
    </div>
  );
};

export default InventoryCard;