class ApiClient {
  constructor() {
    this.baseURL = '/api';
    this.token = localStorage.getItem('hdp_token');
  }

  getHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async request(method, endpoint, data = null, params = null) {
    let url = `${this.baseURL}${endpoint}`;
    
    if (params) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, value);
        }
      }
      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    const options = {
      method,
      headers: this.getHeaders(),
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      
      if (response.status === 401) {
        this.clearToken();
        window.location.href = '/pages/login.html';
        throw new Error('Unauthorized');
      }
      
      if (response.status === 403) {
        if (window.Toast) {
          Toast.error('Bạn không có quyền thực hiện thao tác này');
        }
        throw new Error('Forbidden');
      }

      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Có lỗi xảy ra từ máy chủ');
      }

      return result;
    } catch (error) {
      console.error(`API Error [${method} ${endpoint}]:`, error);
      throw error;
    }
  }

  async get(endpoint, params) { return this.request('GET', endpoint, null, params); }
  async post(endpoint, data) { return this.request('POST', endpoint, data); }
  async put(endpoint, data) { return this.request('PUT', endpoint, data); }
  async delete(endpoint) { return this.request('DELETE', endpoint); }

  setToken(token) {
    this.token = token;
    localStorage.setItem('hdp_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('hdp_token');
    localStorage.removeItem('hdp_user');
  }
}

const api = new ApiClient();
