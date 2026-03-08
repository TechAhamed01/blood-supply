import React, { useState, useEffect } from 'react';
import { useAlert } from '../../contexts/AlertContext';
import inventoryService from '../../services/inventory.service';
import InventoryCard from '../../components/cards/InventoryCard';
import InventoryForm from '../../components/forms/InventoryForm';
import Loader from '../../components/common/Loader';
import { PlusIcon } from '@heroicons/react/24/outline';

const InventoryManagement = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const { error, success } = useAlert();

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const data = await inventoryService.getInventory();
      setInventory(data);
    } catch (err) {
      error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (data) => {
    try {
      await inventoryService.createInventoryItem(data);
      success('Inventory added successfully');
      setShowForm(false);
      fetchInventory();
    } catch (err) {
      error('Failed to add inventory');
    }
  };

  const handleEdit = async (data) => {
    try {
      await inventoryService.updateInventoryItem(editingItem.inventory_id, data);
      success('Inventory updated successfully');
      setEditingItem(null);
      fetchInventory();
    } catch (err) {
      error('Failed to update inventory');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this inventory item?')) {
      try {
        await inventoryService.deleteInventoryItem(id);
        success('Inventory deleted successfully');
        fetchInventory();
      } catch (err) {
        error('Failed to delete inventory');
      }
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
            <p className="text-gray-600 mt-2">Manage your blood inventory batches</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Batch
          </button>
        </div>

        {/* Form Modal */}
        {(showForm || editingItem) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  {editingItem ? 'Edit Inventory' : 'Add New Inventory'}
                </h2>
                <InventoryForm
                  onSubmit={editingItem ? handleEdit : handleAdd}
                  loading={false}
                  initialData={editingItem}
                />
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingItem(null);
                  }}
                  className="mt-4 text-gray-500 hover:text-gray-700 text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Inventory Grid */}
        {inventory.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <p className="text-gray-500 text-lg">No inventory items found</p>
            <button
              onClick={() => setShowForm(true)}
              className="text-primary-600 hover:text-primary-700 mt-4"
            >
              Add your first batch →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {inventory.map(item => (
              <InventoryCard
                key={item.inventory_id}
                item={item}
                onEdit={setEditingItem}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryManagement;