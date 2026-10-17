import { useState, type FormEvent } from 'react';
import { useAuth } from '../hooks';
import { ShieldAlert, LogIn, UserPlus, Lock, Mail, User as UserIcon, AlertCircle, CheckCircle2 } from 'lucide-react';

export function LoginPage() {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState<boolean>(false);

  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email || !password || (isRegister && !name)) {
      setErrorMessage('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        await register({ name, email, password });
        setSuccessMessage('Operador cadastrado com sucesso! Entrando...');
        await login({ email, password });
      } else {
        await login({ email, password });
      }
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosErr = err as { response?: { data?: { detail?: string; erros?: Array<{ mensagem: string }> } } };
        const detail = axiosErr.response?.data?.detail;
        const validationErrors = axiosErr.response?.data?.erros;

        if (detail) {
          setErrorMessage(detail);
        } else if (validationErrors && validationErrors.length > 0) {
          setErrorMessage(validationErrors.map((e) => e.mensagem).join(' | '));
        } else {
          setErrorMessage('Ocorreu um erro ao processar sua requisição.');
        }
      } else {
        setErrorMessage('Não foi possível conectar ao servidor backend.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('operador@autou.com.br');
    setPassword('senha_secreta_123');
    setIsRegister(false);
    setErrorMessage(null);
  };

  return (
    <div style={styles.container}>
      <div style={styles.ambientGlow} />

      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logoBadge}>
            <ShieldAlert size={32} color="#3b82f6" />
          </div>
          <h1 style={styles.title}>LOGOS</h1>
          <p style={styles.subtitle}>Central de Resposta a Incidentes • AutoU</p>
        </div>

        <div style={styles.tabContainer}>
          <button
            type="button"
            style={{
              ...styles.tabButton,
              ...(isRegister ? {} : styles.tabButtonActive),
            }}
            onClick={() => {
              setIsRegister(false);
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
          >
            <LogIn size={16} /> Entrar
          </button>
          <button
            type="button"
            style={{
              ...styles.tabButton,
              ...(isRegister ? styles.tabButtonActive : {}),
            }}
            onClick={() => {
              setIsRegister(true);
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
          >
            <UserPlus size={16} /> Novo Operador
          </button>
        </div>

        {errorMessage && (
          <div style={styles.alertError}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div style={styles.alertSuccess}>
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          {isRegister && (
            <div className="form-group">
              <label className="form-label" htmlFor="name">
                Nome Completo
              </label>
              <div style={styles.inputWrapper}>
                <UserIcon size={18} style={styles.inputIcon} />
                <input
                  id="name"
                  type="text"
                  className="form-input"
                  style={styles.inputWithIcon}
                  placeholder="Ex: Carlos Silva"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="email">
              E-mail Corporativo
            </label>
            <div style={styles.inputWrapper}>
              <Mail size={18} style={styles.inputIcon} />
              <input
                id="email"
                type="email"
                className="form-input"
                style={styles.inputWithIcon}
                placeholder="operador@autou.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Senha de Acesso
            </label>
            <div style={styles.inputWrapper}>
              <Lock size={18} style={styles.inputIcon} />
              <input
                id="password"
                type="password"
                className="form-input"
                style={styles.inputWithIcon}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={styles.submitBtn}
            disabled={loading}
          >
            {loading ? (
              <div className="spinner spinner-sm" />
            ) : isRegister ? (
              <>
                <UserPlus size={18} /> Cadastrar e Acessar
              </>
            ) : (
              <>
                <LogIn size={18} /> Acessar Central
              </>
            )}
          </button>
        </form>

        {!isRegister && (
          <div style={styles.demoBox}>
            <span style={styles.demoText}>Conta de teste seeded no banco:</span>
            <button
              type="button"
              onClick={handleFillDemo}
              style={styles.demoLink}
            >
              Preencher dados de operador
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    position: 'relative',
    backgroundColor: '#0a0e17',
    overflow: 'hidden',
  },
  ambientGlow: {
    position: 'absolute',
    width: '600px',
    height: '600px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(10, 14, 23, 0) 70%)',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
  },
  card: {
    width: '100%',
    maxWidth: '440px',
    backgroundColor: 'rgba(19, 28, 46, 0.85)',
    border: '1px solid rgba(42, 58, 84, 0.8)',
    borderRadius: '20px',
    padding: '36px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6), 0 0 30px rgba(59, 130, 246, 0.1)',
    backdropFilter: 'blur(16px)',
    position: 'relative',
    zIndex: 1,
  },
  header: {
    textAlign: 'center',
    marginBottom: '28px',
  },
  logoBadge: {
    width: '64px',
    height: '64px',
    borderRadius: '16px',
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    border: '1px solid rgba(59, 130, 246, 0.3)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
    boxShadow: '0 0 20px rgba(59, 130, 246, 0.25)',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '800',
    letterSpacing: '0.08em',
    color: '#ffffff',
    margin: 0,
  },
  subtitle: {
    fontSize: '0.875rem',
    color: '#94a3b8',
    marginTop: '6px',
  },
  tabContainer: {
    display: 'flex',
    backgroundColor: '#101726',
    padding: '4px',
    borderRadius: '12px',
    border: '1px solid #1e293b',
    marginBottom: '24px',
  },
  tabButton: {
    flex: 1,
    padding: '8px 12px',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#94a3b8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
  },
  tabButtonActive: {
    backgroundColor: '#1e293b',
    color: '#ffffff',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
  },
  alertError: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    color: '#f87171',
    padding: '12px 14px',
    borderRadius: '10px',
    fontSize: '0.875rem',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  alertSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    color: '#34d399',
    padding: '12px 14px',
    borderRadius: '10px',
    fontSize: '0.875rem',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '14px',
    color: '#64748b',
    pointerEvents: 'none',
  },
  inputWithIcon: {
    paddingLeft: '42px',
  },
  submitBtn: {
    marginTop: '8px',
    padding: '12px',
    fontSize: '0.95rem',
  },
  demoBox: {
    marginTop: '24px',
    paddingTop: '20px',
    borderTop: '1px solid #1e293b',
    textAlign: 'center',
    fontSize: '0.8125rem',
  },
  demoText: {
    color: '#64748b',
    display: 'block',
    marginBottom: '6px',
  },
  demoLink: {
    color: '#3b82f6',
    fontWeight: 600,
    textDecoration: 'underline',
    cursor: 'pointer',
  },
};

export default LoginPage;
