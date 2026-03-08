import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PrivateRoute from '../components/common/PrivateRoute';
import Navbar from '../components/common/Navbar';

// Auth Pages
import Login from '../pages/auth/Login';
import Unauthorized from '../pages/auth/Unauthorized';

// Hospital Pages
import HospitalDashboard from '../pages/hospital/HospitalDashboard';
import RequestBlood from '../pages/hospital/RequestBlood';
import MyRequests from '../pages/hospital/MyRequests';
import DemandForecast from '../pages/hospital/DemandForecast';
import HospitalProfile from '../pages/hospital/HospitalProfile';
import RequestDetail from '../pages/hospital/RequestDetail'; // new

// Blood Bank Pages
import BloodBankDashboard from '../pages/bloodbank/BloodBankDashboard';
import InventoryManagement from '../pages/bloodbank/InventoryManagement';
import PendingRequests from '../pages/bloodbank/PendingRequests';
import FulfillRequest from '../pages/bloodbank/FulfillRequest';
import BloodBankProfile from '../pages/bloodbank/BloodBankProfile';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import AllHospitals from '../pages/admin/AllHospitals';
import AllBloodBanks from '../pages/admin/AllBloodBanks';
import Allocations from '../pages/admin/Allocations';
import ShortageRisks from '../pages/admin/ShortageRisks';
import AllocationDetail from '../pages/admin/AllocationDetail'; // new

// Shared Pages
import Home from '../pages/shared/Home';
import About from '../pages/shared/About';
import Contact from '../pages/shared/Contact';

const AppRouter = () => {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Hospital Routes */}
        <Route path="/hospital">
          <Route index element={
            <PrivateRoute requiredRole="HOSPITAL">
              <HospitalDashboard />
            </PrivateRoute>
          } />
          <Route path="request-blood" element={
            <PrivateRoute requiredRole="HOSPITAL">
              <RequestBlood />
            </PrivateRoute>
          } />
          <Route path="my-requests" element={
            <PrivateRoute requiredRole="HOSPITAL">
              <MyRequests />
            </PrivateRoute>
          } />
          <Route path="requests/:id" element={
            <PrivateRoute requiredRole="HOSPITAL">
              <RequestDetail />
            </PrivateRoute>
          } />
          <Route path="demand-forecast" element={
            <PrivateRoute requiredRole="HOSPITAL">
              <DemandForecast />
            </PrivateRoute>
          } />
          <Route path="profile" element={
            <PrivateRoute requiredRole="HOSPITAL">
              <HospitalProfile />
            </PrivateRoute>
          } />
        </Route>

        {/* Blood Bank Routes */}
        <Route path="/bloodbank">
          <Route index element={
            <PrivateRoute requiredRole="BLOODBANK">
              <BloodBankDashboard />
            </PrivateRoute>
          } />
          <Route path="inventory" element={
            <PrivateRoute requiredRole="BLOODBANK">
              <InventoryManagement />
            </PrivateRoute>
          } />
          <Route path="pending-requests" element={
            <PrivateRoute requiredRole="BLOODBANK">
              <PendingRequests />
            </PrivateRoute>
          } />
          <Route path="requests/:id" element={
            <PrivateRoute requiredRole="BLOODBANK">
              <FulfillRequest />
            </PrivateRoute>
          } />
          <Route path="profile" element={
            <PrivateRoute requiredRole="BLOODBANK">
              <BloodBankProfile />
            </PrivateRoute>
          } />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin">
          <Route index element={
            <PrivateRoute requiredRole="ADMIN">
              <AdminDashboard />
            </PrivateRoute>
          } />
          <Route path="hospitals" element={
            <PrivateRoute requiredRole="ADMIN">
              <AllHospitals />
            </PrivateRoute>
          } />
          <Route path="bloodbanks" element={
            <PrivateRoute requiredRole="ADMIN">
              <AllBloodBanks />
            </PrivateRoute>
          } />
          <Route path="allocations" element={
            <PrivateRoute requiredRole="ADMIN">
              <Allocations />
            </PrivateRoute>
          } />
          <Route path="allocations/:id" element={
            <PrivateRoute requiredRole="ADMIN">
              <AllocationDetail />
            </PrivateRoute>
          } />
          <Route path="shortage-risks" element={
            <PrivateRoute requiredRole="ADMIN">
              <ShortageRisks />
            </PrivateRoute>
          } />
        </Route>
      </Routes>
    </>
  );
};

export default AppRouter;