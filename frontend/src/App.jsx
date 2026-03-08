import React from 'react';
import AppRouter from './router';
import Footer from './components/common/Footer';
import { useAlert } from './contexts/AlertContext';

function App() {
  const { alerts } = useAlert();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Alert Container */}
      <div className="fixed top-20 right-4 z-50 space-y-2">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`px-4 py-3 rounded-lg shadow-lg animate-slide-in ${
              alert.type === 'success' ? 'bg-green-500' :
              alert.type === 'error' ? 'bg-red-500' :
              alert.type === 'warning' ? 'bg-yellow-500' :
              'bg-blue-500'
            } text-white`}
          >
            {alert.message}
          </div>
        ))}
      </div>

      <AppRouter />
      <Footer />
    </div>
  );
}

export default App;