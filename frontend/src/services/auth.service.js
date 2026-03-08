import api from './api';

class AuthService {
  async login(username, password) {
    try {
      const response = await api.post('/auth/login/', {
        username,
        password,
      });
      
      if (response.data.access) {
        localStorage.setItem('accessToken', response.data.access);
        localStorage.setItem('refreshToken', response.data.refresh);
        
        // Decode token to get user info
        const tokenData = JSON.parse(atob(response.data.access.split('.')[1]));
        localStorage.setItem('userRole', tokenData.role);
        localStorage.setItem('userId', tokenData.user_id);
        localStorage.setItem('hospitalId', tokenData.hospital_id || '');
        localStorage.setItem('bloodbankId', tokenData.bloodbank_id || '');
        
        return response.data;
      }
    } catch (error) {
      throw error;
    }
  }

  logout() {
    localStorage.clear();
    window.location.href = '/login';
  }

  getCurrentUser() {
    return {
      role: localStorage.getItem('userRole'),
      userId: localStorage.getItem('userId'),
      hospitalId: localStorage.getItem('hospitalId'),
      bloodbankId: localStorage.getItem('bloodbankId'),
    };
  }

  isAuthenticated() {
    return !!localStorage.getItem('accessToken');
  }

  hasRole(role) {
    return this.getCurrentUser().role === role;
  }
}

export default new AuthService();