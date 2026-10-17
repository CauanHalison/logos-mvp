import { TrendingUp, AlertTriangle, Clock, CheckCircle } from 'lucide-react';

interface KpiStats {
  total: number;
  abertos: number;
  emInvestigacao: number;
  criticos: number;
}

interface KpiCardsProps {
  stats: KpiStats;
}

export function KpiCards({ stats }: KpiCardsProps) {
  return (
    <section style={styles.kpiGrid}>
      <div style={styles.kpiCard}>
        <div style={styles.kpiIconWrapper}>
          <TrendingUp size={22} color="#3b82f6" />
        </div>
        <div>
          <span style={styles.kpiLabel}>Total de Ocorrências</span>
          <p style={styles.kpiValue}>{stats.total}</p>
        </div>
      </div>

      <div style={{ ...styles.kpiCard, borderColor: 'rgba(239, 68, 68, 0.3)' }}>
        <div style={{ ...styles.kpiIconWrapper, backgroundColor: 'rgba(239, 68, 68, 0.15)' }}>
          <AlertTriangle size={22} color="#ef4444" />
        </div>
        <div>
          <span style={styles.kpiLabel}>Criticidade Alta</span>
          <p style={{ ...styles.kpiValue, color: '#ef4444' }}>{stats.criticos}</p>
        </div>
      </div>

      <div style={{ ...styles.kpiCard, borderColor: 'rgba(59, 130, 246, 0.3)' }}>
        <div style={{ ...styles.kpiIconWrapper, backgroundColor: 'rgba(59, 130, 246, 0.15)' }}>
          <Clock size={22} color="#3b82f6" />
        </div>
        <div>
          <span style={styles.kpiLabel}>Status Aberto</span>
          <p style={{ ...styles.kpiValue, color: '#3b82f6' }}>{stats.abertos}</p>
        </div>
      </div>

      <div style={{ ...styles.kpiCard, borderColor: 'rgba(168, 85, 247, 0.3)' }}>
        <div style={{ ...styles.kpiIconWrapper, backgroundColor: 'rgba(168, 85, 247, 0.15)' }}>
          <CheckCircle size={22} color="#a855f7" />
        </div>
        <div>
          <span style={styles.kpiLabel}>Em Investigação</span>
          <p style={{ ...styles.kpiValue, color: '#a855f7' }}>{stats.emInvestigacao}</p>
        </div>
      </div>
    </section>
  );
};

const styles: Record<string, React.CSSProperties> = {
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '16px',
  },
  kpiCard: {
    backgroundColor: '#131c2e',
    border: '1px solid #1e293b',
    borderRadius: '16px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
  },
  kpiIconWrapper: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiLabel: {
    fontSize: '0.8125rem',
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  kpiValue: {
    fontSize: '1.75rem',
    fontWeight: '800',
    color: '#ffffff',
    margin: 0,
    lineHeight: 1.1,
  },
};

export default KpiCards;
