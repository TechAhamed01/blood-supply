import api from './api';

class AIService {
  async getDemandForecast(hospitalId, bloodGroup) {
    const response = await api.get('/ai/demand-forecast/', {
      params: { hospital_id: hospitalId, blood_group: bloodGroup }
    });
    return response.data;
  }

  async getShortageRisks() {
    const response = await api.get('/ai/shortage-risks/');
    return response.data;
  }

  async estimateDeliveryTime(bloodbankId, hospitalId) {
    const response = await api.post('/ai/delivery-time/', {
      bloodbank_id: bloodbankId,
      hospital_id: hospitalId
    });
    return response.data;
  }
}

export default new AIService();