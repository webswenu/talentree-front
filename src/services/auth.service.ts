import apiService from './api.service';
import type { LoginDto, AuthResponse } from '../types/user.types';

class AuthService {
  async login(credentials: LoginDto): Promise<AuthResponse> {
    const { data } = await apiService.post<AuthResponse>('/auth/login', credentials);

    // Guardar tokens en localStorage
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));

    return data;
  }

  async logout(): Promise<void> {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  async getCurrentUser() {
    const { data } = await apiService.get('/auth/me');
    return data;
  }

  getStoredUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  getToken() {
    return localStorage.getItem('accessToken');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export default new AuthService();
