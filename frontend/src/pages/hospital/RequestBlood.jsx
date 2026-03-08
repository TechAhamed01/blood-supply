import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAlert } from '../../contexts/AlertContext';
import allocationService from '../../services/allocation.service';
import AllocationRequestForm from '../../components/forms/AllocationRequestForm';

const RequestBlood = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error } = useAlert();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      
      // Prepare the request data
      const requestData = {
        ...formData,
        hospital_id: user.hospitalId
      };
      
      console.log('Submitting request:', requestData); // Debug log
      
      const response = await allocationService.createRequest(requestData);
      console.log('Response:', response); // Debug log
      
      success('Blood request submitted successfully');
      navigate('/hospital/my-requests');
    } catch (err) {
      console.error('Request failed:', err);
      console.error('Error response:', err.response?.data); // Debug log
      
      // Show specific error message from backend if available
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          'Failed to submit request';
      error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Request Blood</h1>
          <p className="text-gray-600 mb-8">Fill in the details to request blood units</p>
          
          <AllocationRequestForm onSubmit={handleSubmit} loading={loading} />
        </div>
      </div>
    </div>
  );
};

export default RequestBlood;