import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth, useIncidents, useIncidentOptions } from '../hooks';
import { incidentService } from '../services';
import type {
  Incident,
  Status,
  Criticity,
  IncidentCategory,
  IncidentFilterParams,
  IncidentCreatePayload,
  IncidentUpdatePayload,
} from '../types';
import {
  Navbar,
  KpiCards,
  StatsDistributionPanel,
  IncidentFilters,
  IncidentTable,
  Pagination,
  IncidentModal,
  IncidentDetailsModal,
} from '../components';

export function DashboardPage() {
  const { user, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const filters: IncidentFilterParams = useMemo(() => {
    const pageParam = Number(searchParams.get('page'));
    return {
      page: pageParam > 0 ? pageParam : 1,
      size: 10,
      status: (searchParams.get('status') as Status) || '',
      criticity: (searchParams.get('criticity') as Criticity) || '',
      category: (searchParams.get('category') as IncidentCategory) || '',
      truck_plate: searchParams.get('truck_plate') || '',
    };
  }, [searchParams]);

  const {
    incidents,
    pagination,
    stats,
    loading,
    error,
    createIncident,
    updateIncident,
    deleteIncident,
  } = useIncidents(filters);

  const { options } = useIncidentOptions();

  const modalParam = searchParams.get('modal');
  const incidentIdParam = searchParams.get('incidentId');

  const [fetchedIncident, setFetchedIncident] = useState<Incident | null>(null);

  const handleCloseModal = useCallback(() => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('modal');
      next.delete('incidentId');
      return next;
    });
  }, [setSearchParams]);

  useEffect(() => {
    if (!incidentIdParam) return;
    if (incidents.some((i) => i.id === incidentIdParam)) return;

    let active = true;
    incidentService
      .getById(incidentIdParam)
      .then((data) => {
        if (active) {
          setFetchedIncident(data);
        }
      })
      .catch(() => {
        if (active) {
          handleCloseModal();
        }
      });

    return () => {
      active = false;
    };
  }, [incidentIdParam, incidents, handleCloseModal]);

  const activeIncident = useMemo(() => {
    if (!incidentIdParam) return null;
    return incidents.find((i) => i.id === incidentIdParam) || fetchedIncident;
  }, [incidentIdParam, incidents, fetchedIncident]);

  const handleFilterChange = (key: keyof IncidentFilterParams, value: unknown) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);

        if (value !== undefined && value !== null && value !== '' && !(key === 'page' && value === 1)) {
          next.set(key, String(value));
        } else {
          next.delete(key);
        }

        if (key !== 'page') {
          next.delete('page');
        }

        return next;
      },
      { replace: true }
    );
  };

  const handleResetFilters = () => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams();
        const currentModal = prev.get('modal');
        const currentIncidentId = prev.get('incidentId');
        if (currentModal) next.set('modal', currentModal);
        if (currentIncidentId) next.set('incidentId', currentIncidentId);
        return next;
      },
      { replace: true }
    );
  };

  const handleOpenCreate = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('modal', 'novo');
      next.delete('incidentId');
      return next;
    });
  };

  const handleOpenEdit = (incident: Incident) => {
    const isAberto = incident.status === 'aberto';
    const isResponsibleOperator = !!(incident.operator && user && incident.operator.id === user.id);
    if (!isAberto && !isResponsibleOperator) {
      return;
    }
    setFetchedIncident(incident);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('modal', 'editar');
      next.set('incidentId', incident.id);
      return next;
    });
  };

  const handleOpenDetails = (incident: Incident) => {
    setFetchedIncident(incident);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('modal');
      next.set('incidentId', incident.id);
      return next;
    });
  };

  const handleSubmitModal = async (
    data: IncidentCreatePayload | IncidentUpdatePayload,
    isEdit: boolean
  ) => {
    if (isEdit && incidentIdParam) {
      const updated = await updateIncident(incidentIdParam, data as IncidentUpdatePayload);
      setFetchedIncident(updated);
      handleCloseModal();
    } else {
      await createIncident(data as IncidentCreatePayload);
      handleCloseModal();
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: Status) => {
    const updated = await updateIncident(id, { status: newStatus });
    setFetchedIncident(updated);
  };

  const handleDeleteIncident = async (id: string) => {
    await deleteIncident(id);
    if (incidentIdParam === id) {
      handleCloseModal();
    }
  };

  const isCreateOpen = modalParam === 'novo';
  const isEditOpen = modalParam === 'editar' && !!activeIncident;
  const isModalOpen = isCreateOpen || isEditOpen;
  const incidentToEdit = isEditOpen ? activeIncident : null;

  const isDetailsOpen = !modalParam && !!incidentIdParam && !!activeIncident;

  return (
    <div style={styles.page}>
      <Navbar user={user} onLogout={logout} />

      <main style={styles.main}>
        <KpiCards stats={stats} />
        <StatsDistributionPanel stats={stats} />

        <IncidentFilters
          filters={filters}
          options={options}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
          onNewIncident={handleOpenCreate}
        />

        <IncidentTable
          incidents={incidents}
          loading={loading}
          error={error}
          filters={filters}
          onOpenDetails={handleOpenDetails}
          onOpenEdit={handleOpenEdit}
          onDelete={handleDeleteIncident}
          onNewIncident={handleOpenCreate}
        />

        {pagination && (
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.pages}
            totalItems={pagination.total}
            onPageChange={(page) => handleFilterChange('page', page)}
            disabled={loading}
          />
        )}
      </main>

      <IncidentModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitModal}
        incidentToEdit={incidentToEdit}
        options={options}
      />

      <IncidentDetailsModal
        isOpen={isDetailsOpen}
        onClose={handleCloseModal}
        incident={activeIncident}
        onEdit={handleOpenEdit}
        onDelete={handleDeleteIncident}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#0a0e17',
    color: '#f8fafc',
  },
  main: {
    maxWidth: '1440px',
    margin: '0 auto',
    padding: '32px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
};

export default DashboardPage;
