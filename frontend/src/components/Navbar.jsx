import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { FaBox, FaPlus, FaMapMarkerAlt, FaTruck, FaMoneyBillWave } from "react-icons/fa";
import { MdDashboard } from "react-icons/md";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = {
    customer: [
      { to: '/dashboard', labelKey: 'nav.myOrders', icon: <FaBox /> },
      { to: '/place-order', labelKey: 'nav.placeOrder', icon: <FaPlus /> },
      { to: '/track', labelKey: 'nav.trackTruck', icon: <FaMapMarkerAlt /> },
    ],
    driver: [
      { to: '/driver', labelKey: 'nav.myTrips', icon: <FaTruck /> },
      { to: '/expenses', labelKey: 'nav.expenses', icon: <FaMoneyBillWave /> },
    ],
    admin: [
      { to: '/admin', labelKey: 'nav.dashboard', icon: <MdDashboard /> },
    ],
  };

  const links = user ? (navLinks[user.role] || []) : [];

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand"> {t('navbar.brand')}</Link>
      <div className="navbar-links">
        {links.map((l) => (
          <Link key={l.to} to={l.to} className='nav-link'> 
            {l.icon}
            <span>
              {t(l.labelKey)}
            </span>
          </Link>
        ))}
        {user ? (
          <button onClick={handleLogout} className="btn btn-outline">{t('navbar.logout')}</button>
        ) : (
          <>
            <Link to="/login">{t('navbar.login')}</Link>
            <Link to="/register">{t('navbar.register')}</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
