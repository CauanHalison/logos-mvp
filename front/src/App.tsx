import { AuthProvider, ToastProvider } from './contexts';
import { useAuth } from './hooks';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';

function AppContent() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a0e17',
          color: '#94a3b8',
        }}
      >
        <div className="spinner" />
        <p style={{ marginTop: '16px', fontSize: '0.9rem', fontWeight: 500 }}>
          Inicializando central de operações Logos...
        </p>
      </div>
    );
  }

  return isAuthenticated ? <DashboardPage /> : <LoginPage />;
}

export function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
