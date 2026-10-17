import { useState, useEffect } from 'react';
import type { IncidentFilterParams, IncidentOptions } from '../types';
import { Search, RotateCcw, Plus } from 'lucide-react';

interface IncidentFiltersProps {
  filters: IncidentFilterParams;
  options: IncidentOptions | null;
  onFilterChange: (key: keyof IncidentFilterParams, value: unknown) => void;
  onReset: () => void;
  onNewIncident: () => void;
}

export function IncidentFilters({
  filters,
  options,
  onFilterChange,
  onReset,
  onNewIncident,
}: IncidentFiltersProps) {
  const [localPlate, setLocalPlate] = useState(filters.truck_plate || '');
  const [prevTruckPlate, setPrevTruckPlate] = useState(filters.truck_plate || '');

  if ((filters.truck_plate || '') !== prevTruckPlate) {
    setPrevTruckPlate(filters.truck_plate || '');
    setLocalPlate(filters.truck_plate || '');
  }

  useEffect(() => {
    const handler = setTimeout(() => {
      if (localPlate !== (filters.truck_plate || '')) {
        onFilterChange('truck_plate', localPlate);
      }
    }, 350);

    return () => clearTimeout(handler);
  }, [localPlate, filters.truck_plate, onFilterChange]);

  const hasActiveFilters = !!(
    filters.truck_plate ||
    filters.status ||
    filters.criticity ||
    filters.category
  );

  return (
    <section style={styles.controlBar}>
      <div style={styles.filtersWrapper}>
        <div style={styles.searchBox}>
          <Search size={18} style={styles.searchIcon} />
          <input
            type="text"
            className="form-input"
            style={{ ...styles.searchInput, textTransform: 'uppercase' }}
            placeholder="Filtrar por placa (ex: ABC1D23)..."
            value={localPlate}
            onChange={(e) => setLocalPlate(e.target.value.toUpperCase())}
          />
        </div>

        <div style={styles.selectWrapper}>
          <select
            className="form-select"
            style={styles.selectInput}
            value={filters.status || ''}
            onChange={(e) => onFilterChange('status', e.target.value)}
          >
            <option value="">Status: Todos</option>
            {options?.statuses.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.selectWrapper}>
          <select
            className="form-select"
            style={styles.selectInput}
            value={filters.criticity || ''}
            onChange={(e) => onFilterChange('criticity', e.target.value)}
          >
            <option value="">Criticidade: Todas</option>
            {options?.criticities.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.selectWrapper}>
          <select
            className="form-select"
            style={styles.selectInput}
            value={filters.category || ''}
            onChange={(e) => onFilterChange('category', e.target.value)}
          >
            <option value="">Categoria: Todas</option>
            {options?.categories.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onReset}
            title="Limpar todos os filtros"
          >
            <RotateCcw size={15} /> Limpar
          </button>
        )}
      </div>

      <button
        type="button"
        className="btn btn-primary"
        onClick={onNewIncident}
        style={styles.newIncidentBtn}
      >
        <Plus size={18} /> Novo Incidente
      </button>
    </section>
  );
};

const styles: Record<string, React.CSSProperties> = {
  controlBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    flexWrap: 'wrap',
  },
  filtersWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
    flex: 1,
  },
  searchBox: {
    position: 'relative',
    minWidth: '260px',
    flex: 1,
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#64748b',
    pointerEvents: 'none',
  },
  searchInput: {
    paddingLeft: '38px',
  },
  selectWrapper: {
    minWidth: '160px',
  },
  selectInput: {
    fontSize: '0.875rem',
    padding: '10px 14px',
  },
  newIncidentBtn: {
    padding: '10px 20px',
    fontSize: '0.9rem',
  },
};

export default IncidentFilters;
