import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks';

export function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div className="spinner" />
        <p style={styles.loadingText}>Inicializando central de operações Logos...</p>
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

export function PublicRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return null;
  }

  return !isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
}

const styles: Record<string, React.CSSProperties> = {
  loadingContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0a0e17',
    color: '#94a3b8',
  },
  loadingText: {
    marginTop: '16px',
    fontSize: '0.9rem',
    fontWeight: 500,
  },
};
