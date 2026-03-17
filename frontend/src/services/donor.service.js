import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const donorApi = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

donorApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('donorAccessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

class DonorService {
  async login(donor_id, password) {
    const response = await donorApi.post('/donors/login/', { donor_id, password });
    if (response.data.access) {
      localStorage.setItem('donorAccessToken', response.data.access);
      localStorage.setItem('donorRefreshToken', response.data.refresh);
      localStorage.setItem('donor', JSON.stringify(response.data.donor));
    }
    return response.data;
  }

  logout() {
    localStorage.removeItem('donorAccessToken');
    localStorage.removeItem('donorRefreshToken');
    localStorage.removeItem('donor');
  }

  getCurrentDonor() {
    const donor = localStorage.getItem('donor');
    return donor ? JSON.parse(donor) : null;
  }

  async getDashboard() {
    const response = await donorApi.get('/donors/dashboard/');
    return response.data;
  }

  async getHistory() {
    const response = await donorApi.get('/donors/history/');
    return response.data;
  }

  async getNotifications() {
    const response = await donorApi.get('/donors/notifications/');
    return response.data;
  }

  async markNotificationRead(id) {
    const response = await donorApi.post(`/donors/notifications/${id}/read/`);
    return response.data;
  }

  async getNearbyBanks() {
    const response = await donorApi.get('/donors/nearby-banks/');
    return response.data;
  }
}

export default new DonorService();