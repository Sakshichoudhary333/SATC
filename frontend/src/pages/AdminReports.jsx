import { useEffect, useState } from 'react';
import { getAllExpenses, getAllReviews } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { formatDate } from '../utils/helpers';

const AdminReports = () => {
  const [expenses, setExpenses] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getAllExpenses(), getAllReviews()])
      .then(([exp, rev]) => { setExpenses(exp); setReviews(rev); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const totalExpense = expenses.reduce((s, e) => s + (e.totalExpense || 0), 0);
  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '—';

  if (loading) return <LoadingSpinner />;

  return (
    <div className="dash-page">
      <div className="dash-section-label">REPORTS</div>
      <h2 className="dash-title">Reports & Analytics</h2>
      {error && <ErrorMessage message={error} />}

      <div className="stats-row" style={{ marginBottom: '2rem' }}>
        <div className="stat-tile"><div className="stat-tile-val">₹{totalExpense}</div><div className="stat-tile-key">Total Expenses</div></div>
        <div className="stat-tile"><div className="stat-tile-val">{expenses.length}</div><div className="stat-tile-key">Expense Records</div></div>
        <div className="stat-tile"><div className="stat-tile-val">{avgRating}★</div><div className="stat-tile-key">Avg Rating</div></div>
        <div className="stat-tile"><div className="stat-tile-val">{reviews.length}</div><div className="stat-tile-key">Total Reviews</div></div>
      </div>

      <div className="dash-section-label" style={{ marginBottom: '0.75rem' }}>EXPENSE BREAKDOWN</div>
      <div className="dark-table-wrap" style={{ marginBottom: '2rem' }}>
        <table className="dark-table">
          <thead><tr><th>DRIVER</th><th>FUEL</th><th>TOLL</th><th>FOOD</th><th>MAINTENANCE</th><th>TOTAL</th><th>DATE</th></tr></thead>
          <tbody>
            {expenses.map((e) => (
              <tr key={e._id}>
                <td>{e.driver?.name || '—'}</td>
                <td>₹{e.fuelCost}</td><td>₹{e.tollCost}</td><td>₹{e.foodCost}</td><td>₹{e.maintenanceCost}</td>
                <td style={{ color: '#06b6d4' }}>₹{e.totalExpense}</td>
                <td>{formatDate(e.createdAt)}</td>
              </tr>
            ))}
            {expenses.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', color: '#64748b', padding: '1.5rem' }}>No expenses recorded</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="dash-section-label" style={{ marginBottom: '0.75rem' }}>CUSTOMER REVIEWS</div>
      <div className="dark-table-wrap">
        <table className="dark-table">
          <thead><tr><th>CUSTOMER</th><th>RATING</th><th>FEEDBACK</th><th>DATE</th></tr></thead>
          <tbody>
            {reviews.map((r) => (
              <tr key={r._id}>
                <td>{r.customer?.name || '—'}</td>
                <td style={{ color: '#f59e0b' }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</td>
                <td>{r.feedback || '—'}</td>
                <td>{formatDate(r.createdAt)}</td>
              </tr>
            ))}
            {reviews.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', color: '#64748b', padding: '1.5rem' }}>No reviews yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminReports;
