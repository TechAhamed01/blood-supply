import React from 'react';

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">About BloodChain AI</h1>
          
          <div className="prose max-w-none">
            <p className="text-lg text-gray-700 mb-4">
              BloodChain AI is a revolutionary platform that leverages artificial intelligence 
              to optimize blood supply chain management. Our mission is to ensure that every 
              patient has access to the right blood type at the right time.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">Key Features</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>AI-powered demand forecasting for proactive inventory management</li>
              <li>Smart allocation algorithm considering distance, stock, and expiry</li>
              <li>Real-time shortage risk detection and alerts</li>
              <li>Role-based access for hospitals, blood banks, and administrators</li>
              <li>Comprehensive tracking and traceability</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">Our Technology</h2>
            <p className="text-gray-700 mb-4">
              Built with cutting-edge technologies including Django REST Framework, 
              React, and machine learning models for accurate predictions. The system 
              processes historical data to identify patterns and optimize blood distribution.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;