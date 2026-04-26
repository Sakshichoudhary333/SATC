import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = {
    customer: [
      { to: '/dashboard', label: '📦 My Orders' },
      { to: '/place-order', label: '➕ Place Order' },
      { to: '/track', label: '📍 Track Truck' },
    ],
    driver: [
      { to: '/driver', label: '🚚 My Trips' },
      { to: '/expenses', label: '💰 Expenses' },
    ],
    admin: [
      { to: '/admin', label: '🛠 Dashboard' },
    ],
  };

  const links = user ? (navLinks[user.role] || []) : [];

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">🚛 TruckMS</Link>
      <div className="navbar-links">
        {links.map((l) => (
          <Link key={l.to} to={l.to}>{l.label}</Link>
        ))}
        {user ? (
          <button onClick={handleLogout} className="btn btn-outline">Logout</button>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
