import api from './api';

class BloodBankService {
  async getAllBloodBanks() {
    try {
      const response = await api.get('/bloodbanks/');
      console.log('Raw bloodbanks response:', response.data);
      
      if (response.data && typeof response.data === 'object') {
        if (response.data.results && Array.isArray(response.data.results)) {
          return response.data.results;
        }
        if (Array.isArray(response.data)) {
          return response.data;
        }
        const values = Object.values(response.data);
        if (values.length > 0 && Array.isArray(values)) {
          return values;
        }
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching blood banks:', error);
      throw error;
    }
  }

  async getBloodBankById(id) {
    const response = await api.get(`/bloodbanks/${id}/`);
    return response.data;
  }

  async getBloodBankProfile() {
    const response = await api.get('/bloodbanks/profile/');
    return response.data;
  }
}

export default new BloodBankService();