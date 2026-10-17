import { useState } from 'react';
import type { StatsResponse } from '../types';
import { INCIDENT_CATEGORY_LABELS } from '../types';
import { BarChart2, PieChart, ChevronDown, ChevronUp } from 'lucide-react';

interface StatsDistributionPanelProps {
  stats: StatsResponse | null;
}

export function StatsDistributionPanel({ stats }: StatsDistributionPanelProps) {
  const [isOpen, setIsOpen] = useState(true);

  if (!stats || stats.total_incidents === 0) {
    return null;
  }

  const total = stats.total_incidents;

  const sortedCategories = stats.category_stats
    ? [...stats.category_stats].sort((a, b) => b.count - a.count)
    : [];

  const criticos = stats.criticity_stats?.find((s) => s.stats_value === 'alta')?.count ?? 0;
  const medias = stats.criticity_stats?.find((s) => s.stats_value === 'media')?.count ?? 0;
  const baixas = stats.criticity_stats?.find((s) => s.stats_value === 'baixa')?.count ?? 0;

  const abertos = stats.status_stats?.find((s) => s.stats_value === 'aberto')?.count ?? 0;
  const emInvestigacao = stats.status_stats?.find((s) => s.stats_value === 'em_investigacao')?.count ?? 0;
  const fechados = stats.status_stats?.find((s) => s.stats_value === 'fechado')?.count ?? 0;
  const inconclusivos = stats.status_stats?.find((s) => s.stats_value === 'inconclusivo')?.count ?? 0;

  const altaPct = (criticos / total) * 100;
  const mediaPct = (medias / total) * 100;
  const baixaPct = (baixas / total) * 100;

  const abertoPct = (abertos / total) * 100;
  const investigacaoPct = (emInvestigacao / total) * 100;
  const fechadoPct = (fechados / total) * 100;
  const inconclusivoPct = (inconclusivos / total) * 100;

  const getCategoryLabel = (val: string) => {
    return (INCIDENT_CATEGORY_LABELS as Record<string, string>)[val] || val.replace(/_/g, ' ');
  };

  const getCategoryColor = (categoryKey: string) => {
    switch (categoryKey) {
      case 'acidente_vitimas':
      case 'acidente_com_vitimas':
        return '#f43f5e';
      case 'acidente_veiculo':
      case 'acidente_com_veiculo':
        return '#f97316';
      case 'bloqueio_de_pista':
        return '#eab308';
      case 'clima_atipico':
        return '#06b6d4';
      case 'problema_mecanico':
        return '#8b5cf6';
      default:
        return '#3b82f6';
    }
  };

  return (
    <section style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <span style={styles.title}>Distribuição & Análise Geral da Frota</span>
          <span style={styles.badge}>Base 100% Consolidada</span>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          style={styles.toggleButton}
        >
          <span>{isOpen ? 'Ocultar Análise' : 'Ver Análise Detalhada'}</span>
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {isOpen && (
        <div style={styles.grid}>
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={{ ...styles.iconWrapper, backgroundColor: 'rgba(6, 182, 212, 0.12)' }}>
                <BarChart2 size={18} color="#06b6d4" />
              </div>
              <div>
                <h4 style={styles.cardTitle}>Ocorrências por Categoria</h4>
                <p style={styles.cardSubtitle}>Volume e proporção por tipo de evento</p>
              </div>
            </div>

            <div style={styles.categoryList}>
              {sortedCategories.map((cat) => {
                const pct = ((cat.count / total) * 100).toFixed(1);
                const color = getCategoryColor(cat.stats_value);

                return (
                  <div key={cat.stats_value} style={styles.categoryItem}>
                    <div style={styles.categoryLabelRow}>
                      <span style={styles.categoryName} title={getCategoryLabel(cat.stats_value)}>
                        {getCategoryLabel(cat.stats_value)}
                      </span>
                      <span style={styles.categoryCount}>
                        <strong style={{ color }}>{cat.count}</strong> ({pct}%)
                      </span>
                    </div>
                    <div style={styles.progressTrack}>
                      <div
                        style={{
                          ...styles.progressBar,
                          width: `${pct}%`,
                          backgroundColor: color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={{ ...styles.iconWrapper, backgroundColor: 'rgba(16, 185, 129, 0.12)' }}>
                <PieChart size={18} color="#10b981" />
              </div>
              <div>
                <h4 style={styles.cardTitle}>Proporção de Risco & Status</h4>
                <p style={styles.cardSubtitle}>Distribuição da criticidade e ciclo operacional</p>
              </div>
            </div>

            <div style={styles.sectionBlock}>
              <div style={styles.sectionHeader}>
                <span style={styles.sectionTitle}>Criticidade Operacional</span>
                <span style={styles.sectionTotal}>{total} incidentes</span>
              </div>

              <div style={styles.segmentedBar}>
                {altaPct > 0 && (
                  <div
                    style={{
                      width: `${altaPct}%`,
                      backgroundColor: '#ef4444',
                      height: '100%',
                    }}
                    title={`Alta: ${criticos} (${altaPct.toFixed(1)}%)`}
                  />
                )}
                {mediaPct > 0 && (
                  <div
                    style={{
                      width: `${mediaPct}%`,
                      backgroundColor: '#f59e0b',
                      height: '100%',
                    }}
                    title={`Média: ${medias} (${mediaPct.toFixed(1)}%)`}
                  />
                )}
                {baixaPct > 0 && (
                  <div
                    style={{
                      width: `${baixaPct}%`,
                      backgroundColor: '#10b981',
                      height: '100%',
                    }}
                    title={`Baixa: ${baixas} (${baixaPct.toFixed(1)}%)`}
                  />
                )}
              </div>

              <div style={styles.legendGrid}>
                <div style={styles.legendItem}>
                  <span style={{ ...styles.legendDot, backgroundColor: '#ef4444' }} />
                  <span style={styles.legendText}>
                    Alta: <strong>{criticos}</strong> ({altaPct.toFixed(1)}%)
                  </span>
                </div>
                <div style={styles.legendItem}>
                  <span style={{ ...styles.legendDot, backgroundColor: '#f59e0b' }} />
                  <span style={styles.legendText}>
                    Média: <strong>{medias}</strong> ({mediaPct.toFixed(1)}%)
                  </span>
                </div>
                <div style={styles.legendItem}>
                  <span style={{ ...styles.legendDot, backgroundColor: '#10b981' }} />
                  <span style={styles.legendText}>
                    Baixa: <strong>{baixas}</strong> ({baixaPct.toFixed(1)}%)
                  </span>
                </div>
              </div>
            </div>

            <div style={{ ...styles.sectionBlock, marginTop: '20px' }}>
              <div style={styles.sectionHeader}>
                <span style={styles.sectionTitle}>Ciclo de Atendimento (Status)</span>
                <span style={styles.sectionTotal}>{fechados + abertos + emInvestigacao + inconclusivos} total</span>
              </div>

              <div style={styles.segmentedBar}>
                {abertoPct > 0 && (
                  <div
                    style={{
                      width: `${abertoPct}%`,
                      backgroundColor: '#3b82f6',
                      height: '100%',
                    }}
                    title={`Aberto: ${abertos} (${abertoPct.toFixed(1)}%)`}
                  />
                )}
                {investigacaoPct > 0 && (
                  <div
                    style={{
                      width: `${investigacaoPct}%`,
                      backgroundColor: '#a855f7',
                      height: '100%',
                    }}
                    title={`Em Investigação: ${emInvestigacao} (${investigacaoPct.toFixed(1)}%)`}
                  />
                )}
                {fechadoPct > 0 && (
                  <div
                    style={{
                      width: `${fechadoPct}%`,
                      backgroundColor: '#10b981',
                      height: '100%',
                    }}
                    title={`Fechado: ${fechados} (${fechadoPct.toFixed(1)}%)`}
                  />
                )}
                {inconclusivoPct > 0 && (
                  <div
                    style={{
                      width: `${inconclusivoPct}%`,
                      backgroundColor: '#64748b',
                      height: '100%',
                    }}
                    title={`Inconclusivo: ${inconclusivos} (${inconclusivoPct.toFixed(1)}%)`}
                  />
                )}
              </div>

              <div style={styles.legendGrid}>
                <div style={styles.legendItem}>
                  <span style={{ ...styles.legendDot, backgroundColor: '#3b82f6' }} />
                  <span style={styles.legendText}>
                    Aberto: <strong>{abertos}</strong> ({abertoPct.toFixed(1)}%)
                  </span>
                </div>
                <div style={styles.legendItem}>
                  <span style={{ ...styles.legendDot, backgroundColor: '#a855f7' }} />
                  <span style={styles.legendText}>
                    Investigação: <strong>{emInvestigacao}</strong> ({investigacaoPct.toFixed(1)}%)
                  </span>
                </div>
                <div style={styles.legendItem}>
                  <span style={{ ...styles.legendDot, backgroundColor: '#10b981' }} />
                  <span style={styles.legendText}>
                    Fechado: <strong>{fechados}</strong> ({fechadoPct.toFixed(1)}%)
                  </span>
                </div>
                <div style={styles.legendItem}>
                  <span style={{ ...styles.legendDot, backgroundColor: '#64748b' }} />
                  <span style={styles.legendText}>
                    Inconclusivo: <strong>{inconclusivos}</strong> ({inconclusivoPct.toFixed(1)}%)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: '#101626',
    border: '1px solid #1e293b',
    borderRadius: '16px',
    padding: '20px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  title: {
    fontSize: '0.95rem',
    fontWeight: '700',
    color: '#f8fafc',
    letterSpacing: '-0.01em',
  },
  badge: {
    fontSize: '0.6875rem',
    fontWeight: '600',
    color: '#06b6d4',
    backgroundColor: 'rgba(6, 182, 212, 0.12)',
    border: '1px solid rgba(6, 182, 212, 0.25)',
    padding: '2px 8px',
    borderRadius: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  toggleButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#1e293b',
    color: '#94a3b8',
    border: '1px solid #334155',
    borderRadius: '8px',
    padding: '6px 12px',
    fontSize: '0.75rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
    gap: '16px',
  },
  card: {
    backgroundColor: '#131c2e',
    border: '1px solid #1e293b',
    borderRadius: '14px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  iconWrapper: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardTitle: {
    fontSize: '0.875rem',
    fontWeight: '700',
    color: '#f1f5f9',
    margin: 0,
  },
  cardSubtitle: {
    fontSize: '0.75rem',
    color: '#64748b',
    margin: '2px 0 0',
  },
  categoryList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  categoryItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  categoryLabelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.78125rem',
  },
  categoryName: {
    color: '#cbd5e1',
    fontWeight: '500',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '240px',
  },
  categoryCount: {
    color: '#94a3b8',
    fontSize: '0.75rem',
  },
  progressTrack: {
    height: '7px',
    backgroundColor: '#1e293b',
    borderRadius: '999px',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: '999px',
    transition: 'width 0.4s ease',
  },
  sectionBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: '0.78125rem',
    fontWeight: '600',
    color: '#e2e8f0',
  },
  sectionTotal: {
    fontSize: '0.71875rem',
    color: '#64748b',
  },
  segmentedBar: {
    display: 'flex',
    height: '10px',
    borderRadius: '999px',
    overflow: 'hidden',
    backgroundColor: '#1e293b',
    gap: '2px',
  },
  legendGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
    gap: '8px',
    marginTop: '4px',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  legendDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  legendText: {
    fontSize: '0.71875rem',
    color: '#94a3b8',
  },
};

export default StatsDistributionPanel;
