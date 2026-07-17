import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { FaSun, FaMoon } from 'react-icons/fa';

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
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };
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
        <button 
          onClick={toggleTheme} 
          className="theme-toggle-btn" 
          aria-label="Toggle Theme"
          style={{
            background: 'transparent',
            border: '1.5px solid var(--border)',
            color: 'var(--text)',
            borderRadius: '8px',
            padding: '0.4rem 0.65rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.15s',
            fontSize: '0.9rem'
          }}
        >
          {theme === 'dark' ? <FaSun size={13} color="#f59e0b" /> : <FaMoon size={13} color="#0891b2" />}
        </button>

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
