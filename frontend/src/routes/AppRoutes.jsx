import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import LoadingSpinner from '../components/LoadingSpinner';

const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const VerifyOtp = lazy(() => import('../pages/VerifyOtp'));
const ForgotPassword = lazy(() => import('../pages/ForgotPassword'));
const CustomerDashboard = lazy(() => import('../pages/CustomerDashboard'));
const PlaceOrder = lazy(() => import('../pages/PlaceOrder'));
const OrderDetails = lazy(() => import('../pages/OrderDetails'));
const TrackTruck = lazy(() => import('../pages/TrackTruck'));
const DriverDashboard = lazy(() => import('../pages/DriverDashboard'));
const ExpenseForm = lazy(() => import('../pages/ExpenseForm'));
const ReviewForm = lazy(() => import('../pages/ReviewForm'));
const AdminDashboard = lazy(() => import('../pages/AdminDashboard'));
const AdminUsers = lazy(() => import('../pages/AdminUsers'));
const AdminOrders = lazy(() => import('../pages/AdminOrders'));
const AdminTrucks = lazy(() => import('../pages/AdminTrucks'));
const AdminDrivers = lazy(() => import('../pages/AdminDrivers'));
const AdminAssignTruck = lazy(() => import('../pages/AdminAssignTruck'));
const AdminTrips = lazy(() => import('../pages/AdminTrips'));
const AdminReports = lazy(() => import('../pages/AdminReports'));
const AdminExpenses = lazy(() => import('../pages/AdminExpenses'));
const Unauthorized = lazy(() => import('../pages/Unauthorized'));
const TestMap = lazy(() => import('../pages/TestMap'));
const Billing = lazy(() => import('../pages/Billing'));
const AdminMaintenance = lazy(() => import('../pages/AdminMaintenance'));
const LiveTruckTrack = lazy(() => import('../pages/LiveTruckTrack'));
const LandingPage = lazy(() => import('../pages/LandingPage'));
const AboutUs = lazy(() => import('../pages/AboutUs'));
const Careers = lazy(() => import('../pages/Careers'));
const ContactUs = lazy(() => import('../pages/ContactUs'));
const Faq = lazy(() => import('../pages/Faq'));
const FeaturesPage = lazy(() => import('../pages/FeaturesPage'));
const HowItWorks = lazy(() => import('../pages/HowItWorks'));
const PrivacyPolicy = lazy(() => import('../pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('../pages/TermsOfService'));


const A = ({ children }) => <ProtectedRoute roles={['admin']}>{children}</ProtectedRoute>;
const D = ({ children }) => <ProtectedRoute roles={['driver']}>{children}</ProtectedRoute>;
const C = ({ children }) => <ProtectedRoute roles={['customer']}>{children}</ProtectedRoute>;
const S = ({ children }) => <ProtectedRoute roles={['customer', 'driver', 'admin']}>{children}</ProtectedRoute>;

const AppRoutes = () => (
  <Suspense fallback={<LoadingSpinner />}>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/careers" element={<Careers />} />
      <Route path="/contact" element={<ContactUs />} />
      <Route path="/faq" element={<Faq />} />
      <Route path="/features" element={<FeaturesPage />} />
      <Route path="/how-it-works" element={<HowItWorks />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-of-service" element={<TermsOfService />} />
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
      <Route path="/admin/expenses" element={<A><AdminExpenses /></A>} />
      <Route path="/admin/reports" element={<A><AdminReports /></A>} />
      <Route path="/admin/maintenance" element={<A><AdminMaintenance /></A>} />
      <Route path="/track/truck/:truckId" element={<LiveTruckTrack />} />
      <Route path="/test-map" element={<TestMap />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </Suspense>
);

export default AppRoutes;
