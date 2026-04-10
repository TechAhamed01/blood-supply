import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PrivateRoute from '../components/common/PrivateRoute';
import Navbar from '../components/common/Navbar';

// Auth Pages
import Login from '../pages/auth/Login';
import Unauthorized from '../pages/auth/Unauthorized';

// Donor Pages
import DonorLogin from '../pages/donor/DonorLogin';
import DonorRegister from '../pages/donor/DonorRegister';
import DonorDashboard from '../pages/donor/DonorDashboard';
import DonationHistory from '../pages/donor/DonationHistory';
import Notifications from '../pages/donor/Notifications';
import NearbyBloodBanks from '../pages/donor/NearbyBloodBanks';
import DonorPrivateRoute from '../components/common/DonorPrivateRoute';

// Hospital Pages
import HospitalDashboard from '../pages/hospital/HospitalDashboard';
import RequestBlood from '../pages/hospital/RequestBlood';
import MyRequests from '../pages/hospital/MyRequests';
import RequestDetail from '../pages/hospital/RequestDetail';
import DemandForecast from '../pages/hospital/DemandForecast';
import HospitalProfile from '../pages/hospital/HospitalProfile';

// Blood Bank Pages
import BloodBankDashboard from '../pages/bloodbank/BloodBankDashboard';
import InventoryManagement from '../pages/bloodbank/InventoryManagement';
import PendingRequests from '../pages/bloodbank/PendingRequests';
import FulfillRequest from '../pages/bloodbank/FulfillRequest';
import BloodBankProfile from '../pages/bloodbank/BloodBankProfile';
import AddInventory from '../pages/bloodbank/AddInventory';
import DonorManagement from '../pages/bloodbank/DonorManagement';
import FulfillmentHistory from '../pages/bloodbank/FulfillmentHistory';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import AllHospitals from '../pages/admin/AllHospitals';
import AllBloodBanks from '../pages/admin/AllBloodBanks';
import Allocations from '../pages/admin/Allocations';
import ShortageRisks from '../pages/admin/ShortageRisks';

// Shared Pages
import Home from '../pages/shared/Home';
import About from '../pages/shared/About';
import Contact from '../pages/shared/Contact';
import Profile from '../pages/shared/Profile';
import Settings from '../pages/shared/Settings';

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

        {/* Donor Routes */}
        <Route path="/donor">
          <Route path="login" element={<DonorLogin />} />
          <Route path="register" element={<DonorRegister />} />
          <Route path="dashboard" element={
            <DonorPrivateRoute>
              <DonorDashboard />
            </DonorPrivateRoute>
          } />
          <Route path="history" element={
            <DonorPrivateRoute>
              <DonationHistory />
            </DonorPrivateRoute>
          } />
          <Route path="notifications" element={
            <DonorPrivateRoute>
              <Notifications />
            </DonorPrivateRoute>
          } />
          <Route path="nearby-banks" element={
            <DonorPrivateRoute>
              <NearbyBloodBanks />
            </DonorPrivateRoute>
          } />
        </Route>

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
          <Route path="inventory/add" element={
            <PrivateRoute requiredRole="BLOODBANK">
              <AddInventory />
            </PrivateRoute>
          } />
          <Route path="donor-management" element={
            <PrivateRoute requiredRole="BLOODBANK">
              <DonorManagement />
            </PrivateRoute>
          } />
          <Route path="pending-requests" element={
            <PrivateRoute requiredRole="BLOODBANK">
              <PendingRequests />
            </PrivateRoute>
          } />
          <Route path="history" element={
            <PrivateRoute requiredRole="BLOODBANK">
              <FulfillmentHistory />
            </PrivateRoute>
          } />
          <Route path="requests/:id" element={
            <PrivateRoute requiredRole="BLOODBANK">
              <FulfillRequest />
            </PrivateRoute>
          } />
          <Route path="profile" element={
            <PrivateRoute requiredRole="HOSPITAL">
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
          <Route path="shortage-risks" element={
            <PrivateRoute requiredRole="ADMIN">
              <ShortageRisks />
            </PrivateRoute>
          } />
        </Route>

        {/* Shared Protected Routes */}
        <Route path="/profile" element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        } />
        <Route path="/settings" element={
          <PrivateRoute>
            <Settings />
          </PrivateRoute>
        } />
      </Routes>
    </>
  );
};

export default AppRouter;