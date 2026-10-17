import { useState } from 'react';
import type { Incident, Status } from '../types';
import {
  INCIDENT_CATEGORY_LABELS,
  CRITICITY_LABELS,
  STATUS_LABELS,
} from '../types';
import { useAuth } from '../hooks/useAuth';
import { formatToBrasilia } from '../utils';
import {
  X,
  Truck,
  User,
  MapPin,
  Calendar,
  ExternalLink,
  Edit2,
  Trash2,
  CheckCircle,
  Clock,
  HelpCircle,
  ShieldAlert,
} from 'lucide-react';

interface IncidentDetailsModalProps {
  incident: Incident | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (incident: Incident) => void;
  onDelete: (id: string) => Promise<void>;
  onUpdateStatus: (id: string, newStatus: Status) => Promise<void>;
}

export function IncidentDetailsModal({
  incident,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onUpdateStatus,
}: IncidentDetailsModalProps) {
  const { user } = useAuth();
  const [updating, setUpdating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!isOpen || !incident) return null;

  const isAberto = incident.status === 'aberto';
  const isResponsibleOperator = !!(incident.operator && user && incident.operator.id === user.id);
  const canEdit = isAberto || isResponsibleOperator;

  const handleStatusChange = async (newStatus: Status) => {
    if (!canEdit || newStatus === incident.status) return;
    setUpdating(true);
    try {
      await onUpdateStatus(incident.id, newStatus);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setUpdating(true);
    try {
      await onDelete(incident.id);
      onClose();
    } finally {
      setUpdating(false);
      setConfirmDelete(false);
    }
  };

  const googleMapsUrl = `https://www.google.com/maps?q=${incident.latitude},${incident.longitude}`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <div>
            <div style={styles.badgeRow}>
              <span className={`badge badge-${incident.criticity}`}>
                <span className="pulse-dot" />
                {CRITICITY_LABELS[incident.criticity]}
              </span>
              <span className={`badge badge-${incident.status}`}>
                {STATUS_LABELS[incident.status]}
              </span>
            </div>
            <h2 style={styles.title}>{incident.title}</h2>
          </div>
          <button type="button" onClick={onClose} style={styles.closeBtn}>
            <X size={20} />
          </button>
        </div>

        <div style={styles.body}>
          <div style={styles.section}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={styles.sectionLabel}>Atualizar Status da Ocorrência:</label>
              {!canEdit && (
                <span style={{ fontSize: '0.75rem', color: '#f59e0b' }}>
                  Restrito ao operador {incident.operator?.name ?? 'responsável'}
                </span>
              )}
            </div>
            <div style={styles.statusButtons}>
              <button
                type="button"
                className={`btn btn-sm ${incident.status === 'aberto' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => handleStatusChange('aberto')}
                disabled={updating || !canEdit}
              >
                <ShieldAlert size={14} /> Aberto
              </button>
              <button
                type="button"
                className={`btn btn-sm ${incident.status === 'em_investigacao' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => handleStatusChange('em_investigacao')}
                disabled={updating || !canEdit}
              >
                <Clock size={14} /> Em Investigação
              </button>
              <button
                type="button"
                className={`btn btn-sm ${incident.status === 'fechado' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => handleStatusChange('fechado')}
                disabled={updating || !canEdit}
              >
                <CheckCircle size={14} /> Fechado
              </button>
              <button
                type="button"
                className={`btn btn-sm ${incident.status === 'inconclusivo' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => handleStatusChange('inconclusivo')}
                disabled={updating || !canEdit}
              >
                <HelpCircle size={14} /> Inconclusivo
              </button>
            </div>
          </div>

          <div style={styles.infoGrid}>
            <div style={styles.infoCard}>
              <span style={styles.infoLabel}>
                <Truck size={14} /> Placa do Veículo
              </span>
              <span style={styles.infoValueMono}>{incident.truck_plate}</span>
            </div>

            <div style={styles.infoCard}>
              <span style={styles.infoLabel}>
                <User size={14} /> Motorista Responsável
              </span>
              <span style={styles.infoValue}>{incident.driver_name}</span>
            </div>

            <div style={styles.infoCard}>
              <span style={styles.infoLabel}>
                <User size={14} /> Operador Responsável
              </span>
              <span style={styles.infoValue}>{incident.operator?.name ?? 'Sem Operador'}</span>
            </div>

            <div style={styles.infoCard}>
              <span style={styles.infoLabel}>Categoria</span>
              <span style={styles.infoValue}>
                {INCIDENT_CATEGORY_LABELS[incident.category] || incident.category}
              </span>
            </div>
          </div>

          <div style={styles.locationCard}>
            <div style={styles.locationInfo}>
              <MapPin size={20} color="#3b82f6" />
              <div>
                <span style={styles.infoLabel}>Coordenadas GPS</span>
                <p style={styles.coordinates}>
                  Lat: {incident.latitude.toFixed(6)} | Long: {incident.longitude.toFixed(6)}
                </p>
              </div>
            </div>
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-sm"
              style={styles.mapLinkBtn}
            >
              <ExternalLink size={14} /> Ver no Mapa
            </a>
          </div>

          {incident.description && (
            <div style={styles.section}>
              <span style={styles.sectionLabel}>Relato da Ocorrência:</span>
              <div style={styles.descriptionBox}>
                <p>{incident.description}</p>
              </div>
            </div>
          )}

          <div style={styles.timestamps}>
            <span>
              <Calendar size={13} /> Registrado em: {formatToBrasilia(incident.created_at)}
            </span>
            {incident.updated_at && (
              <span>
                Última atualização: {formatToBrasilia(incident.updated_at)}
              </span>
            )}
          </div>
        </div>

        <div style={styles.footer}>
          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={handleDelete}
            disabled={updating || !canEdit}
            title={
              canEdit
                ? 'Excluir ocorrência'
                : incident.operator
                  ? `Exclusão restrita ao operador responsável (${incident.operator.name})`
                  : 'Exclusão restrita ao operador responsável'
            }
          >
            <Trash2 size={16} />
            {confirmDelete ? 'Confirmar Exclusão?' : 'Excluir Ocorrência'}
          </button>

          <div style={styles.footerRight}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                if (canEdit) {
                  onEdit(incident);
                }
              }}
              disabled={updating || !canEdit}
              title={
                canEdit
                  ? 'Editar dados da ocorrência'
                  : incident.operator
                    ? `Edição restrita ao operador responsável (${incident.operator.name})`
                    : 'Edição restrita ao operador responsável'
              }
            >
              <Edit2 size={16} /> Editar Dados
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={onClose}>
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  header: {
    padding: '24px',
    borderBottom: '1px solid #1e293b',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  badgeRow: {
    display: 'flex',
    gap: '8px',
    marginBottom: '10px',
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#ffffff',
    margin: 0,
  },
  closeBtn: {
    color: '#94a3b8',
    padding: '6px',
    borderRadius: '6px',
  },
  body: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  sectionLabel: {
    fontSize: '0.8125rem',
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  statusButtons: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '12px',
  },
  infoCard: {
    backgroundColor: '#0e1524',
    border: '1px solid #1e293b',
    borderRadius: '10px',
    padding: '12px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  infoLabel: {
    fontSize: '0.75rem',
    color: '#64748b',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  infoValue: {
    fontSize: '0.9375rem',
    fontWeight: '600',
    color: '#f8fafc',
  },
  infoValueMono: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#3b82f6',
    fontFamily: 'monospace',
    letterSpacing: '0.06em',
  },
  locationCard: {
    backgroundColor: '#0e1524',
    border: '1px solid #1e293b',
    borderRadius: '10px',
    padding: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px',
  },
  locationInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  coordinates: {
    fontSize: '0.875rem',
    color: '#e2e8f0',
    fontFamily: 'monospace',
    margin: 0,
  },
  mapLinkBtn: {
    padding: '6px 12px',
    fontSize: '0.8125rem',
  },
  descriptionBox: {
    backgroundColor: '#0e1524',
    border: '1px solid #1e293b',
    borderRadius: '10px',
    padding: '14px',
    fontSize: '0.9rem',
    color: '#cbd5e1',
    lineHeight: '1.6',
  },
  timestamps: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.75rem',
    color: '#64748b',
    paddingTop: '8px',
    borderTop: '1px solid #1e293b',
  },
  footer: {
    padding: '16px 24px',
    borderTop: '1px solid #1e293b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0e1524',
  },
  footerRight: {
    display: 'flex',
    gap: '10px',
  },
};

export default IncidentDetailsModal;
