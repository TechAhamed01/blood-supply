import api from './api';

class AllocationService {
  async getAllRequests(params = {}) {
    const response = await api.get('/allocation/requests/', { params });
    // Standardizing pagination check
    return this._handlePaginatedData(response.data);
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
      return this._handlePaginatedData(response.data);
    } catch (error) {
      console.error('Error fetching hospital requests:', error);
      return [];
    }
  }

  async getPendingRequests() {
    try {
      const response = await api.get('/allocation/requests/', { 
        params: { status: 'PENDING' } 
      });
      return this._handlePaginatedData(response.data);
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      return [];
    }
  }

  /**
   * New Method: Fetch requests fulfilled today for a specific blood bank
   */
  async getTodaysFulfilledRequests() {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const response = await api.get('/allocation/requests/', {
        params: {
          status: 'FULFILLED',
          allocated_at__date: today,
          bloodbank_id: localStorage.getItem('bloodbankId')
        }
      });
      
      console.log('Today\'s fulfilled requests:', response.data);
      return this._handlePaginatedData(response.data);
    } catch (error) {
      console.error('Error fetching today\'s fulfilled requests:', error);
      return [];
    }
  }

  /**
   * Private helper to handle Django Rest Framework pagination vs Array responses
   */
  _handlePaginatedData(data) {
    if (data && typeof data === 'object') {
      if (data.results && Array.isArray(data.results)) {
        return data.results;
      }
      if (Array.isArray(data)) {
        return data;
      }
    }
    return [];
  }
}

export default new AllocationService();