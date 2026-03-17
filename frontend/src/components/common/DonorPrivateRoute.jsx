import React from 'react';
import { Navigate } from 'react-router-dom';
import { useDonor } from '../../contexts/DonorContext';
import Loader from './Loader';

const DonorPrivateRoute = ({ children }) => {
  const { donor, loading } = useDonor();

  if (loading) {
    return <Loader />;
  }

  if (!donor) {
    return <Navigate to="/donor/login" replace />;
  }

  return children;
};

export default DonorPrivateRoute;