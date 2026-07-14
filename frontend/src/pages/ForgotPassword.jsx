import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ErrorMessage from '../components/ErrorMessage';
import { forgotPasswordUser, resetPasswordUser } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const [step, setStep] = useState(location.pathname === '/reset-password' ? 'reset' : 'request');
  const [form, setForm] = useState({
    email: location.state?.email || '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const email = form.email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError(t('auth.invalidEmail'));

    setLoading(true);
    try {
      await forgotPasswordUser({ email });
      setSuccess(t('auth.successOtpSent'));
      setStep('reset');
      navigate('/reset-password', { replace: true, state: { email } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const otp = form.otp.trim();
    if (!/^\d{6}$/.test(otp)) return setError(t('auth.otpDigitError'));
    if (form.newPassword.length < 8) return setError(t('auth.passResetMinError'));
    if (!/[A-Z]/.test(form.newPassword)) return setError(t('auth.passUpperError'));
    if (!/[a-z]/.test(form.newPassword)) return setError(t('auth.passLowerError'));
    if (!/[0-9]/.test(form.newPassword)) return setError(t('auth.passNumberError'));
    if (form.newPassword !== form.confirmPassword) return setError(t('auth.passMatchError'));

    setLoading(true);
    try {
      await resetPasswordUser({
        email: form.email.trim(),
        otp,
        newPassword: form.newPassword,
      });
      setSuccess(t('auth.successReset'));
      setTimeout(() => navigate('/login'), 1500);
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
        <h1 className="auth-headline">{t('auth.resetPasswordHeader')}</h1>
        <p className="auth-sub">{t('auth.resetTagline')}</p>
      </div>
      <div className="auth-right">
        <div className="auth-box">
          <h2 className="auth-box-title">{t('auth.forgotPasswordTitle')}</h2>
          <p className="auth-box-sub">
            {step === 'request'
              ? t('auth.emailResetPrompt')
              : t('auth.otpResetPrompt')}
          </p>

          {error && <ErrorMessage message={error} />}
          {success && <div className="dark-success">{success}</div>}

          <form onSubmit={step === 'request' ? handleSendOtp : handleResetPassword}>
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
                autoComplete="email"
              />
            </div>

            {step === 'reset' && (
              <>
                <div className="dark-form-group">
                  <label>{t('auth.otpCodeLabel')}</label>
                  <input
                    className="dark-input"
                    name="otp"
                    value={form.otp}
                    onChange={handleChange}
                    required
                    placeholder={t('auth.otpCodePlaceholder')}
                    maxLength={6}
                    autoComplete="one-time-code"
                    style={{ letterSpacing: '0.2em', fontSize: '1.1rem' }}
                  />
                </div>
                <div className="dark-form-group">
                  <label>{t('auth.newPasswordLabel')}</label>
                  <input
                    className="dark-input"
                    name="newPassword"
                    type="password"
                    value={form.newPassword}
                    onChange={handleChange}
                    required
                    placeholder={t('auth.passwordPlaceholder')}
                    autoComplete="new-password"
                  />
                </div>
                <div className="dark-form-group">
                  <label>{t('auth.confirmNewPasswordLabel')}</label>
                  <input
                    className="dark-input"
                    name="confirmPassword"
                    type="password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder={t('auth.passwordPlaceholder')}
                    autoComplete="new-password"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              className="approve-btn"
              disabled={loading}
              style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem' }}
            >
              {loading
                ? (step === 'request' ? t('auth.sendingCode') : t('auth.resetting'))
                : (step === 'request' ? t('auth.sendResetCode') : t('auth.resetPasswordBtn'))}
            </button>
          </form>

          {step === 'reset' && (
            <button
              type="button"
              className="forgot-back-btn"
              onClick={() => {
                setStep('request');
                setError('');
                setSuccess('');
                navigate('/forgot-password', { replace: true });
              }}
            >
              {t('auth.startOver')}
            </button>
          )}

          <p className="auth-switch">
            {t('auth.rememberPassword')} <Link to="/login">{t('auth.backToLogin')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
