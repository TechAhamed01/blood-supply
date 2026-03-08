import api from './api';

class AllocationService {
  async getAllRequests(params = {}) {
    const response = await api.get('/allocation/requests/', { params });
    // Handle paginated response
    if (response.data && response.data.results) {
      return response.data.results;
    }
    // Fallback to direct array
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
    const response = await api.get(`/allocation/requests/${id}/`);
    return response.data;
  }

  async fulfillRequest(id) {
    const response = await api.post(`/allocation/requests/${id}/fulfill/`);
    return response.data;
  }

  async getHospitalRequests() {
    try {
      const response = await api.get('/allocation/requests/');
      console.log('Raw API response:', response.data); 
      
      if (response.data && typeof response.data === 'object') {
        if (response.data.results && Array.isArray(response.data.results)) {
          return response.data.results;
        }
        if (Array.isArray(response.data)) {
          return response.data;
        }
        console.warn('Unexpected response format:', response.data);
        return [];
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching hospital requests:', error);
      throw error;
    }
  }

  /**
   * Fetches only requests with PENDING status.
   * Includes robust handling for DRF pagination and catch-all error recovery.
   */
  async getPendingRequests() {
    try {
      const response = await api.get('/allocation/requests/?status=PENDING');
      console.log('Pending requests response:', response.data);
      
      let requests = [];
      if (response.data && typeof response.data === 'object') {
        // Handle Django REST Framework paginated results
        if (response.data.results && Array.isArray(response.data.results)) {
          requests = response.data.results;
        } 
        // Handle standard JSON array response
        else if (Array.isArray(response.data)) {
          requests = response.data;
        }
      }
      
      // Note: Proximity logic is handled on the backend as per current implementation
      return requests;
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      // Return empty array instead of throwing to prevent dashboard UI crashes
      return [];
    }
  }
}

export default new AllocationService();