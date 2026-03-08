import React, { createContext, useContext, useState } from 'react';

const AlertContext = createContext();

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);

  const addAlert = (message, type = 'info', duration = 5000) => {
    const id = Date.now();
    setAlerts(prev => [...prev, { id, message, type, duration }]);
    
    if (duration > 0) {
      setTimeout(() => removeAlert(id), duration);
    }
  };

  const removeAlert = (id) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const success = (message, duration) => addAlert(message, 'success', duration);
  const error = (message, duration) => addAlert(message, 'error', duration);
  const warning = (message, duration) => addAlert(message, 'warning', duration);
  const info = (message, duration) => addAlert(message, 'info', duration);

  return (
    <AlertContext.Provider value={{ alerts, addAlert, removeAlert, success, error, warning, info }}>
      {children}
    </AlertContext.Provider>
  );
};