import axios from 'axios';

export const AUTH_TOKEN_KEY = 'access_token';

const baseURL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1';

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export const getAuthToken = (): string | null => {
  return localStorage.getItem(AUTH_TOKEN_KEY);
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
};

api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeAuthToken();
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    } else {
      let message = 'Não foi possível completar a operação.';
      let title = 'Erro';

      if (error.response?.status === 403) {
        title = 'Ação Não Permitida';
        message = error.response.data?.detail || 'Você não tem permissão para realizar esta ação.';
      } else if (error.response?.status === 404) {
        title = 'Não Encontrado';
        message = error.response.data?.detail || 'O recurso solicitado não foi encontrado.';
      } else if (error.response?.status === 422) {
        title = 'Dados Inválidos';
        const detail = error.response.data?.detail;
        if (Array.isArray(detail)) {
          message = detail.map((d: { msg?: string }) => d.msg).filter(Boolean).join('; ') || 'Verifique os dados enviados.';
        } else if (typeof detail === 'string') {
          message = detail;
        }
      } else if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        message = typeof detail === 'string' ? detail : JSON.stringify(detail);
      } else if (error.message === 'Network Error') {
        title = 'Falha de Conexão';
        message = 'Não foi possível conectar ao servidor. Verifique sua conexão.';
      } else if (error.message) {
        message = error.message;
      }

      window.dispatchEvent(
        new CustomEvent('app:toast', {
          detail: {
            type: 'error',
            title,
            message,
          },
        })
      );
    }
    return Promise.reject(error);
  }
);

export default api;
