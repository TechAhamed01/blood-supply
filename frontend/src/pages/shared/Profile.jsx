import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useAlert } from '../../contexts/AlertContext';
import { UserCircleIcon } from '@heroicons/react/24/outline';

const Profile = () => {
  const { user } = useAuth();
  const { success } = useAlert();
  const [formData, setFormData] = useState({
    name: user?.name || user?.username || '',
    contact: user?.contact || '',
    email: user?.email || '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => {
      success('Profile updated successfully');
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center space-x-4 mb-6 pt-4">
            <UserCircleIcon className="h-16 w-16 text-primary-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Your Profile</h1>
              <p className="text-gray-500">Manage your account settings ({user?.role})</p>
            </div>
          </div>
          
          <div className="border-t border-gray-100 pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-gray-50 p-2 border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                  <input
                    type="text"
                    name="contact"
                    value={formData.contact}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-gray-50 p-2 border"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-gray-50 p-2 border"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;