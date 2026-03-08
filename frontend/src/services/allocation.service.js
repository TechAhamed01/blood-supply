import api from './api';

class AllocationService {
  async getAllRequests(params = {}) {
    const response = await api.get('/allocation/requests/', { params });
    if (response.data && response.data.results) {
      return response.data.results;
    }
    return response.data;
  }

  async createRequest(data) {
    const requestData = {
      blood_group: data.blood_group,
      units_requested: data.units_requested,
      emergency_flag: data.emergency_flag || false,
      notes: data.notes || '',
      hospital: data.hospital_id
    };
    
    const response = await api.post('/allocation/requests/', requestData);
    return response.data;
  }

  async getRequestById(id) {
    try {
      const response = await api.get(`/allocation/requests/${id}/`);
      console.log('Request detail with assigned banks:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching request details:', error);
      throw error;
    }
  }

  async fulfillRequest(id) {
    const response = await api.post(`/allocation/requests/${id}/fulfill/`);
    return response.data;
  }

  async getHospitalRequests() {
    try {
      const response = await api.get('/allocation/requests/');
      
      if (response.data && typeof response.data === 'object') {
        if (response.data.results && Array.isArray(response.data.results)) {
          return response.data.results;
        }
        if (Array.isArray(response.data)) {
          return response.data;
        }
      }
      return [];
    } catch (error) {
      console.error('Error fetching hospital requests:', error);
      return [];
    }
  }

  async getPendingRequests() {
    try {
      const response = await api.get('/allocation/requests/?status=PENDING');
      
      if (response.data && response.data.results) {
        return response.data.results;
      }
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      return [];
    }
  }
}

export default new AllocationService();