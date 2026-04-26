import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ErrorMessage from '../components/ErrorMessage';
import { forgotPasswordUser, resetPasswordUser } from '../services/api';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('request');
  const [form, setForm] = useState({
    email: '',
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
    setLoading(true);

    try {
      await forgotPasswordUser({ email: form.email });
      setSuccess('A reset OTP has been sent to your email.');
      setStep('reset');
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

    if (form.newPassword !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await resetPasswordUser({
        email: form.email,
        otp: form.otp,
        newPassword: form.newPassword,
      });
      setSuccess('Password reset successfully. Redirecting to login...');
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
        <div className="auth-brand">TMS</div>
        <h1 className="auth-headline">Reset your password</h1>
        <p className="auth-sub">
          We&apos;ll send a one-time code to your email, then you can choose a new password and get back into your account.
        </p>
      </div>
      <div className="auth-right">
        <div className="auth-box">
          <h2 className="auth-box-title">Forgot password</h2>
          <p className="auth-box-sub">
            {step === 'request'
              ? 'Enter your account email to receive a reset OTP.'
              : 'Enter the OTP and your new password.'}
          </p>

          {error && <ErrorMessage message={error} />}
          {success && <div className="dark-success">{success}</div>}

          <form onSubmit={step === 'request' ? handleSendOtp : handleResetPassword}>
            <div className="dark-form-group">
              <label>Email</label>
              <input
                className="dark-input"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            {step === 'reset' && (
              <>
                <div className="dark-form-group">
                  <label>OTP Code</label>
                  <input
                    className="dark-input"
                    name="otp"
                    value={form.otp}
                    onChange={handleChange}
                    required
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                    autoComplete="one-time-code"
                    style={{ letterSpacing: '0.2em', fontSize: '1.1rem' }}
                  />
                </div>
                <div className="dark-form-group">
                  <label>New Password</label>
                  <input
                    className="dark-input"
                    name="newPassword"
                    type="password"
                    value={form.newPassword}
                    onChange={handleChange}
                    required
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                </div>
                <div className="dark-form-group">
                  <label>Confirm New Password</label>
                  <input
                    className="dark-input"
                    name="confirmPassword"
                    type="password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder="••••••••"
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
                ? (step === 'request' ? 'Sending OTP...' : 'Resetting...')
                : (step === 'request' ? 'Send Reset OTP' : 'Reset Password')}
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
              }}
            >
              Change email
            </button>
          )}

          <p className="auth-switch">
            Remember your password? <Link to="/login">Back to login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
