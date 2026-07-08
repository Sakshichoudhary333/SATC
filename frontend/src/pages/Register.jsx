import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ErrorMessage from '../components/ErrorMessage';

const Register = () => {
  const { register } = useAuth();
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

    if (name.length < 2 || name.length > 60) return setError('Name must be 2–60 characters.');
    if (!/^[A-Za-z\s'-]+$/.test(name)) return setError('Name contains invalid characters.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError('Invalid email format.');
    if (form.password.length < 6) return setError('Password must be at least 6 characters.');
    if (!/[A-Z]/.test(form.password)) return setError('Password must contain an uppercase letter.');
    if (!/[a-z]/.test(form.password)) return setError('Password must contain a lowercase letter.');
    if (!/[0-9]/.test(form.password)) return setError('Password must contain a number.');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match.');

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
        <div className="auth-brand">TMS</div>
        <h1 className="auth-headline">Join the platform</h1>
        <p className="auth-sub">
          Create your account to start managing logistics efficiently.
        </p>
      </div>

      <div className="auth-right">
        <div className="auth-box">
          <h2 className="auth-box-title">Register</h2>

          {error && <ErrorMessage message={error} />}

          <form onSubmit={handleSubmit}>
            <div className="dark-form-group">
              <label>Full Name</label>
              <input
                className="dark-input"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="John Doe"
              />
            </div>

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
              />
            </div>

            <div className="dark-form-group">
              <label>Password</label>
              <input
                className="dark-input"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
              />
            </div>

            <div className="dark-form-group">
  <label>Confirm Password</label>
  <input
    className="dark-input"
    name="confirmPassword"
    type="password"
    value={form.confirmPassword}
    onChange={handleChange}
    required
    placeholder="••••••••"
  />
</div>

            <div className="dark-form-group">
              <label>Role</label>
              <select
                className="dark-input"
                name="role"
                value={form.role}
                onChange={handleChange}
              >
                <option value="customer">Customer</option>
                <option value="driver">Driver</option>
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
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;