import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaBox, FaPlus, FaMapMarkerAlt, FaTruck, FaMoneyBillWave ,FaUser,FaRoute} from "react-icons/fa"; 
import { MdDashboard,MdPayment,MdPeople,MdAssessment } from "react-icons/md";
import { HiOutlineLink } from "react-icons/hi";
const NAV = {
  admin: [
    { to: '/admin/billing', label: 'Billing', icon: <MdPayment /> },
    { to: '/admin', label: 'Dashboard', icon: <MdDashboard /> },
    { to: '/track', label: 'Live Track', icon: <FaMapMarkerAlt /> },
    { to: '/admin/users', label: 'Users', icon:  <MdPeople /> },
    { to: '/admin/trucks', label: 'Trucks', icon: <FaTruck /> },
    { to: '/admin/drivers', label: 'Drivers', icon:  <FaUser /> },
    { to: '/admin/assign', label: 'Assign Truck', icon: <HiOutlineLink /> },
    { to: '/admin/orders', label: 'Orders', icon: <FaBox /> },
    { to: '/admin/trips', label: 'Trips', icon: <FaRoute /> },
    { to: '/admin/reports', label: 'Reports', icon: <MdAssessment /> },
  ],
  driver: [
    { to: '/driver', label: 'My Trips', icon: <FaRoute /> },
    { to: '/expenses', label: 'Expenses', icon: <FaMoneyBillWave /> },
    { to: '/track', label: 'Track', icon: <FaMapMarkerAlt /> },
  ],
  customer: [
    { to: '/dashboard', label: 'My Orders', icon: <FaBox /> },
    { to: '/place-order', label: 'Place Order', icon: <FaPlus /> },
    { to: '/track', label: 'Track Truck', icon: <FaMapMarkerAlt /> },
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
