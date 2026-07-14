import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { FaBox, FaPlus, FaMapMarkerAlt, FaTruck, FaMoneyBillWave, FaUser, FaRoute, FaHome } from 'react-icons/fa';
import { MdDashboard, MdPayment, MdPeople, MdAssessment, MdReceipt } from 'react-icons/md';
import { HiOutlineLink } from 'react-icons/hi';

const NAV = {
  admin: [
    { to: '/', labelKey: 'nav.homePage', icon: <FaHome /> },
    { to: '/admin/billing', labelKey: 'nav.billing', icon: <MdPayment /> },
    { to: '/admin', labelKey: 'nav.dashboard', icon: <MdDashboard /> },
    { to: '/track', labelKey: 'nav.liveTrack', icon: <FaMapMarkerAlt /> },
    { to: '/admin/users', labelKey: 'nav.users', icon: <MdPeople /> },
    { to: '/admin/trucks', labelKey: 'nav.trucks', icon: <FaTruck /> },
    { to: '/admin/drivers', labelKey: 'nav.drivers', icon: <FaUser /> },
    { to: '/admin/assign', labelKey: 'nav.assignTruck', icon: <HiOutlineLink /> },
    { to: '/admin/orders', labelKey: 'nav.orders', icon: <FaBox /> },
    { to: '/admin/trips', labelKey: 'nav.trips', icon: <FaRoute /> },
    { to: '/admin/expenses', labelKey: 'nav.expenses', icon: <MdReceipt /> },
    { to: '/admin/reports', labelKey: 'nav.reports', icon: <MdAssessment /> },
  ],
  driver: [
    { to: '/', labelKey: 'nav.homePage', icon: <FaHome /> },
    { to: '/driver', labelKey: 'nav.myTrips', icon: <FaRoute /> },
    { to: '/expenses', labelKey: 'nav.expenses', icon: <FaMoneyBillWave /> },
    { to: '/track', labelKey: 'nav.track', icon: <FaMapMarkerAlt /> },
  ],
  customer: [
    { to: '/', labelKey: 'nav.homePage', icon: <FaHome /> },
    { to: '/dashboard', labelKey: 'nav.myOrders', icon: <FaBox /> },
    { to: '/place-order', labelKey: 'nav.placeOrder', icon: <FaPlus /> },
    { to: '/track', labelKey: 'nav.trackTruck', icon: <FaMapMarkerAlt /> },
  ],
};

const ROLE_LABEL_KEYS = {
  admin: 'roles.tmsAdmin',
  driver: 'roles.tmsDriver',
  customer: 'roles.tmsCustomer',
};

const Sidebar = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const links = user ? (NAV[user.role] || []) : [];
  const roleLabel = user ? t(ROLE_LABEL_KEYS[user.role]) : '';
  const roleDesc = user?.role && user.role !== 'admin' ? t(`roleDesc.${user.role}`) : user?.role === 'admin' ? t('roleDesc.admin') : '';

  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <div className="sidebar-brand">{roleLabel}</div>
        <h2 className="sidebar-title">{t('common.logisticsControl')}</h2>
        <p className="sidebar-desc">{roleDesc}</p>
      </div>

      <nav className="sidebar-nav">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === '/' || l.to === '/admin' || l.to === '/driver' || l.to === '/dashboard'}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          >
            <span className="sidebar-icon">{l.icon}</span>
            {t(l.labelKey)}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
