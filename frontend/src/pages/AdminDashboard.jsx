import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminDashboard, getAllExpenses, getAllReviews, getTrips } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { formatDate } from '../utils/helpers';

const CARDS = [
  { key: 'totalTrucks', label: 'Total Trucks', icon: '🚛', color: '#06b6d4' },
  { key: 'totalDrivers', label: 'Total Drivers', icon: '👤', color: '#8b5cf6' },
  { key: 'availableTrucks', label: 'Available Trucks', icon: '✅', color: '#10b981' },
  { key: 'assignedTrucks', label: 'Assigned Trucks', icon: '🔗', color: '#f59e0b' },
  { key: 'totalOrders', label: 'Total Orders', icon: '📦', color: '#3b82f6' },
];

const QUICK_ACTIONS = [
  { to: '/track', label: 'Live Truck Monitoring', icon: '📍', color: '#06b6d4' },
  { to: '/admin/users', label: 'Users', icon: '🧑‍💼', color: '#10b981' },
  { to: '/admin/orders', label: 'Orders', icon: '📦', color: '#3b82f6' },
  { to: '/admin/trucks', label: 'Trucks', icon: '🚛', color: '#10b981' },
  { to: '/admin/drivers', label: 'Drivers', icon: '👤', color: '#8b5cf6' },
  { to: '/admin/assign', label: 'Assign Truck', icon: '🔗', color: '#f59e0b' },
  { to: '/admin/trips', label: 'Trips', icon: '🗺', color: '#ef4444' },
  { to: '/admin/reports', label: 'Reports', icon: '📊', color: '#14b8a6' },
];

const STATUS_COLOR = {
  started: '#3b82f6',
  'in-transit': '#8b5cf6',
  completed: '#10b981',
};

const AdminDashboard = () => {
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
      <div className="dash-section-label">OVERVIEW</div>
      <h2 className="dash-title">Admin Control Center</h2>
      {error && <ErrorMessage message={error} />}

      <div className="admin-stat-grid">
        {CARDS.map(({ key, label, icon, color }) => (
          <div key={key} className="admin-stat-card">
            <div className="admin-stat-icon" style={{ background: `${color}22`, color }}>{icon}</div>
            <div className="admin-stat-info">
              <div className="admin-stat-val">{stats?.[key] ?? 0}</div>
              <div className="admin-stat-label">{label}</div>
            </div>
          </div>
        ))}
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: '#14b8a622', color: '#14b8a6' }}>📊</div>
          <div className="admin-stat-info">
            <div className="admin-stat-val">{avgRating}★</div>
            <div className="admin-stat-label">Average Rating</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: '#f9731622', color: '#f97316' }}>₹</div>
          <div className="admin-stat-info">
            <div className="admin-stat-val">₹{totalExpense}</div>
            <div className="admin-stat-label">Expense Total</div>
          </div>
        </div>
      </div>

      <div className="dash-section-label" style={{ marginBottom: '0.75rem' }}>QUICK ACTIONS</div>
      <div className="admin-quick-grid">
        {QUICK_ACTIONS.map((item) => (
          <Link key={item.to} to={item.to} className="admin-quick-card">
            <span className="admin-quick-icon" style={{ background: `${item.color}22`, color: item.color }}>{item.icon}</span>
            <div>
              <div className="admin-quick-label">{item.label}</div>
              <div className="admin-quick-sub">Open workspace</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="admin-monitor-grid">
        <div className="dark-card admin-monitor-panel">
          <div className="dark-card-label">LIVE TRIPS</div>
          {activeTrips.length === 0 ? (
            <div className="customer-tracker-empty">
              <p>No active trips right now.</p>
              <span>Assigned trips will show here once drivers start moving loads.</span>
            </div>
          ) : (
            activeTrips.map((trip) => (
              <div key={trip._id} className="admin-monitor-item">
                <div className="admin-monitor-head">
                  <div>
                    <div className="admin-monitor-title">Trip #{trip._id.slice(-6)}</div>
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
                  <span>Truck: {trip.truck?.truckNumber || '—'}</span>
                  <span>Driver: {trip.driver?.name || '—'}</span>
                  <span>Date: {formatDate(trip.createdAt)}</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="dark-card admin-monitor-panel">
          <div className="dark-card-label">SERVICE FEEDBACK</div>
          {recentReviews.length === 0 ? (
            <div className="customer-tracker-empty">
              <p>No reviews yet.</p>
              <span>Customer feedback and ratings will appear here after deliveries are completed.</span>
            </div>
          ) : (
            recentReviews.map((review) => (
              <div key={review._id} className="admin-monitor-item">
                <div className="admin-monitor-head">
                  <div>
                    <div className="admin-monitor-title">{review.customer?.name || 'Customer'}</div>
                    <div className="admin-monitor-sub">{review.feedback || 'No feedback text provided.'}</div>
                  </div>
                  <span className="status-badge" style={{ background: '#f59e0b22', color: '#f59e0b' }}>
                    {'★'.repeat(review.rating)}
                  </span>
                </div>
                <div className="admin-monitor-meta">
                  <span>Date: {formatDate(review.createdAt)}</span>
                  <span>Order: {review.order?.slice?.(-6) || review.order?._id?.slice?.(-6) || '—'}</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="dark-card admin-monitor-panel">
          <div className="dark-card-label">EXPENSE WATCH</div>
          {recentExpenses.length === 0 ? (
            <div className="customer-tracker-empty">
              <p>No expenses recorded yet.</p>
              <span>Trip fuel, toll, food, and maintenance records will show here as drivers log them.</span>
            </div>
          ) : (
            recentExpenses.map((expense) => (
              <div key={expense._id} className="admin-monitor-item">
                <div className="admin-monitor-head">
                  <div>
                    <div className="admin-monitor-title">{expense.driver?.name || 'Driver'}</div>
                    <div className="admin-monitor-sub">{expense.notes || 'Expense record submitted.'}</div>
                  </div>
                  <span className="status-badge" style={{ background: '#06b6d422', color: '#06b6d4' }}>
                    ₹{expense.totalExpense || 0}
                  </span>
                </div>
                <div className="admin-monitor-meta">
                  <span>Fuel: ₹{expense.fuelCost || 0}</span>
                  <span>Toll: ₹{expense.tollCost || 0}</span>
                  <span>Date: {formatDate(expense.createdAt)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="admin-footer-strip">
        <div>
          <div className="admin-footer-title">Operational Snapshot</div>
          <div className="admin-footer-sub">
            Trips: {trips.length} • Expenses: {expenses.length} • Reviews: {reviews.length}
          </div>
        </div>
        <Link to="/admin/reports" className="approve-btn">Open Reports</Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
