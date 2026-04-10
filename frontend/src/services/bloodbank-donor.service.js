import api from './api';

class BloodBankDonorService {
  async getDonors() {
    const response = await api.get('/donors/bloodbank-donors/');
    return response.data;
  }

  async sendNotification(data) {
    const response = await api.post('/donors/send-notification/', data);
    return response.data;
  }
}

export default new BloodBankDonorService();