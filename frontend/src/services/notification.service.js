import api from './api';

class NotificationService {
  async getNotifications(isRead = false) {
    const response = await api.get(`/notifications/?is_read=${isRead}`);
    return Array.isArray(response.data.results) ? response.data.results : (Array.isArray(response.data) ? response.data : []);
  }

  async markAsRead(id) {
    const response = await api.post(`/notifications/${id}/read/`);
    return response.data;
  }

  async markAllAsRead() {
    const response = await api.post('/notifications/read-all/');
    return response.data;
  }
}

export default new NotificationService();
