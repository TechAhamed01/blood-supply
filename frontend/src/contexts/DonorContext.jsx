import React, { createContext, useContext, useState, useEffect } from 'react';
import donorService from '../services/donor.service';

const DonorContext = createContext();

export const useDonor = () => {
  const context = useContext(DonorContext);
  if (!context) {
    throw new Error('useDonor must be used within DonorProvider');
  }
  return context;
};

export const DonorProvider = ({ children }) => {
  const [donor, setDonor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = donorService.getCurrentDonor();
    if (stored) setDonor(stored);
    setLoading(false);
  }, []);

  const login = async (donor_id, password) => {
    const data = await donorService.login(donor_id, password);
    setDonor(data.donor);
    return data;
  };

  const logout = () => {
    donorService.logout();
    setDonor(null);
  };

  return (
    <DonorContext.Provider value={{ donor, loading, login, logout }}>
      {children}
    </DonorContext.Provider>
  );
};