import { useState, useEffect, useCallback } from 'react';
import { incidentService } from '../services';
import type {
  Incident,
  IncidentCreatePayload,
  IncidentUpdatePayload,
  IncidentFilterParams,
  PaginatedResponse,
} from '../types';

export const useIncidents = (initialParams?: IncidentFilterParams) => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [pagination, setPagination] = useState<PaginatedResponse<Incident> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState<number>(0);
  const [filters, setFiltersState] = useState<IncidentFilterParams>({
    page: 1,
    size: 10,
    status: '',
    criticity: '',
    category: '',
    truck_plate: '',
    ...initialParams,
  });

  const fetchIncidents = useCallback(async (paramsToUse?: IncidentFilterParams) => {
    try {
      setLoading(true);
      setError(null);
      const params = paramsToUse || filters;
      const data = await incidentService.list(params);
      setIncidents(data.items);
      setPagination(data);
    } catch {
      setError('Não foi possível carregar a lista de incidentes.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    let active = true;
    incidentService
      .list(filters)
      .then((data) => {
        if (active) {
          setIncidents(data.items);
          setPagination(data);
          setError(null);
        }
      })
      .catch(() => {
        if (active) {
          setError('Não foi possível carregar a lista de incidentes.');
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [filters, reloadKey]);

  const setFilter = (key: keyof IncidentFilterParams, value: unknown) => {
    setLoading(true);
    setFiltersState((prev) => ({
      ...prev,
      [key]: value,
      page: key === 'page' ? (value as number) : 1,
    }));
  };

  const resetFilters = () => {
    setLoading(true);
    setFiltersState({
      page: 1,
      size: 10,
      status: '',
      criticity: '',
      category: '',
      truck_plate: '',
    });
  };

  const setPage = (page: number) => {
    setFilter('page', page);
  };

  const createIncident = async (payload: IncidentCreatePayload): Promise<Incident> => {
    const created = await incidentService.create(payload);
    setReloadKey((prev) => prev + 1);
    return created;
  };

  const updateIncident = async (
    id: string,
    payload: IncidentUpdatePayload
  ): Promise<Incident> => {
    const updated = await incidentService.update(id, payload);
    setReloadKey((prev) => prev + 1);
    return updated;
  };

  const deleteIncident = async (id: string): Promise<void> => {
    await incidentService.delete(id);
    setReloadKey((prev) => prev + 1);
  };

  return {
    incidents,
    pagination,
    loading,
    error,
    filters,
    setFilter,
    resetFilters,
    setPage,
    fetchIncidents,
    createIncident,
    updateIncident,
    deleteIncident,
  };
};

export default useIncidents;
