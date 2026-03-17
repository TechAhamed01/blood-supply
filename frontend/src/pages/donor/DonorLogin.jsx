import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDonor } from '../../contexts/DonorContext';
import { useAlert } from '../../contexts/AlertContext';
import { HeartIcon, UserCircleIcon, KeyIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

const DonorLogin = () => {
  const navigate = useNavigate();
  const { login } = useDonor();
  const { error } = useAlert();
  const [formData, setFormData] = useState({ donor_id: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await login(formData.donor_id, formData.password);
      navigate('/donor/dashboard', { replace: true });
    } catch (err) {
      error('Invalid donor ID or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-primary-50 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative Background Elements - Reduced size */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-red-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-red-100 to-primary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      </div>

      {/* Floating Hearts - Smaller and more subtle */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="absolute text-red-200/30 animate-float"
            style={{
              left: `${10 + (i * 25)}%`,
              top: `${10 + (i * 20)}%`,
              animationDelay: `${i * 3}s`,
            }}
          >
            <HeartIcon className="h-8 w-8" />
          </div>
        ))}
      </div>

      {/* Main Content - Better proportions */}
      <div className="max-w-md w-full relative z-10">
        {/* Logo and Welcome Message - Compact */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-primary-500 rounded-full blur-md opacity-50 animate-pulse"></div>
              <div className="relative bg-white rounded-full p-3 shadow-lg">
                <HeartIcon className="h-8 w-8 text-red-500" />
              </div>
            </div>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-1">
            Welcome Back, Hero!
          </h2>
          <p className="text-gray-500 text-xs">
            Your generosity saves lives. Sign in to continue your journey.
          </p>
        </div>

        {/* Login Card - Compact spacing */}
        <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-xl p-6 border border-white/20">
          {/* Donor Quote - Smaller */}
          <div className="mb-4 p-3 bg-gradient-to-r from-red-50 to-primary-50 rounded-lg border border-red-100">
            <p className="text-xs text-gray-600 italic leading-relaxed">
              "The gift of blood is the gift of life. Every drop counts."
            </p>
            <div className="flex items-center mt-1">
              <div className="h-0.5 w-4 bg-red-300 mr-1"></div>
              <span className="text-[10px] text-gray-400">- BloodChain AI</span>
            </div>
          </div>

          {/* Login Form - Tighter spacing */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Donor ID
              </label>
              <div className="relative">
                <UserCircleIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={formData.donor_id}
                  onChange={(e) => setFormData({ ...formData, donor_id: e.target.value })}
                  className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-sm"
                  placeholder="e.g., D001"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <KeyIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember"
                  type="checkbox"
                  className="h-3.5 w-3.5 text-red-500 focus:ring-red-500 border-gray-300 rounded"
                />
                <label htmlFor="remember" className="ml-1.5 block text-xs text-gray-600">
                  Remember me
                </label>
              </div>
              <a href="#" className="text-xs text-red-500 hover:text-red-600 font-medium">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-2.5 px-4 rounded-lg font-medium hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group text-sm"
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </div>
              ) : (
                <>
                  <span>Continue to Dashboard</span>
                  <ArrowRightIcon className="ml-1.5 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Registration Link */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              New donor?{' '}
              <Link to="/donor/register" className="text-red-500 hover:text-red-600 font-medium hover:underline">
                Create your account
              </Link>
            </p>
          </div>

          {/* Impact Stats - Balanced */}
          <div className="mt-5 pt-4 border-t border-gray-100">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-gray-50 rounded-lg py-2">
                <p className="text-lg font-bold text-red-500">200+</p>
                <p className="text-[10px] text-gray-400">Active Donors</p>
              </div>
              <div className="bg-gray-50 rounded-lg py-2">
                <p className="text-lg font-bold text-red-500">1.5k</p>
                <p className="text-[10px] text-gray-400">Lives Saved</p>
              </div>
              <div className="bg-gray-50 rounded-lg py-2">
                <p className="text-lg font-bold text-red-500">15</p>
                <p className="text-[10px] text-gray-400">Blood Banks</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <p className="mt-4 text-center text-[10px] text-gray-400">
          By signing in, you agree to our{' '}
          <a href="#" className="text-gray-500 hover:text-red-500">Terms</a> and{' '}
          <a href="#" className="text-gray-500 hover:text-red-500">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
};

export default DonorLogin;