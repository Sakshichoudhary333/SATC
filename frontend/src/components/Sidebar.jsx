import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV = {
  admin: [
    { to: '/admin', label: 'Dashboard', icon: '▣' },
    { to: '/track', label: 'Live Track', icon: '📍' },
    { to: '/admin/users', label: 'Users', icon: '🧑‍💼' },
    { to: '/admin/trucks', label: 'Trucks', icon: '🚛' },
    { to: '/admin/drivers', label: 'Drivers', icon: '👤' },
    { to: '/admin/assign', label: 'Assign Truck', icon: '🔗' },
    { to: '/admin/orders', label: 'Orders', icon: '📦' },
    { to: '/admin/trips', label: 'Trips', icon: '🗺' },
    { to: '/admin/reports', label: 'Reports', icon: '📊' },
  ],
  driver: [
    { to: '/driver', label: 'My Trips', icon: '🚚' },
    { to: '/expenses', label: 'Expenses', icon: '💰' },
    { to: '/track', label: 'Track', icon: '📍' },
  ],
  customer: [
    { to: '/dashboard', label: 'My Orders', icon: '📦' },
    { to: '/place-order', label: 'Place Order', icon: '➕' },
    { to: '/track', label: 'Track Truck', icon: '📍' },
  ],
};

const ROLE_LABEL = { admin: 'TMS ADMIN', driver: 'TMS DRIVER', customer: 'TMS CUSTOMER' };
const ROLE_DESC = {
  driver: 'Manage your trips, expenses,\nand share live location.',
  customer: 'Place orders, track trucks,\nand review deliveries.',
};

const Sidebar = () => {
  const { user } = useAuth();

  const links = user ? (NAV[user.role] || []) : [];
  const roleLabel = user ? ROLE_LABEL[user.role] : '';
  const roleDesc = user ? ROLE_DESC[user.role] : '';

  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <div className="sidebar-brand">{roleLabel}</div>
        <h2 className="sidebar-title">Logistics control</h2>
        <p className="sidebar-desc">{roleDesc}</p>
      </div>

      <nav className="sidebar-nav">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === '/admin' || l.to === '/driver' || l.to === '/dashboard'}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          >
            <span className="sidebar-icon">{l.icon}</span>
            {l.label}
          </NavLink>
        ))}
      </nav>

    </aside>
  );
};

export default Sidebar;
