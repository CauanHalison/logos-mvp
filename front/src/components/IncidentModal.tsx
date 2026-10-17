import { useState } from 'react';
import type {
  Incident,
  IncidentCreatePayload,
  IncidentUpdatePayload,
  IncidentCategory,
  Criticity,
  Status,
  IncidentOptions,
} from '../types';
import {
  X,
  Truck,
  User,
  MapPin,
  AlertTriangle,
  FileText,
  Tag,
  Shield,
  Clock,
} from 'lucide-react';

interface IncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    data: IncidentCreatePayload | IncidentUpdatePayload,
    isEdit: boolean
  ) => Promise<void>;
  incidentToEdit?: Incident | null;
  options: IncidentOptions | null;
}

function IncidentModalForm({
  onClose,
  onSubmit,
  incidentToEdit,
  options,
}: Omit<IncidentModalProps, 'isOpen'>) {
  const isEdit = !!incidentToEdit;

  const [truckPlate, setTruckPlate] = useState(incidentToEdit?.truck_plate ?? '');
  const [driverName, setDriverName] = useState(incidentToEdit?.driver_name ?? '');
  const operatorName = incidentToEdit?.operator?.name ?? '';
  const [title, setTitle] = useState(incidentToEdit?.title ?? '');
  const [description, setDescription] = useState(incidentToEdit?.description ?? '');
  const [category, setCategory] = useState<IncidentCategory>(
    incidentToEdit?.category ?? 'problema_mecanico'
  );
  const [criticity, setCriticity] = useState<Criticity>(incidentToEdit?.criticity ?? 'media');
  const [status, setStatus] = useState<Status>(incidentToEdit?.status ?? 'aberto');
  const [latitude, setLatitude] = useState<string>(
    incidentToEdit ? incidentToEdit.latitude.toString() : '-23.5505'
  );
  const [longitude, setLongitude] = useState<string>(
    incidentToEdit ? incidentToEdit.longitude.toString() : '-46.6333'
  );

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || lat < -90 || lat > 90) {
      setErrorMessage('A latitude deve ser um número válido entre -90 e 90.');
      return;
    }
    if (isNaN(lng) || lng < -180 || lng > 180) {
      setErrorMessage('A longitude deve ser um número válido entre -180 e 180.');
      return;
    }

    if (!truckPlate.trim() || !driverName.trim() || !title.trim()) {
      setErrorMessage('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setSubmitting(true);
    try {
      if (isEdit) {
        await onSubmit(
          {
            truck_plate: truckPlate.trim().toUpperCase(),
            driver_name: driverName.trim(),
            title: title.trim(),
            description: description.trim() || undefined,
            category,
            criticity,
            status,
            latitude: lat,
            longitude: lng,
          },
          true
        );
      } else {
        await onSubmit(
          {
            truck_plate: truckPlate.trim().toUpperCase(),
            driver_name: driverName.trim(),
            title: title.trim(),
            description: description.trim() || undefined,
            category,
            criticity,
            latitude: lat,
            longitude: lng,
          },
          false
        );
      }
      onClose();
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosErr = err as {
          response?: { data?: { detail?: string; erros?: Array<{ mensagem: string }> } };
        };
        const detail = axiosErr.response?.data?.detail;
        const erros = axiosErr.response?.data?.erros;
        if (detail) {
          setErrorMessage(detail);
        } else if (erros && erros.length > 0) {
          setErrorMessage(erros.map((e) => e.mensagem).join(' | '));
        } else {
          setErrorMessage('Erro ao salvar o incidente.');
        }
      } else {
        setErrorMessage('Não foi possível salvar o incidente.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <div style={styles.header}>
        <div style={styles.headerTitle}>
          <AlertTriangle size={22} color="#3b82f6" />
          <h2>{isEdit ? 'Editar Ocorrência' : 'Registrar Novo Incidente'}</h2>
        </div>
        <button type="button" onClick={onClose} style={styles.closeBtn}>
          <X size={20} />
        </button>
      </div>

      {errorMessage && (
        <div style={styles.errorAlert}>
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.grid2}>
          <div className="form-group">
            <label className="form-label" htmlFor="truckPlate">
              Placa do Caminhão *
            </label>
            <div style={styles.inputIconWrapper}>
              <Truck size={16} style={styles.icon} />
              <input
                id="truckPlate"
                type="text"
                className="form-input"
                style={{ ...styles.inputWithIcon, fontFamily: 'monospace', textTransform: 'uppercase' }}
                placeholder="ABC1D23"
                maxLength={8}
                value={truckPlate}
                onChange={(e) => setTruckPlate(e.target.value.toUpperCase())}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="driverName">
              Nome do Motorista *
            </label>
            <div style={styles.inputIconWrapper}>
              <User size={16} style={styles.icon} />
              <input
                id="driverName"
                type="text"
                className="form-input"
                style={styles.inputWithIcon}
                placeholder="Nome completo"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        <div style={styles.grid2}>
          {isEdit && (<div className="form-group">
            <label className="form-label" htmlFor="operatorName">
              Operador Responsável
            </label>
            <div style={styles.inputIconWrapper}>
              <User size={16} style={styles.icon} />
              <input
                id="operatorName"
                type="text"
                className="form-input"
                style={styles.inputWithIcon}
                placeholder="Sem Operador Responsável"
                value={operatorName}
                disabled
              />
            </div>
          </div>)}

          <div className="form-group">
            <label className="form-label" htmlFor="title">
              Título do Incidente *
            </label>
            <div style={styles.inputIconWrapper}>
              <FileText size={16} style={styles.icon} />
              <input
                id="title"
                type="text"
                className="form-input"
                style={styles.inputWithIcon}
                placeholder="Ex: Pneu estourado na serra"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        <div style={styles.grid2}>
          <div className="form-group">
            <label className="form-label" htmlFor="category">
              Categoria *
            </label>
            <div style={styles.inputIconWrapper}>
              <Tag size={16} style={styles.icon} />
              <select
                id="category"
                className="form-select"
                style={styles.inputWithIcon}
                value={category}
                onChange={(e) => setCategory(e.target.value as IncidentCategory)}
              >
                {options?.categories ? (
                  options.categories.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="problema_mecanico">Problema mecânico</option>
                    <option value="acidente_com_veiculo">Acidente com veículo</option>
                    <option value="acidente_com_vitimas">Acidente com vítimas</option>
                    <option value="clima_atipico">Condição Climática Atípica</option>
                    <option value="bloqueio_de_pista">Bloqueio de pista</option>
                  </>
                )}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="criticity">
              Criticidade *
            </label>
            <div style={styles.inputIconWrapper}>
              <Shield size={16} style={styles.icon} />
              <select
                id="criticity"
                className="form-select"
                style={styles.inputWithIcon}
                value={criticity}
                onChange={(e) => setCriticity(e.target.value as Criticity)}
              >
                {options?.criticities ? (
                  options.criticities.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="baixa">Baixa</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta</option>
                  </>
                )}
              </select>
            </div>
          </div>
        </div>

        {isEdit && (
          <div className="form-group">
            <label className="form-label" htmlFor="status">
              Status Atual *
            </label>
            <div style={styles.inputIconWrapper}>
              <Clock size={16} style={styles.icon} />
              <select
                id="status"
                className="form-select"
                style={styles.inputWithIcon}
                value={status}
                onChange={(e) => setStatus(e.target.value as Status)}
              >
                {options?.statuses ? (
                  options.statuses.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="aberto">Aberto</option>
                    <option value="em_investigacao">Em Investigação</option>
                    <option value="fechado">Fechado</option>
                    <option value="inconclusivo">Inconclusivo</option>
                  </>
                )}
              </select>
            </div>
          </div>
        )}

        <div style={styles.grid2}>
          <div className="form-group">
            <label className="form-label" htmlFor="latitude">
              Latitude GPS (-90 a 90) *
            </label>
            <div style={styles.inputIconWrapper}>
              <MapPin size={16} style={styles.icon} />
              <input
                id="latitude"
                type="text"
                className="form-input"
                style={styles.inputWithIcon}
                placeholder="-23.5505"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="longitude">
              Longitude GPS (-180 a 180) *
            </label>
            <div style={styles.inputIconWrapper}>
              <MapPin size={16} style={styles.icon} />
              <input
                id="longitude"
                type="text"
                className="form-input"
                style={styles.inputWithIcon}
                placeholder="-46.6333"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="description">
            Descrição Detalhada da Ocorrência
          </label>
          <textarea
            id="description"
            className="form-textarea"
            rows={3}
            placeholder="Descreva o que aconteceu, condições da via, providências tomadas..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div style={styles.footer}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={submitting}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? (
              <div className="spinner spinner-sm" />
            ) : isEdit ? (
              'Salvar Alterações'
            ) : (
              'Registrar Incidente'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export function IncidentModal({
  isOpen,
  onClose,
  onSubmit,
  incidentToEdit,
  options,
}: IncidentModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <IncidentModalForm
        key={incidentToEdit?.id ?? 'new'}
        onClose={onClose}
        onSubmit={onSubmit}
        incidentToEdit={incidentToEdit}
        options={options}
      />
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  header: {
    padding: '20px 24px',
    borderBottom: '1px solid #1e293b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  closeBtn: {
    color: '#94a3b8',
    padding: '6px',
    borderRadius: '6px',
    transition: 'all 0.15s ease',
  },
  errorAlert: {
    margin: '16px 24px 0',
    padding: '10px 14px',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    color: '#f87171',
    borderRadius: '8px',
    fontSize: '0.875rem',
  },
  form: {
    padding: '20px 24px',
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  inputIconWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  icon: {
    position: 'absolute',
    left: '12px',
    color: '#64748b',
    pointerEvents: 'none',
  },
  inputWithIcon: {
    paddingLeft: '38px',
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '12px',
    paddingTop: '16px',
    borderTop: '1px solid #1e293b',
  },
};

export default IncidentModal;
