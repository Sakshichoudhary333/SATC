import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import LanguageSelector from './LanguageSelector';

const PAGE_TITLE_KEYS = {
  '/admin': 'pages.adminDashboard',
  '/admin/users': 'pages.users',
  '/admin/orders': 'pages.orders',
  '/admin/trucks': 'pages.trucks',
  '/admin/drivers': 'pages.drivers',
  '/admin/assign': 'pages.assignTruck',
  '/admin/trips': 'pages.trips',
  '/admin/expenses': 'pages.expenses',
  '/admin/reports': 'pages.reports',
  '/admin/billing': 'pages.billing',
  '/dashboard': 'pages.myOrders',
  '/place-order': 'pages.placeOrder',
  '/track': 'pages.trackTruck',
  '/driver': 'pages.driverDashboard',
  '/expenses': 'pages.expenses',
};

const TopBar = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const path = window.location.pathname;

  const titleKey = PAGE_TITLE_KEYS[path];
  const title = titleKey ? t(titleKey) : t('common.truckManagementSystem');
  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : user?.role?.[0]?.toUpperCase() || 'A';

  const roleLabel = user?.role ? t(`roles.${user.role}`) : '';

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h1 className="topbar-title">{title}</h1>
      </div>
      <div className="topbar-right">
        <LanguageSelector />
        <button className="topbar-notif" title={t('common.notifications')}>
          <span>🔔</span>
          <span className="notif-dot" />
        </button>
        <div className="topbar-avatar">{initials}</div>
        <div className="topbar-user">
          <div className="topbar-user-name">{user?.name || roleLabel}</div>
          <div className="topbar-user-sub">{roleLabel}</div>
        </div>
        <button className="topbar-logout" onClick={handleLogout}>{t('common.logout')}</button>
      </div>
    </header>
  );
};

export default TopBar;
