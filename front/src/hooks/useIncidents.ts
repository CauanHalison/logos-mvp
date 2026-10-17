import { useState, useEffect, useCallback } from 'react';
import { incidentService } from '../services';
import type {
  Incident,
  IncidentCreatePayload,
  IncidentUpdatePayload,
  IncidentFilterParams,
  PaginatedResponse,
  StatsResponse,
} from '../types';
import { STATUS_LABELS } from '../types';
import { useToast } from './useToast';

export const useIncidents = (externalFilters?: IncidentFilterParams) => {
  const { success } = useToast();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [pagination, setPagination] = useState<PaginatedResponse<Incident> | null>(null);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState<number>(0);
  const [internalFilters, setInternalFilters] = useState<IncidentFilterParams>({
    page: 1,
    size: 10,
    status: '',
    criticity: '',
    category: '',
    truck_plate: '',
  });

  const filters = externalFilters ?? internalFilters;

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

  const fetchStats = useCallback(async () => {
    try {
      const statsData = await incidentService.getStats();
      setStats(statsData);
    } catch (err) {
      void err;
    }
  }, []);

  useEffect(() => {
    let active = true;

    Promise.resolve().then(() => {
      if (active) {
        setLoading(true);
      }
    });

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

  useEffect(() => {
    let active = true;

    incidentService
      .getStats()
      .then((statsData) => {
        if (active) {
          setStats(statsData);
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [reloadKey]);

  const setFilter = (key: keyof IncidentFilterParams, value: unknown) => {
    setLoading(true);
    setInternalFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key === 'page' ? (value as number) : 1,
    }));
  };

  const resetFilters = () => {
    setLoading(true);
    setInternalFilters({
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
    success('Ocorrência cadastrada com sucesso!');
    return created;
  };

  const updateIncident = async (
    id: string,
    payload: IncidentUpdatePayload
  ): Promise<Incident> => {
    const updated = await incidentService.update(id, payload);
    setReloadKey((prev) => prev + 1);
    if (payload.status) {
      success(`Status alterado para ${STATUS_LABELS[payload.status]}!`);
    } else {
      success('Ocorrência atualizada com sucesso!');
    }
    return updated;
  };

  const deleteIncident = async (id: string): Promise<void> => {
    await incidentService.delete(id);
    setReloadKey((prev) => prev + 1);
    success('Ocorrência excluída com sucesso!');
  };

  return {
    incidents,
    pagination,
    stats,
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
    refreshStats: fetchStats,
  };
};

export default useIncidents;
