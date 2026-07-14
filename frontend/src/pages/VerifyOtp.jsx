import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import ErrorMessage from '../components/ErrorMessage';
import { verifyRegisterOtp, resendRegisterOtp } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  // email passed via navigation state from Register
  const [email, setEmail] = useState(location.state?.email || '');
  const [emailFailed] = useState(location.state?.emailFailed || false);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError(t('auth.invalidEmail'));
    if (!/^\d{6}$/.test(otp.trim())) return setError(t('auth.otpDigitError'));

    setLoading(true);
    try {
      await verifyRegisterOtp({ email, otp });
      setSuccess(t('auth.successVerify'));
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError(''); setSuccess(''); setResending(true);
    try {
      const data = await resendRegisterOtp({ email });
      setSuccess(data.message || t('auth.successOtpResent'));
    } catch (err) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-left">
        <div className="auth-brand">{t('auth.brand')}</div>
        <h1 className="auth-headline">{t('auth.verifyEmailTitle')}</h1>
        <p className="auth-sub">{t('auth.verifyEmailTagline')}</p>
      </div>
      <div className="auth-right">
        <div className="auth-box">
          <h2 className="auth-box-title">{t('auth.enterOtpTitle')}</h2>
          <p className="auth-box-sub">
            {t('auth.checkInboxPrompt')} <strong>{email || 'your email'}</strong>
          </p>
          {error && <ErrorMessage message={error} />}
          {success && <div className="dark-success">✅ {success}</div>}
          {emailFailed && (
            <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: '#fcd34d', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>
              {t('auth.emailFailedNotice')}
            </div>
          )}
          <form onSubmit={handleVerify}>
            {!location.state?.email && (
              <div className="dark-form-group">
                <label>{t('auth.emailLabel')}</label>
                <input
                  className="dark-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder={t('auth.emailPlaceholder')}
                />
              </div>
            )}
            <div className="dark-form-group">
              <label>{t('auth.otpCodeLabel')}</label>
              <input
                className="dark-input"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                placeholder={t('auth.otpCodePlaceholder')}
                maxLength={6}
                style={{ letterSpacing: '0.2em', fontSize: '1.1rem' }}
              />
            </div>
            <button
              type="submit"
              className="approve-btn"
              disabled={loading}
              style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem' }}
            >
              {loading ? t('auth.verifying') : t('auth.verifyEmailBtn')}
            </button>
          </form>
          <p className="auth-switch" style={{ marginTop: '1rem' }}>
            {t('auth.didNotReceive')}{' '}
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              style={{ background: 'none', border: 'none', color: '#06b6d4', cursor: 'pointer', fontWeight: 500, fontSize: '0.875rem' }}
            >
              {resending ? t('auth.resending') : t('auth.resendOtp')}
            </button>
          </p>
          <p className="auth-switch"><Link to="/register">{t('auth.backToRegister')}</Link></p>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
