import { useState, useMemo } from 'react';
import { useAuth, useIncidents, useIncidentOptions } from '../hooks';
import type { Incident, Status, IncidentCreatePayload, IncidentUpdatePayload } from '../types';
import {
  Navbar,
  KpiCards,
  IncidentFilters,
  IncidentTable,
  Pagination,
  IncidentModal,
  IncidentDetailsModal,
} from '../components';

export function DashboardPage() {
  const { user, logout } = useAuth();
  const {
    incidents,
    pagination,
    loading,
    error,
    filters,
    setFilter,
    resetFilters,
    createIncident,
    updateIncident,
    deleteIncident,
  } = useIncidents();

  const { options } = useIncidentOptions();

  const [modalOpen, setModalOpen] = useState(false);
  const [incidentToEdit, setIncidentToEdit] = useState<Incident | null>(null);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  const kpiStats = useMemo(() => {
    const total = pagination?.total || incidents.length;
    const abertos = incidents.filter((i) => i.status === 'aberto').length;
    const emInvestigacao = incidents.filter((i) => i.status === 'em_investigacao').length;
    const criticos = incidents.filter((i) => i.criticity === 'alta').length;

    return { total, abertos, emInvestigacao, criticos };
  }, [pagination, incidents]);

  const handleOpenCreate = () => {
    setIncidentToEdit(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (incident: Incident) => {
    const isAberto = incident.status === 'aberto';
    const isResponsibleOperator = !!(incident.operator && user && incident.operator.id === user.id);
    if (!isAberto && !isResponsibleOperator) {
      return;
    }
    setIncidentToEdit(incident);
    setModalOpen(true);
  };

  const handleOpenDetails = (incident: Incident) => {
    setSelectedIncident(incident);
    setDetailsOpen(true);
  };

  const handleSubmitModal = async (
    data: IncidentCreatePayload | IncidentUpdatePayload,
    isEdit: boolean
  ) => {
    if (isEdit && incidentToEdit) {
      const updated = await updateIncident(incidentToEdit.id, data as IncidentUpdatePayload);
      if (selectedIncident?.id === updated.id) {
        setSelectedIncident(updated);
      }
    } else {
      await createIncident(data as IncidentCreatePayload);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: Status) => {
    const updated = await updateIncident(id, { status: newStatus });
    if (selectedIncident?.id === id) {
      setSelectedIncident(updated);
    }
  };

  return (
    <div style={styles.page}>
      <Navbar user={user} onLogout={logout} />

      <main style={styles.main}>
        <KpiCards stats={kpiStats} />

        <IncidentFilters
          filters={filters}
          options={options}
          onFilterChange={setFilter}
          onReset={resetFilters}
          onNewIncident={handleOpenCreate}
        />

        <IncidentTable
          incidents={incidents}
          loading={loading}
          error={error}
          filters={filters}
          onOpenDetails={handleOpenDetails}
          onOpenEdit={handleOpenEdit}
          onDelete={deleteIncident}
          onNewIncident={handleOpenCreate}
        />

        {pagination && (
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.pages}
            totalItems={pagination.total}
            onPageChange={(page) => setFilter('page', page)}
            disabled={loading}
          />
        )}
      </main>

      <IncidentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmitModal}
        incidentToEdit={incidentToEdit}
        options={options}
      />

      <IncidentDetailsModal
        isOpen={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        incident={selectedIncident}
        onEdit={handleOpenEdit}
        onDelete={deleteIncident}
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
