import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ErrorMessage from '../components/ErrorMessage';
import { useLanguage } from '../context/LanguageContext';
import LanguageSelector from '../components/LanguageSelector';

const Login = () => {
  const { login, setSession } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const email = form.email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError(t('auth.invalidEmail'));
    if (!form.password) return setError(t('auth.passwordRequired'));

    setLoading(true);
    try {
      const data = await login({ email, password: form.password });
      const session = setSession({
        token: data.token,
        role: data.role,
        name: data.name || '',
      });
      const routeMap = {
        admin: '/admin',
        driver: '/driver',
        customer: '/dashboard',
      };
      navigate(routeMap[session.role] || '/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen" style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', zIndex: 10 }}>
        <Link to="/" style={{ color: 'var(--dim)', textDecoration: 'none', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
          ← {t('auth.backToHome')}
        </Link>
      </div>
      <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', zIndex: 10 }}>
        <LanguageSelector />
      </div>
      <div className="auth-left">
        <div className="auth-brand">{t('auth.brand')}</div>
        <h1 className="auth-headline">{t('auth.logisticsControl')}</h1>
        <p className="auth-sub">{t('auth.tagline')}</p>
      </div>
      <div className="auth-right">
        <div className="auth-box">
          <h2 className="auth-box-title">{t('auth.loginHeader')}</h2>
          {error && <ErrorMessage message={error} />}
          <form onSubmit={handleSubmit}>
            <div className="dark-form-group">
              <label>{t('auth.emailLabel')}</label>
              <input className="dark-input" name="email" type="email" value={form.email} onChange={handleChange} required placeholder={t('auth.emailPlaceholder')} />
            </div>
            <div className="dark-form-group">
              <label>{t('auth.passwordLabel')}</label>
              <input className="dark-input" name="password" type="password" value={form.password} onChange={handleChange} required placeholder={t('auth.passwordPlaceholder')} />
            </div>
            <div style={{ textAlign: 'right', marginTop: '-0.5rem', marginBottom: '1rem' }}>
              <Link to="/forgot-password" className="forgot-password-link">
                {t('auth.forgotPasswordLink')}
              </Link>
            </div>
            <button type="submit" className="approve-btn" disabled={loading} style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem' }}>
              {loading ? t('auth.signingIn') : t('auth.signInBtn')}
            </button>
          </form>
          <p className="auth-switch">{t('auth.dontHaveAccount')} <Link to="/register">{t('auth.registerLink')}</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
