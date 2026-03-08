import api from './api';

class HospitalService {
  async getAllHospitals() {
    try {
      const response = await api.get('/hospitals/');
      console.log('Raw hospitals response:', response.data); // Debug log
      
      // Handle paginated response (Django REST Framework default)
      if (response.data && typeof response.data === 'object') {
        // Check if it's a paginated response with results array
        if (response.data.results && Array.isArray(response.data.results)) {
          return response.data.results;
        }
        // Check if it's a direct array
        if (Array.isArray(response.data)) {
          return response.data;
        }
        // If it's an object with numeric keys (like a dictionary)
        const values = Object.values(response.data);
        if (values.length > 0 && Array.isArray(values)) {
          return values;
        }
      }
      
      console.warn('Unexpected hospitals response format:', response.data);
      return [];
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      throw error;
    }
  }

  async getHospitalById(id) {
    const response = await api.get(`/hospitals/${id}/`);
    return response.data;
  }

  async getHospitalProfile() {
    const response = await api.get('/hospitals/profile/');
    return response.data;
  }

  async updateHospital(id, data) {
    const response = await api.put(`/hospitals/${id}/`, data);
    return response.data;
  }
}

export default new HospitalService();