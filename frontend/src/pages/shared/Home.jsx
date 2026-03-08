import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

const Home = () => {
  const { isAuthenticated, hasRole } = useAuth();

  const getDashboardLink = () => {
    if (!isAuthenticated) return '/login';
    if (hasRole('ADMIN')) return '/admin';
    if (hasRole('HOSPITAL')) return '/hospital';
    if (hasRole('BLOODBANK')) return '/bloodbank';
    return '/login';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      {/* Hero Section */}
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-4">
              AI-Powered Blood Supply
              <span className="text-primary-600"> Chain Management</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Revolutionizing blood donation and distribution with artificial intelligence. 
              Real-time tracking, demand prediction, and smart allocation.
            </p>
            <Link
              to={getDashboardLink()}
              className="inline-flex items-center px-8 py-4 bg-blood text-white rounded-lg text-lg font-semibold hover:bg-blood-dark transition transform hover:scale-105"
            >
              Get Started
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
          </div>

          {/* Stats Section */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">24/7</div>
              <div className="text-gray-600">Real-time Monitoring</div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">AI Powered</div>
              <div className="text-gray-600">Demand Prediction</div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">100%</div>
              <div className="text-gray-600">Traceability</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;