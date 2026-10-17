import type { ToastItem, ToastType } from '../types';
import { AlertCircle, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

interface ToastContainerProps {
  toasts: ToastItem[];
  onRemove: (id: string) => void;
}

const TYPE_CONFIG: Record<
  ToastType,
  {
    icon: typeof AlertCircle;
    borderColor: string;
    bgColor: string;
    iconColor: string;
    defaultTitle: string;
  }
> = {
  error: {
    icon: AlertCircle,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    bgColor: 'rgba(239, 68, 68, 0.12)',
    iconColor: '#ef4444',
    defaultTitle: 'Atenção',
  },
  success: {
    icon: CheckCircle2,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    bgColor: 'rgba(16, 185, 129, 0.12)',
    iconColor: '#10b981',
    defaultTitle: 'Sucesso',
  },
  warning: {
    icon: AlertTriangle,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    bgColor: 'rgba(245, 158, 11, 0.12)',
    iconColor: '#f59e0b',
    defaultTitle: 'Aviso',
  },
  info: {
    icon: Info,
    borderColor: 'rgba(59, 130, 246, 0.4)',
    bgColor: 'rgba(59, 130, 246, 0.12)',
    iconColor: '#3b82f6',
    defaultTitle: 'Informação',
  },
};

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <aside style={styles.container} aria-live="polite" aria-label="Notificações">
      {toasts.map((toast) => {
        const config = TYPE_CONFIG[toast.type];
        const IconComponent = config.icon;

        return (
          <div
            key={toast.id}
            style={{
              ...styles.toast,
              borderColor: config.borderColor,
              borderLeftColor: config.iconColor,
              borderLeftWidth: '4px',
            }}
            role="alert"
          >
            <div style={{ ...styles.iconWrapper, backgroundColor: config.bgColor }}>
              <IconComponent size={20} color={config.iconColor} />
            </div>

            <div style={styles.content}>
              <strong style={styles.title}>{toast.title || config.defaultTitle}</strong>
              <p style={styles.message}>{toast.message}</p>
            </div>

            <button
              onClick={() => onRemove(toast.id)}
              style={styles.closeBtn}
              aria-label="Fechar notificação"
              title="Fechar notificação"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </aside>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    zIndex: 99999,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    maxWidth: '420px',
    width: 'calc(100vw - 40px)',
    pointerEvents: 'none',
  },
  toast: {
    pointerEvents: 'auto',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '14px 16px',
    backgroundColor: '#111827',
    border: '1px solid #1f2937',
    borderRadius: '10px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.6), 0 0 15px rgba(0, 0, 0, 0.3)',
    backdropFilter: 'blur(10px)',
    animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
    transition: 'all 0.2s ease',
  },
  iconWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    flexShrink: 0,
    marginTop: '2px',
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  title: {
    fontSize: '0.9rem',
    fontWeight: 600,
    color: '#f8fafc',
  },
  message: {
    fontSize: '0.85rem',
    color: '#94a3b8',
    lineHeight: 1.4,
    margin: 0,
    wordBreak: 'break-word',
  },
  closeBtn: {
    color: '#64748b',
    padding: '4px',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 0.15s ease',
    flexShrink: 0,
    marginTop: '2px',
  },
};
