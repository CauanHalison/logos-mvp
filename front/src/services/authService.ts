import api, { setAuthToken, removeAuthToken } from './api';
import type { User, Token, LoginPayload, RegisterPayload } from '../types';

export const authService = {
  async login(payload: LoginPayload): Promise<Token> {
    const response = await api.post<Token>('/auth/login', payload);
    setAuthToken(response.data.access_token);
    return response.data;
  },

  async register(payload: RegisterPayload): Promise<User> {
    const response = await api.post<User>('/auth/register', payload);
    return response.data;
  },

  async getMe(): Promise<User> {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },

  logout(): void {
    removeAuthToken();
  },
};

export default authService;
