import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAlert } from '../../contexts/AlertContext';
import inventoryService from '../../services/inventory.service';
import InventoryForm from '../../components/forms/InventoryForm';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const AddInventory = () => {
  const navigate = useNavigate();
  const { success, error } = useAlert();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data) => {
    try {
      setLoading(true);
      await inventoryService.createInventoryItem(data);
      success('Inventory batch added successfully');
      navigate('/bloodbank/inventory');
    } catch (err) {
      console.error('Failed to add inventory:', err);
      error('Failed to add inventory batch');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Inventory
        </button>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-6">
            <h1 className="text-2xl font-bold text-white">Add New Inventory Batch</h1>
            <p className="text-primary-100 mt-1">Enter the details of the new blood batch</p>
          </div>

          <div className="p-8">
            <InventoryForm onSubmit={handleSubmit} loading={loading} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddInventory;