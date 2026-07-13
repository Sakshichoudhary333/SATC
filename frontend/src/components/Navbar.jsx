import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaBox, FaPlus, FaMapMarkerAlt, FaTruck, FaMoneyBillWave } from "react-icons/fa";
import { MdDashboard } from "react-icons/md";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = {
    customer: [
      { to: '/dashboard', label:'My Orders', icon: <FaBox /> },
      { to: '/place-order', label:'Place Order',icon: <FaPlus /> },
      { to: '/track', label:'Track Truck',icon: <FaMapMarkerAlt /> },
    ],
    driver: [
      { to: '/driver', label:'My Trips' ,icon: <FaTruck />},
      { to: '/expenses', label:'Expenses',icon: <FaMoneyBillWave />},
    ],
    admin: [
      { to: '/admin', label:'Dashboard',icon: <MdDashboard /> },
    ],
  };

  const links = user ? (navLinks[user.role] || []) : [];

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand"> TruckMS</Link>
      <div className="navbar-links">
        {links.map((l) => (
          <Link key={l.to} to={l.to} className='nav-link'> 
          {l.icon}
          <span>
          {l.label}
          </span>
          </Link>
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
