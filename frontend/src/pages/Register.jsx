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
  
    // ✅ Add this validation HERE (before loading starts)
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
  
    setLoading(true);
  
    try {
      const { confirmPassword, ...userData } = form; // optional best practice
      const data = await register(userData);
  
      navigate('/verify-otp', {
        state: { email: form.email, emailFailed: data?.emailFailed }
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