import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';

import Login from '../pages/Login';
import Register from '../pages/Register';
import VerifyOtp from '../pages/VerifyOtp';
import ForgotPassword from '../pages/ForgotPassword';
import CustomerDashboard from '../pages/CustomerDashboard';
import PlaceOrder from '../pages/PlaceOrder';
import OrderDetails from '../pages/OrderDetails';
import TrackTruck from '../pages/TrackTruck';
import DriverDashboard from '../pages/DriverDashboard';
import ExpenseForm from '../pages/ExpenseForm';
import ReviewForm from '../pages/ReviewForm';
import AdminDashboard from '../pages/AdminDashboard';
import AdminUsers from '../pages/AdminUsers';
import AdminOrders from '../pages/AdminOrders';
import AdminTrucks from '../pages/AdminTrucks';
import AdminDrivers from '../pages/AdminDrivers';
import AdminAssignTruck from '../pages/AdminAssignTruck';
import AdminTrips from '../pages/AdminTrips';
import AdminReports from '../pages/AdminReports';
import Unauthorized from '../pages/Unauthorized';
import TestMap from '../pages/TestMap';
import Billing from "../pages/Billing";


const A = ({ children }) => <ProtectedRoute roles={['admin']}>{children}</ProtectedRoute>;
const D = ({ children }) => <ProtectedRoute roles={['driver']}>{children}</ProtectedRoute>;
const C = ({ children }) => <ProtectedRoute roles={['customer']}>{children}</ProtectedRoute>;
const S = ({ children }) => <ProtectedRoute roles={['customer', 'driver', 'admin']}>{children}</ProtectedRoute>;

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/login" replace />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/verify-otp" element={<VerifyOtp />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/reset-password" element={<ForgotPassword />} />
    <Route path="/unauthorized" element={<Unauthorized />} />

    {/* Customer */}
    <Route path="/dashboard" element={<C><CustomerDashboard /></C>} />
    <Route path="/place-order" element={<C><PlaceOrder /></C>} />
    <Route path="/order/:id" element={<C><OrderDetails /></C>} />
    <Route path="/review/:orderId" element={<C><ReviewForm /></C>} />

    {/* Shared */}
    <Route path="/track" element={<S><TrackTruck /></S>} />

    {/* Driver */}
    <Route path="/driver" element={<D><DriverDashboard /></D>} />
    <Route path="/expenses" element={<D><ExpenseForm /></D>} />

    {/* Admin */}

<Route path="/admin/billing" element={<A><Billing /></A>} />
    <Route path="/admin" element={<A><AdminDashboard /></A>} />
    <Route path="/admin/users" element={<A><AdminUsers /></A>} />
    <Route path="/admin/orders" element={<A><AdminOrders /></A>} />
    <Route path="/admin/trucks" element={<A><AdminTrucks /></A>} />
    <Route path="/admin/drivers" element={<A><AdminDrivers /></A>} />
    <Route path="/admin/assign" element={<A><AdminAssignTruck /></A>} />
    <Route path="/admin/trips" element={<A><AdminTrips /></A>} />
    <Route path="/admin/reports" element={<A><AdminReports /></A>} />
    <Route path="/test-map" element={<TestMap />} />

    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>
);

export default AppRoutes;
