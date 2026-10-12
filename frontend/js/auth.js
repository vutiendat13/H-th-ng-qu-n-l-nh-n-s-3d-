const Auth = {
  getToken() {
    return localStorage.getItem('hdp_token');
  },
  
  getUser() {
    try {
      return JSON.parse(localStorage.getItem('hdp_user') || 'null');
    } catch (e) {
      return null;
    }
  },
  
  isAuthenticated() {
    return !!this.getToken();
  },
  
  hasRole(...roles) {
    const user = this.getUser();
    return user && roles.includes(user.role);
  },
  
  isAdmin() {
    return this.hasRole('ADMIN');
  },
  
  isHR() {
    return this.hasRole('ADMIN', 'HR');
  },
  
  async login(username, password) {
    try {
      const result = await api.post('/auth/login', { username, password });
      if (result.success && result.data) {
        api.setToken(result.data.token);
        localStorage.setItem('hdp_user', JSON.stringify(result.data.user));
        return { success: true };
      }
      return { success: false, message: 'Đăng nhập thất bại' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },
  
  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.warn('Logout API failed, forcing local logout', error);
    } finally {
      api.clearToken();
      window.location.href = '/pages/login.html';
    }
  },
  
  requireAuth() {
    if (!this.isAuthenticated()) {
      window.location.href = '/pages/login.html';
      return false;
    }
    return true;
  }
};
