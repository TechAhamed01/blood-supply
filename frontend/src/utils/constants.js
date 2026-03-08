export const BLOOD_GROUPS = ['O+', 'A+', 'B+', 'O-', 'A-', 'AB+', 'B-', 'AB-'];

export const USER_ROLES = {
  ADMIN: 'ADMIN',
  HOSPITAL: 'HOSPITAL',
  BLOODBANK: 'BLOODBANK'
};

export const ALLOCATION_STATUS = {
  PENDING: 'PENDING',
  PARTIALLY_FULFILLED: 'PARTIALLY_FULFILLED',
  FULFILLED: 'FULFILLED',
  CANCELLED: 'CANCELLED'
};

export const API_ENDPOINTS = {
  LOGIN: '/auth/login/',
  REFRESH: '/auth/refresh/',
  HOSPITALS: '/hospitals/',
  BLOODBANKS: '/bloodbanks/',
  INVENTORY: '/inventory/',
  ALLOCATION_REQUESTS: '/allocation/requests/',
  DEMAND_FORECAST: '/ai/demand-forecast/',
  SHORTAGE_RISKS: '/ai/shortage-risks/',
  DELIVERY_TIME: '/ai/delivery-time/'
};

export const CHART_COLORS = [
  '#ef4444', '#3b82f6', '#10b981', '#f59e0b', 
  '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'
];