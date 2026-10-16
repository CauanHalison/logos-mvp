import { useState, useEffect, useCallback } from 'react';
import { incidentService } from '../services';
import type { IncidentOptions } from '../types';

export const useIncidentOptions = () => {
  const [options, setOptions] = useState<IncidentOptions | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOptions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await incidentService.getOptions();
      setOptions(data);
    } catch {
      setError('Falha ao carregar as opções de incidentes.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    incidentService
      .getOptions()
      .then((data) => {
        if (active) {
          setOptions(data);
          setError(null);
        }
      })
      .catch(() => {
        if (active) {
          setError('Falha ao carregar as opções de incidentes.');
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
  }, []);

  return {
    options,
    loading,
    error,
    refreshOptions: fetchOptions,
  };
};

export default useIncidentOptions;
