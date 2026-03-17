import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAlert } from '../../contexts/AlertContext';
import api from '../../services/api';

const DonorRegister = () => {
  const navigate = useNavigate();
  const { success, error } = useAlert();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    donor_id: '',
    name: '',
    blood_group: '',
    city: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
    preferred_bloodbank_id: ''
  });

  const bloodGroups = ['O+', 'A+', 'B+', 'O-', 'A-', 'AB+', 'B-', 'AB-'];
  const cities = ['Mumbai', 'Pune', 'Nashik', 'Nagpur', 'Thane'];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirm_password) {
      error('Passwords do not match');
      return;
    }
    try {
      setLoading(true);
      // Call backend registration endpoint (you'll need to create this)
      const response = await api.post('/donors/register/', formData);
      success('Registration successful! Please login.');
      navigate('/donor/login');
    } catch (err) {
      error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center mb-6">Donor Registration</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Donor ID</label>
              <input
                type="text"
                name="donor_id"
                value={formData.donor_id}
                onChange={handleChange}
                className="input-field mt-1"
                placeholder="e.g., D001"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input-field mt-1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Blood Group</label>
              <select
                name="blood_group"
                value={formData.blood_group}
                onChange={handleChange}
                className="input-field mt-1"
                required
              >
                <option value="">Select</option>
                {bloodGroups.map(bg => <option key={bg} value={bg}>{bg}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">City</label>
              <select
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="input-field mt-1"
                required
              >
                <option value="">Select</option>
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field mt-1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="input-field mt-1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input-field mt-1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <input
                type="password"
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                className="input-field mt-1"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Preferred Blood Bank ID (optional)</label>
              <input
                type="text"
                name="preferred_bloodbank_id"
                value={formData.preferred_bloodbank_id}
                onChange={handleChange}
                className="input-field mt-1"
                placeholder="e.g., 3"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary mt-4"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account? <Link to="/donor/login" className="text-primary-600 hover:underline">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default DonorRegister;