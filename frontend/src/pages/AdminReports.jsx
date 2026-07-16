import { useEffect, useState } from 'react';
import { getAllExpenses, getAllReviews, getAllOrders } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { formatDate } from '../utils/helpers';
import { useLanguage } from '../context/LanguageContext';

const AdminReports = () => {
  const [expenses, setExpenses] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { t } = useLanguage();

  useEffect(() => {
    Promise.all([getAllExpenses(), getAllReviews(), getAllOrders()])
      .then(([exp, rev, ord]) => {
        setExpenses(exp);
        setReviews(rev);
        setOrders(ord);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const totalExpense = expenses.reduce((s, e) => s + (e.totalExpense || 0), 0);
  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '—';

  // Carbon & Profitability calculations
  const completedOrders = orders.filter(o => o.status === 'completed');
  
  // Fallbacks for demo/migration purposes
  const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.price || 12000), 0);
  const totalDistance = completedOrders.reduce((sum, o) => sum + (o.distance || 320), 0);
  
  const co2EmissionsKg = totalDistance * 0.8; // 0.8kg CO2 per km
  const netProfit = totalRevenue - totalExpense;
  const costPerKm = totalDistance > 0 ? (totalExpense / totalDistance).toFixed(2) : '0';

  if (loading) return <LoadingSpinner />;

  return (
    <div className="dash-page">
      <div className="dash-section-label">{t('admin.reports.reportsLabel')}</div>
      <h2 className="dash-title">{t('admin.reports.title')}</h2>
      {error && <ErrorMessage message={error} />}

      {/* Primary Stats row */}
      <div className="stats-row" style={{ marginBottom: '2rem' }}>
        <div className="stat-tile"><div className="stat-tile-val">₹{totalExpense}</div><div className="stat-tile-key">{t('admin.reports.totalExpenses')}</div></div>
        <div className="stat-tile"><div className="stat-tile-val">{expenses.length}</div><div className="stat-tile-key">{t('admin.reports.expenseRecords')}</div></div>
        <div className="stat-tile"><div className="stat-tile-val">{avgRating}★</div><div className="stat-tile-key">{t('admin.reports.avgRating')}</div></div>
        <div className="stat-tile"><div className="stat-tile-val">{reviews.length}</div><div className="stat-tile-key">{t('admin.reports.totalReviews')}</div></div>
      </div>

      {/* Green Logistics & Profitability Dashboard Section */}
      <div className="dash-section-label" style={{ marginBottom: '0.75rem' }}>🍃 Green Logistics & Profitability Dashboard</div>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem'
      }}>
        {/* Net Profit Card */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%)',
          border: '1px solid rgba(6, 182, 212, 0.3)',
          borderRadius: '10px',
          padding: '1.25rem',
        }}>
          <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Net Margins (Trip Profit)</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: netProfit >= 0 ? '#10b981' : '#ef4444', marginTop: '0.25rem' }}>
            ₹{netProfit}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>
            Total Revenue: ₹{totalRevenue}
          </div>
        </div>

        {/* CO2 Footprint Card */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(4, 120, 87, 0.15) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '10px',
          padding: '1.25rem',
        }}>
          <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Estimated CO2 Footprint</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981', marginTop: '0.25rem' }}>
            {co2EmissionsKg.toFixed(1)} kg
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>
            Emissions baseline: 0.8 kg/km
          </div>
        </div>

        {/* CPK (Cost Per Kilometer) Card */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          borderRadius: '10px',
          padding: '1.25rem',
        }}>
          <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cost-per-Kilometer (CPK)</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#a78bfa', marginTop: '0.25rem' }}>
            ₹{costPerKm}/km
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>
            Total Distance: {totalDistance.toFixed(0)} km
          </div>
        </div>
      </div>

      <div className="dash-section-label" style={{ marginBottom: '0.75rem' }}>{t('admin.reports.expenseBreakdownLabel')}</div>
      <div className="dark-table-wrap" style={{ marginBottom: '2rem' }}>
        <table className="dark-table">
          <thead><tr><th>{t('admin.reports.colDriver')}</th><th>{t('admin.reports.colFuel')}</th><th>{t('admin.reports.colToll')}</th><th>{t('admin.reports.colFood')}</th><th>{t('admin.reports.colMaintenance')}</th><th>{t('admin.reports.colTotal')}</th><th>{t('admin.reports.colDate')}</th></tr></thead>
          <tbody>
            {expenses.map((e) => (
              <tr key={e._id}>
                <td>{e.driver?.name || '—'}</td>
                <td>₹{e.fuelCost}</td><td>₹{e.tollCost}</td><td>₹{e.foodCost}</td><td>₹{e.maintenanceCost}</td>
                <td style={{ color: '#06b6d4' }}>₹{e.totalExpense}</td>
                <td>{formatDate(e.createdAt)}</td>
              </tr>
            ))}
            {expenses.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', color: '#64748b', padding: '1.5rem' }}>{t('admin.reports.noExpensesRecorded')}</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="dash-section-label" style={{ marginBottom: '0.75rem' }}>{t('admin.reports.customerReviewsLabel')}</div>
      <div className="dark-table-wrap">
        <table className="dark-table">
          <thead><tr><th>{t('admin.reports.colCustomer')}</th><th>{t('admin.reports.colRating')}</th><th>{t('admin.reports.colFeedback')}</th><th>{t('admin.reports.colDate')}</th></tr></thead>
          <tbody>
            {reviews.map((r) => (
              <tr key={r._id}>
                <td>{r.customer?.name || '—'}</td>
                <td style={{ color: '#f59e0b' }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</td>
                <td>{r.feedback || '—'}</td>
                <td>{formatDate(r.createdAt)}</td>
              </tr>
            ))}
            {reviews.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', color: '#64748b', padding: '1.5rem' }}>{t('admin.reports.noReviewsYet')}</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminReports;
