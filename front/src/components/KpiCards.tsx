import type { StatsResponse } from '../types';
import { TrendingUp, AlertTriangle, Clock, CheckCircle, ShieldCheck } from 'lucide-react';

interface KpiCardsProps {
  stats: StatsResponse | null;
}

export function KpiCards({ stats }: KpiCardsProps) {
  const total = stats?.total_incidents ?? 0;
  const criticos = stats?.criticity_stats?.find((s) => s.stats_value === 'alta')?.count ?? 0;
  const abertos = stats?.status_stats?.find((s) => s.stats_value === 'aberto')?.count ?? 0;
  const emInvestigacao = stats?.status_stats?.find((s) => s.stats_value === 'em_investigacao')?.count ?? 0;
  const fechados = stats?.status_stats?.find((s) => s.stats_value === 'fechado')?.count ?? 0;

  return (
    <section style={styles.kpiGrid}>
      <div style={styles.kpiCard}>
        <div style={styles.kpiIconWrapper}>
          <TrendingUp size={22} color="#3b82f6" />
        </div>
        <div>
          <span style={styles.kpiLabel}>Total de Ocorrências</span>
          <p style={styles.kpiValue}>{total}</p>
          <span style={styles.kpiSubtitle}>Base geral da frota</span>
        </div>
      </div>

      <div style={{ ...styles.kpiCard, borderColor: 'rgba(239, 68, 68, 0.3)' }}>
        <div style={{ ...styles.kpiIconWrapper, backgroundColor: 'rgba(239, 68, 68, 0.15)' }}>
          <AlertTriangle size={22} color="#ef4444" />
        </div>
        <div>
          <span style={styles.kpiLabel}>Criticidade Alta</span>
          <p style={{ ...styles.kpiValue, color: '#ef4444' }}>{criticos}</p>
          <span style={styles.kpiSubtitle}>Atenção prioritária</span>
        </div>
      </div>

      <div style={{ ...styles.kpiCard, borderColor: 'rgba(59, 130, 246, 0.3)' }}>
        <div style={{ ...styles.kpiIconWrapper, backgroundColor: 'rgba(59, 130, 246, 0.15)' }}>
          <Clock size={22} color="#3b82f6" />
        </div>
        <div>
          <span style={styles.kpiLabel}>Status Aberto</span>
          <p style={{ ...styles.kpiValue, color: '#3b82f6' }}>{abertos}</p>
          <span style={styles.kpiSubtitle}>Aguardando triagem</span>
        </div>
      </div>

      <div style={{ ...styles.kpiCard, borderColor: 'rgba(168, 85, 247, 0.3)' }}>
        <div style={{ ...styles.kpiIconWrapper, backgroundColor: 'rgba(168, 85, 247, 0.15)' }}>
          <CheckCircle size={22} color="#a855f7" />
        </div>
        <div>
          <span style={styles.kpiLabel}>Em Investigação</span>
          <p style={{ ...styles.kpiValue, color: '#a855f7' }}>{emInvestigacao}</p>
          <span style={styles.kpiSubtitle}>Com operador ativo</span>
        </div>
      </div>

      <div style={{ ...styles.kpiCard, borderColor: 'rgba(16, 185, 129, 0.3)' }}>
        <div style={{ ...styles.kpiIconWrapper, backgroundColor: 'rgba(16, 185, 129, 0.15)' }}>
          <ShieldCheck size={22} color="#10b981" />
        </div>
        <div>
          <span style={styles.kpiLabel}>Resolvidos</span>
          <p style={{ ...styles.kpiValue, color: '#10b981' }}>{fechados}</p>
          <span style={styles.kpiSubtitle}>Casos concluídos</span>
        </div>
      </div>
    </section>
  );
};

const styles: Record<string, React.CSSProperties> = {
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
  },
  kpiCard: {
    backgroundColor: '#131c2e',
    border: '1px solid #1e293b',
    borderRadius: '16px',
    padding: '18px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    transition: 'transform 0.15s ease, border-color 0.15s ease',
  },
  kpiIconWrapper: {
    width: '46px',
    height: '46px',
    borderRadius: '12px',
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  kpiLabel: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    display: 'block',
  },
  kpiValue: {
    fontSize: '1.65rem',
    fontWeight: '800',
    color: '#ffffff',
    margin: '2px 0 0',
    lineHeight: 1.1,
  },
  kpiSubtitle: {
    fontSize: '0.75rem',
    color: '#64748b',
    display: 'block',
    marginTop: '2px',
  },
};

export default KpiCards;
