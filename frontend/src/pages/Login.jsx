import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ErrorMessage from '../components/ErrorMessage';

const Login = () => {
  const { login, setSession } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const email = form.email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError('Invalid email format.');
    if (!form.password) return setError('Password is required.');

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
    <div className="auth-screen">
      <div className="auth-left">
        <div className="auth-brand">TMS</div>
        <h1 className="auth-headline">Logistics control</h1>
        <p className="auth-sub">Truck Management System — manage orders, drivers, and deliveries in one place.</p>
      </div>
      <div className="auth-right">
        <div className="auth-box">
          <h2 className="auth-box-title">Login here</h2>
          {/* <p className="auth-box-sub">Enter your credentials to continue</p> */}
          {error && <ErrorMessage message={error} />}
          <form onSubmit={handleSubmit}>
            <div className="dark-form-group">
              <label>Email</label>
              <input className="dark-input" name="email" type="email" value={form.email} onChange={handleChange} required placeholder="you@example.com" />
            </div>
            <div className="dark-form-group">
              <label>Password</label>
              <input className="dark-input" name="password" type="password" value={form.password} onChange={handleChange} required placeholder="••••••••" />
            </div>
            <div style={{ textAlign: 'right', marginTop: '-0.5rem', marginBottom: '1rem' }}>
              <Link to="/forgot-password" className="forgot-password-link">
                Forgot password?
              </Link>
            </div>
            <button type="submit" className="approve-btn" disabled={loading} style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem' }}>
              {loading ? 'Signing...' : 'Sign In'}
            </button>
          </form>
          <p className="auth-switch">Don't have an account? <Link to="/register">Register</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login; 
