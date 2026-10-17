import type { User } from '../types';
import { ShieldAlert, User as UserIcon, LogOut } from 'lucide-react';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
}

export function Navbar({ user, onLogout }: NavbarProps) {
  return (
    <header style={styles.navbar}>
      <div style={styles.navLeft}>
        <div style={styles.brandBadge}>
          <ShieldAlert size={24} color="#3b82f6" />
        </div>
        <div>
          <div style={styles.brandTitleRow}>
            <h1 style={styles.brandTitle}>LOGOS</h1>
          </div>
          <p style={styles.brandSub}>Central de Resposta a Incidentes</p>
        </div>
      </div>

      <div style={styles.navRight}>
        <div style={styles.operatorCard}>
          <div style={styles.avatar}>
            <UserIcon size={18} color="#3b82f6" />
          </div>
          <div style={styles.operatorInfo}>
            <span style={styles.operatorName}>{user?.name || 'Operador'}</span>
            <span style={styles.operatorEmail}>{user?.email}</span>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={onLogout}
          title="Encerrar Sessão"
        >
          <LogOut size={16} /> Sair
        </button>
      </div>
    </header>
  );
};

const styles: Record<string, React.CSSProperties> = {
  navbar: {
    backgroundColor: '#101726',
    borderBottom: '1px solid #1e293b',
    padding: '16px 32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  navLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  brandBadge: {
    width: '46px',
    height: '46px',
    borderRadius: '12px',
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    border: '1px solid rgba(59, 130, 246, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 15px rgba(59, 130, 246, 0.2)',
  },
  brandTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  brandTitle: {
    fontSize: '1.4rem',
    fontWeight: '800',
    letterSpacing: '0.06em',
    color: '#ffffff',
    margin: 0,
  },
  liveIndicator: {
    fontSize: '0.6875rem',
    fontWeight: '700',
    color: '#10b981',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    border: '1px solid rgba(16, 185, 129, 0.25)',
    padding: '3px 8px',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    letterSpacing: '0.05em',
  },
  brandSub: {
    fontSize: '0.8125rem',
    color: '#94a3b8',
    margin: 0,
  },
  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  operatorCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '6px 14px',
    backgroundColor: '#162032',
    border: '1px solid #1e293b',
    borderRadius: '10px',
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  operatorInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  operatorName: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#ffffff',
  },
  operatorEmail: {
    fontSize: '0.75rem',
    color: '#64748b',
  },
};

export default Navbar;
