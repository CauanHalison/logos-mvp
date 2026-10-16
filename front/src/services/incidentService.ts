import api from './api';
import type {
  Incident,
  IncidentCreatePayload,
  IncidentUpdatePayload,
  IncidentFilterParams,
  IncidentOptions,
  PaginatedResponse,
} from '../types';

export const incidentService = {
  async list(params?: IncidentFilterParams): Promise<PaginatedResponse<Incident>> {
    const cleanedParams: Record<string, unknown> = {};
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          cleanedParams[key] = value;
        }
      });
    }

    const response = await api.get<PaginatedResponse<Incident>>('/incidents', {
      params: cleanedParams,
    });
    return response.data;
  },

  async getById(id: string): Promise<Incident> {
    const response = await api.get<Incident>(`/incidents/${id}`);
    return response.data;
  },

  async create(payload: IncidentCreatePayload): Promise<Incident> {
    const response = await api.post<Incident>('/incidents', payload);
    return response.data;
  },

  async update(id: string, payload: IncidentUpdatePayload): Promise<Incident> {
    const response = await api.put<Incident>(`/incidents/${id}`, payload);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/incidents/${id}`);
  },

  async getOptions(): Promise<IncidentOptions> {
    const response = await api.get<IncidentOptions>('/incidents/options');
    return response.data;
  },
};

export default incidentService;
