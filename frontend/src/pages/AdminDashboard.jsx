import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminDashboard, getAllExpenses, getAllReviews, getTrips } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { formatDate } from '../utils/helpers';
import { useLanguage } from '../context/LanguageContext';
import {FaTruck, FaUser, FaBox,FaMapMarkerAlt,FaMoneyBillWave,FaRoute,FaCheckCircle} from "react-icons/fa";
import {MdPayment,MdPeople,MdAssessment} from "react-icons/md";
import {HiOutlineLink} from "react-icons/hi";

const CARDS = [
  { key: 'totalTrucks', labelKey: 'adminDashboard.totalTrucks', icon: <FaTruck/>, color: '#06b6d4' },
  { key: 'totalDrivers', labelKey: 'adminDashboard.totalDrivers', icon: <FaUser/>, color: '#8b5cf6' },
  { key: 'availableTrucks', labelKey: 'adminDashboard.availableTrucks', icon: <FaCheckCircle/>, color: '#10b981' },
  { key: 'assignedTrucks', labelKey: 'adminDashboard.assignedTrucks', icon: <HiOutlineLink/>, color: '#f59e0b' },
  { key: 'totalOrders', labelKey: 'adminDashboard.totalOrders', icon: <FaBox/>, color: '#3b82f6' },
];

const QUICK_ACTIONS = [
  { to: '/track', labelKey: 'adminDashboard.liveTruckMonitoring', icon: <FaMapMarkerAlt/>, color: '#06b6d4' },
  { to: '/admin/billing', labelKey: 'nav.billing', icon: <FaMoneyBillWave/>, color: '#22c55e' },
  { to: '/admin/users', labelKey: 'nav.users', icon: <MdPeople/>, color: '#10b981' },
  { to: '/admin/orders', labelKey: 'nav.orders', icon: <FaBox/>, color: '#3b82f6' },
  { to: '/admin/trucks', labelKey: 'nav.trucks', icon: <FaBox/>, color: '#10b981' },
  { to: '/admin/drivers', labelKey: 'nav.drivers', icon: <FaUser/>, color: '#8b5cf6' },
  { to: '/admin/assign', labelKey: 'nav.assignTruck', icon: <HiOutlineLink/>, color: '#f59e0b' },
  { to: '/admin/trips', labelKey: 'nav.trips', icon: <FaRoute/>, color: '#ef4444' },
  { to: '/admin/reports', labelKey: 'nav.reports', icon: <MdAssessment/>, color: '#14b8a6' },
];

const STATUS_COLOR = {
  started: '#3b82f6',
  'in-transit': '#8b5cf6',
  completed: '#10b981',
};

const AdminDashboard = () => {
  const { t } = useLanguage();
  const [stats, setStats] = useState(null);
  const [trips, setTrips] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getAdminDashboard(), getTrips(), getAllExpenses(), getAllReviews()])
      .then(([dashboardStats, tripList, expenseList, reviewList]) => {
        setStats(dashboardStats);
        setTrips(Array.isArray(tripList) ? tripList : []);
        setExpenses(Array.isArray(expenseList) ? expenseList : []);
        setReviews(Array.isArray(reviewList) ? reviewList : []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const activeTrips = useMemo(() => trips.filter((trip) => trip.status !== 'completed').slice(0, 3), [trips]);
  const recentExpenses = useMemo(() => expenses.slice(0, 3), [expenses]);
  const recentReviews = useMemo(() => reviews.slice(0, 3), [reviews]);

  const totalExpense = expenses.reduce((sum, expense) => sum + (expense.totalExpense || 0), 0);
  const avgRating = reviews.length
    ? (reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length).toFixed(1)
    : '—';

  if (loading) return <LoadingSpinner />;

  return (
    <div className="dash-page">
      <div className="dash-section-label">{t('adminDashboard.overview')}</div>
      <h2 className="dash-title">{t('adminDashboard.controlCenter')}</h2>
      {error && <ErrorMessage message={error} />}

      <div className="admin-stat-grid">
        {CARDS.map(({ key, labelKey, icon, color }) => (
          <div key={key} className="admin-stat-card">
            <div className="admin-stat-icon" style={{ background: `${color}22`, color }}>{icon}</div>
            <div className="admin-stat-info">
              <div className="admin-stat-val">{stats?.[key] ?? 0}</div>
              <div className="admin-stat-label">{t(labelKey)}</div>
            </div>
          </div>
        ))}
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: '#14b8a622', color: '#14b8a6' }}>📊</div>
          <div className="admin-stat-info">
            <div className="admin-stat-val">{avgRating}★</div>
            <div className="admin-stat-label">{t('adminDashboard.avgRating')}</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: '#f9731622', color: '#f97316' }}>₹</div>
          <div className="admin-stat-info">
            <div className="admin-stat-val">₹{totalExpense}</div>
            <div className="admin-stat-label">{t('adminDashboard.expenseTotal')}</div>
          </div>
        </div>
      </div>

      <div className="dash-section-label" style={{ marginBottom: '0.75rem' }}>{t('adminDashboard.quickActions')}</div>
      <div className="admin-quick-grid">
        {QUICK_ACTIONS.map((item) => (
          <Link key={item.to} to={item.to} className="admin-quick-card">
            <span className="admin-quick-icon" style={{ background: `${item.color}22`, color: item.color }}>{item.icon}</span>
            <div>
              <div className="admin-quick-label">{t(item.labelKey)}</div>
              <div className="admin-quick-sub">{t('adminDashboard.openWorkspace')}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="admin-monitor-grid">
        <div className="dark-card admin-monitor-panel">
          <div className="dark-card-label">{t('adminDashboard.liveTrips')}</div>
          {activeTrips.length === 0 ? (
            <div className="customer-tracker-empty">
              <p>{t('adminDashboard.noActiveTrips')}</p>
              <span>{t('adminDashboard.assignedTripsDesc')}</span>
            </div>
          ) : (
            activeTrips.map((trip) => (
              <div key={trip._id} className="admin-monitor-item">
                <div className="admin-monitor-head">
                  <div>
                    <div className="admin-monitor-title">{t('adminDashboard.tripHash')}{trip._id.slice(-6)}</div>
                    <div className="admin-monitor-sub">
                      {trip.order?.pickupLocation || '—'} → {trip.order?.destination || '—'}
                    </div>
                  </div>
                  <span
                    className="status-badge"
                    style={{
                      background: `${STATUS_COLOR[trip.status] || '#94a3b8'}22`,
                      color: STATUS_COLOR[trip.status] || '#94a3b8',
                    }}
                  >
                    {trip.status}
                  </span>
                </div>
                <div className="admin-monitor-meta">
                  <span>{t('adminDashboard.truckColon')} {trip.truck?.truckNumber || '—'}</span>
                  <span>{t('adminDashboard.driverColon')} {trip.driver?.name || '—'}</span>
                  <span>{t('adminDashboard.dateColon')} {formatDate(trip.createdAt)}</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="dark-card admin-monitor-panel">
          <div className="dark-card-label">{t('adminDashboard.serviceFeedback')}</div>
          {recentReviews.length === 0 ? (
            <div className="customer-tracker-empty">
              <p>{t('adminDashboard.noReviewsYet')}</p>
              <span>{t('adminDashboard.reviewsDesc')}</span>
            </div>
          ) : (
            recentReviews.map((review) => (
              <div key={review._id} className="admin-monitor-item">
                <div className="admin-monitor-head">
                  <div>
                    <div className="admin-monitor-title">{review.customer?.name || t('roles.customer')}</div>
                    <div className="admin-monitor-sub">{review.feedback || t('adminDashboard.noFeedbackText')}</div>
                  </div>
                  <span className="status-badge" style={{ background: '#f59e0b22', color: '#f59e0b' }}>
                    {'★'.repeat(review.rating)}
                  </span>
                </div>
                <div className="admin-monitor-meta">
                  <span>{t('adminDashboard.dateColon')} {formatDate(review.createdAt)}</span>
                  <span>{t('adminDashboard.orderColon')} {review.order?.slice?.(-6) || review.order?._id?.slice?.(-6) || '—'}</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="dark-card admin-monitor-panel">
          <div className="dark-card-label">{t('adminDashboard.expenseWatch')}</div>
          {recentExpenses.length === 0 ? (
            <div className="customer-tracker-empty">
              <p>{t('adminDashboard.noExpensesYet')}</p>
              <span>{t('adminDashboard.expensesDesc')}</span>
            </div>
          ) : (
            recentExpenses.map((expense) => (
              <div key={expense._id} className="admin-monitor-item">
                <div className="admin-monitor-head">
                  <div>
                    <div className="admin-monitor-title">{expense.driver?.name || t('roles.driver')}</div>
                    <div className="admin-monitor-sub">{expense.notes || t('adminDashboard.expenseRecordSubmitted')}</div>
                  </div>
                  <span className="status-badge" style={{ background: '#06b6d422', color: '#06b6d4' }}>
                    ₹{expense.totalExpense || 0}
                  </span>
                </div>
                <div className="admin-monitor-meta">
                  <span>{t('adminDashboard.fuelColon')} ₹{expense.fuelCost || 0}</span>
                  <span>{t('adminDashboard.tollColon')} ₹{expense.tollCost || 0}</span>
                  <span>{t('adminDashboard.dateColon')} {formatDate(expense.createdAt)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="admin-footer-strip">
        <div>
          <div className="admin-footer-title">{t('adminDashboard.operationalSnapshot')}</div>
          <div className="admin-footer-sub">
            {t('adminDashboard.trips')}: {trips.length} • {t('adminDashboard.expenses')}: {expenses.length} • {t('adminDashboard.reviews')}: {reviews.length}
          </div>
        </div>
        <Link to="/admin/reports" className="approve-btn">{t('adminDashboard.openReports')}</Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
