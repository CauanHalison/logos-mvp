import type { Incident, IncidentFilterParams } from '../types';
import {
  INCIDENT_CATEGORY_LABELS,
  CRITICITY_LABELS,
  STATUS_LABELS,
} from '../types';
import {
  AlertTriangle,
  Filter,
  Plus,
  Eye,
  Edit2,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { formatToBrasilia } from '../utils';

interface IncidentTableProps {
  incidents: Incident[];
  loading: boolean;
  error: string | null;
  filters: IncidentFilterParams;
  onOpenDetails: (incident: Incident) => void;
  onOpenEdit: (incident: Incident) => void;
  onDelete: (id: string) => void;
  onNewIncident: () => void;
}

export function IncidentTable({
  incidents,
  loading,
  error,
  filters,
  onOpenDetails,
  onOpenEdit,
  onDelete,
  onNewIncident,
}: IncidentTableProps) {
  const { user } = useAuth();
  const hasFilter = !!(
    filters.truck_plate ||
    filters.status ||
    filters.criticity ||
    filters.category
  );

  return (
    <section style={styles.tableCard}>
      {error && (
        <div style={styles.errorBox}>
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div style={styles.loadingContainer}>
          <div className="spinner" />
          <p style={{ color: '#94a3b8', marginTop: '12px' }}>
            Sincronizando dados da central...
          </p>
        </div>
      ) : incidents.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>
            <Filter size={32} color="#64748b" />
          </div>
          <h3 style={styles.emptyTitle}>Nenhum incidente encontrado</h3>
          <p style={styles.emptyText}>
            {hasFilter
              ? 'Nenhum resultado com os filtros selecionados. Tente ajustar a busca.'
              : 'Nenhuma ocorrência registrada no sistema. Clique abaixo para iniciar.'}
          </p>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={onNewIncident}
            style={{ marginTop: '16px' }}
          >
            <Plus size={16} /> Cadastrar Incidente
          </button>
        </div>
      ) : (
        <div style={styles.tableResponsive}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thRow}>
                <th style={styles.th}>Placa</th>
                <th style={styles.th}>Ocorrência / Título</th>
                <th style={styles.th}>Motorista</th>
                <th style={styles.th}>Categoria</th>
                <th style={styles.th}>Criticidade</th>
                <th style={styles.thStatus}>Status</th>
                <th style={styles.th}>Data/Hora</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map((inc) => {
                const isAberto = inc.status === 'aberto';
                const isResponsibleOperator = !!(inc.operator && user && inc.operator.id === user.id);
                const canEdit = isAberto || isResponsibleOperator;

                return (
                  <tr key={inc.id} style={styles.tr}>
                    <td style={styles.td}>
                      <span style={styles.plateTag}>{inc.truck_plate}</span>
                    </td>

                    <td style={styles.td}>
                      <strong style={styles.incidentTitle}>{inc.title}</strong>
                      {inc.description && (
                        <p style={styles.incidentDescPreview}>
                          {inc.description.length > 60
                            ? `${inc.description.substring(0, 60)}...`
                            : inc.description}
                        </p>
                      )}
                    </td>

                    <td style={styles.td}>
                      <div style={styles.driverInfo}>
                        <span style={styles.driverNameText}>{inc.driver_name}</span>
                      </div>
                    </td>

                    <td style={styles.td}>
                      <span style={styles.categoryText}>
                        {INCIDENT_CATEGORY_LABELS[inc.category] || inc.category}
                      </span>
                    </td>

                    <td style={styles.td}>
                      <span className={`badge badge-${inc.criticity}`}>
                        {inc.criticity === 'alta' && <span className="pulse-dot" />}
                        {CRITICITY_LABELS[inc.criticity]}
                      </span>
                    </td>

                    <td style={styles.tdStatus}>
                      <span className={`badge badge-${inc.status}`}>
                        {STATUS_LABELS[inc.status]}
                      </span>
                      {inc.operator && (
                        <span style={styles.operatorText}>
                          Op: {inc.operator.name}
                        </span>
                      )}
                    </td>

                    <td style={styles.td}>
                      <span style={styles.dateText}>
                        {formatToBrasilia(inc.created_at, {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </td>

                    <td style={{ ...styles.td, textAlign: 'right' }}>
                      <div style={styles.actionButtons}>
                        <button
                          type="button"
                          style={styles.iconActionBtn}
                          onClick={() => onOpenDetails(inc)}
                          title="Ver detalhes completos"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          type="button"
                          style={{
                            ...styles.iconActionBtn,
                            ...(canEdit ? {} : styles.disabledActionBtn),
                          }}
                          onClick={() => {
                            if (canEdit) {
                              onOpenEdit(inc);
                            }
                          }}
                          disabled={!canEdit}
                          title={
                            canEdit
                              ? 'Editar ocorrência'
                              : inc.operator
                                ? `Edição restrita ao operador responsável (${inc.operator.name})`
                                : 'Edição restrita ao operador responsável'
                          }
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          type="button"
                          style={{
                            ...styles.iconActionBtn,
                            ...(canEdit ? {} : styles.disabledActionBtn),
                          }}
                          onClick={() => {
                            if (canEdit && window.confirm('Deseja realmente excluir esta ocorrência?')) {
                              onDelete(inc.id);
                            }
                          }}
                          disabled={!canEdit}
                          title={
                            canEdit
                              ? 'Excluir ocorrência'
                              : inc.operator
                                ? `Exclusão restrita ao operador responsável (${inc.operator.name})`
                                : 'Exclusão restrita ao operador responsável'
                          }
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

const styles: Record<string, React.CSSProperties> = {
  tableCard: {
    backgroundColor: '#131c2e',
    border: '1px solid #1e293b',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
  },
  errorBox: {
    padding: '16px',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderBottom: '1px solid rgba(239, 68, 68, 0.25)',
    color: '#f87171',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  loadingContainer: {
    padding: '60px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    padding: '60px 20px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    backgroundColor: '#162032',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
  },
  emptyTitle: {
    fontSize: '1.125rem',
    fontWeight: '700',
    color: '#ffffff',
    margin: '0 0 6px',
  },
  emptyText: {
    fontSize: '0.875rem',
    color: '#94a3b8',
    maxWidth: '400px',
    margin: 0,
  },
  tableResponsive: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  thRow: {
    backgroundColor: '#101726',
    borderBottom: '1px solid #1e293b',
  },
  th: {
    padding: '14px 18px',
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  thStatus: {
    padding: '14px 18px',
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    width: '180px',
    minWidth: '180px',
  },
  tr: {
    borderBottom: '1px solid rgba(30, 41, 59, 0.6)',
    transition: 'background-color 0.15s ease',
  },
  td: {
    padding: '14px 18px',
    fontSize: '0.875rem',
    verticalAlign: 'middle',
  },
  tdStatus: {
    padding: '14px 18px',
    fontSize: '0.875rem',
    verticalAlign: 'middle',
    minWidth: '180px',
    whiteSpace: 'nowrap',
  },
  plateTag: {
    display: 'inline-block',
    padding: '4px 10px',
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    border: '1px solid rgba(59, 130, 246, 0.3)',
    borderRadius: '6px',
    color: '#60a5fa',
    fontFamily: 'monospace',
    fontWeight: '700',
    fontSize: '0.9rem',
    letterSpacing: '0.06em',
  },
  incidentTitle: {
    color: '#f8fafc',
    display: 'block',
    fontSize: '0.9375rem',
  },
  incidentDescPreview: {
    color: '#64748b',
    fontSize: '0.8125rem',
    margin: '3px 0 0',
  },
  driverInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  driverNameText: {
    fontWeight: '600',
    color: '#e2e8f0',
  },
  driverPhoneText: {
    fontSize: '0.75rem',
    color: '#64748b',
  },
  categoryText: {
    color: '#cbd5e1',
    fontSize: '0.8125rem',
  },
  dateText: {
    color: '#64748b',
    fontSize: '0.8125rem',
    whiteSpace: 'nowrap',
  },
  actionButtons: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '6px',
  },
  iconActionBtn: {
    padding: '6px',
    borderRadius: '6px',
    color: '#94a3b8',
    transition: 'all 0.15s ease',
  },
  disabledActionBtn: {
    opacity: 0.3,
    cursor: 'not-allowed',
    color: '#475569',
  },
  operatorText: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    display: 'block',
    marginTop: '3px',
    fontWeight: '500',
  },
};

export default IncidentTable;
