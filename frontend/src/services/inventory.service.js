import api from './api';

class InventoryService {
  async getInventory(params = {}) {
    try {
      const response = await api.get('/inventory/', { params });
      console.log('Raw inventory response:', response.data); // Debug log
      
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
        // If it's an object but not paginated, maybe it's a single item?
        // Return empty array with warning
        console.warn('Unexpected inventory response format:', response.data);
        return [];
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching inventory:', error);
      throw error;
    }
  }

  async createInventoryItem(data) {
    const response = await api.post('/inventory/', data);
    return response.data;
  }

  async updateInventoryItem(id, data) {
    const response = await api.put(`/inventory/${id}/`, data);
    return response.data;
  }

  async deleteInventoryItem(id) {
    const response = await api.delete(`/inventory/${id}/`);
    return response.data;
  }

  async getExpiringBatches(days = 7) {
    const response = await api.get('/inventory/expiring/', { params: { days } });
    // Handle paginated response
    if (response.data && response.data.results) {
      return response.data.results;
    }
    return response.data;
  }
}

export default new InventoryService();