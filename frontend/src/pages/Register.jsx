import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ErrorMessage from '../components/ErrorMessage';
import { useLanguage } from '../context/LanguageContext';

const Register = () => {
  const { register } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '', 
    role: 'customer'
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const name = form.name.trim();
    const email = form.email.trim();

    if (name.length < 2 || name.length > 60) return setError(t('auth.nameValidationError'));
    if (!/^[A-Za-z\s'-]+$/.test(name)) return setError(t('auth.nameCharError'));
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError(t('auth.invalidEmail'));
    if (form.password.length < 6) return setError(t('auth.passLengthError'));
    if (!/[A-Z]/.test(form.password)) return setError(t('auth.passUpperError'));
    if (!/[a-z]/.test(form.password)) return setError(t('auth.passLowerError'));
    if (!/[0-9]/.test(form.password)) return setError(t('auth.passNumberError'));
    if (form.password !== form.confirmPassword) return setError(t('auth.passMatchError'));

    setLoading(true);
    try {
      const { confirmPassword, ...userData } = form;
      const data = await register({ ...userData, name, email });
      navigate('/verify-otp', {
        state: { email, emailFailed: data?.emailFailed }
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-left">
        <div className="auth-brand">{t('auth.brand')}</div>
        <h1 className="auth-headline">{t('auth.joinPlatform')}</h1>
        <p className="auth-sub">{t('auth.registerTagline')}</p>
      </div>

      <div className="auth-right">
        <div className="auth-box">
          <h2 className="auth-box-title">{t('auth.registerLink')}</h2>

          {error && <ErrorMessage message={error} />}

          <form onSubmit={handleSubmit}>
            <div className="dark-form-group">
              <label>{t('auth.fullNameLabel')}</label>
              <input
                className="dark-input"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder={t('auth.fullNamePlaceholder')}
              />
            </div>

            <div className="dark-form-group">
              <label>{t('auth.emailLabel')}</label>
              <input
                className="dark-input"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder={t('auth.emailPlaceholder')}
              />
            </div>

            <div className="dark-form-group">
              <label>{t('auth.passwordLabel')}</label>
              <input
                className="dark-input"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
                placeholder={t('auth.passwordPlaceholder')}
              />
            </div>

            <div className="dark-form-group">
              <label>{t('auth.confirmPasswordLabel')}</label>
              <input
                className="dark-input"
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                placeholder={t('auth.passwordPlaceholder')}
              />
            </div>

            <div className="dark-form-group">
              <label>{t('auth.roleLabel')}</label>
              <select
                className="dark-input"
                name="role"
                value={form.role}
                onChange={handleChange}
              >
                <option value="customer">{t('auth.customerRole')}</option>
                <option value="driver">{t('auth.driverRole')}</option>
              </select>
            </div>

            <button
              type="submit"
              className="approve-btn"
              disabled={loading}
              style={{
                width: '100%',
                marginTop: '0.5rem',
                padding: '0.75rem',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              {loading ? t('auth.creatingAccount') : t('auth.createAccountBtn')}
            </button>
          </form>

          <p className="auth-switch">
            {t('auth.alreadyHaveAccount')} <Link to="/login">{t('auth.loginLink')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;