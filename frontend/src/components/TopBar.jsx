import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PAGE_TITLES = {
  '/admin': 'Admin Dashboard',
  '/admin/users': 'Users',
  '/admin/orders': 'Orders',
  '/admin/trucks': 'Trucks',
  '/admin/drivers': 'Drivers',
  '/admin/assign': 'Assign Truck',
  '/admin/trips': 'Trips',
  '/admin/reports': 'Reports',
  '/dashboard': 'My Orders',
  '/place-order': 'Place Order',
  '/track': 'Track Truck',
  '/driver': 'Driver Dashboard',
  '/expenses': 'Expenses',
};

const TopBar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const path = window.location.pathname;

  const title = PAGE_TITLES[path] || 'Truck Management System';
  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : user?.role?.[0]?.toUpperCase() || 'A';

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h1 className="topbar-title">{title}</h1>
      </div>
      <div className="topbar-right">
        <button className="topbar-notif" title="Notifications">
          <span>🔔</span>
          <span className="notif-dot" />
        </button>
        <div className="topbar-avatar">{initials}</div>
        <div className="topbar-user">
          <div className="topbar-user-name">{user?.name || 'Admin'}</div>
          <div className="topbar-user-sub">{user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ''}</div>
        </div>
        <button className="topbar-logout" onClick={handleLogout}>Logout</button>
      </div>
    </header>
  );
};

export default TopBar;
