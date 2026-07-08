import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import ErrorMessage from '../components/ErrorMessage';
import { verifyRegisterOtp, resendRegisterOtp } from '../services/api';

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
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

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError('Invalid email format.');
    if (!/^\d{6}$/.test(otp.trim())) return setError('OTP must be exactly 6 digits.');

    setLoading(true);
    try {
      await verifyRegisterOtp({ email, otp });
      setSuccess('Email verified! Redirecting to login...');
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
      setSuccess(data.message || 'OTP resent! Check your inbox.');
    } catch (err) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-left">
        <div className="auth-brand">TMS</div>
        <h1 className="auth-headline">Verify your email</h1>
        <p className="auth-sub">
          We sent a 6-digit OTP to your email. Enter it below to activate your account.
        </p>
      </div>
      <div className="auth-right">
        <div className="auth-box">
          <h2 className="auth-box-title">Enter OTP</h2>
          <p className="auth-box-sub">
            Check your inbox at <strong>{email || 'your email'}</strong>
          </p>
          {error && <ErrorMessage message={error} />}
          {success && <div className="dark-success">✅ {success}</div>}
          {emailFailed && (
            <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: '#fcd34d', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>
              ⚠️ OTP email failed to send. Click <strong>Resend OTP</strong> below to try again.
            </div>
          )}
          <form onSubmit={handleVerify}>
            {!location.state?.email && (
              <div className="dark-form-group">
                <label>Email</label>
                <input
                  className="dark-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                />
              </div>
            )}
            <div className="dark-form-group">
              <label>OTP Code</label>
              <input
                className="dark-input"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                placeholder="Enter 6-digit OTP"
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
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>
          </form>
          <p className="auth-switch" style={{ marginTop: '1rem' }}>
            Didn't receive it?{' '}
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              style={{ background: 'none', border: 'none', color: '#06b6d4', cursor: 'pointer', fontWeight: 500, fontSize: '0.875rem' }}
            >
              {resending ? 'Resending...' : 'Resend OTP'}
            </button>
          </p>
          <p className="auth-switch"><Link to="/register">← Back to Register</Link></p>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
