import { useEffect, useState } from 'react';
import { getAllExpenses, updateExpenseStatus } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { formatDate } from '../utils/helpers';

const STATUS_COLOR = {
  pending: '#f59e0b',
  approved: '#10b981',
  rejected: '#ef4444',
};

const AdminExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = () => {
    setLoading(true);
    getAllExpenses()
      .then((data) => setExpenses(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  const handleStatusUpdate = async (id, status) => {
    setActionLoading(id + '_' + status);
    try {
      const updated = await updateExpenseStatus(id, status);
      setExpenses((prev) => prev.map((e) => (e._id === id ? (updated.expense || updated) : e)));
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="dash-page">
      <div className="dash-section-label">EXPENSES</div>
      <h2 className="dash-title">Manage Expense Approvals</h2>
      {error && <ErrorMessage message={error} />}

      <div className="dark-table-wrap">
        <table className="dark-table">
          <thead>
            <tr>
              <th>DRIVER</th>
              <th>TRIP</th>
              <th>FUEL</th>
              <th>TOLL</th>
              <th>FOOD</th>
              <th>MAINTENANCE</th>
              <th>TOTAL</th>
              <th>STATUS</th>
              <th>DATE</th>
              <th>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((e) => {
              const isPending = e.approvalStatus === 'pending';
              return (
                <tr key={e._id}>
                  <td>{e.driver?.name || e.driver?.email || 'N/A'}</td>
                  <td>
                    <code style={{ color: '#06b6d4' }}>
                      {(e.trip?._id || e.trip || '').slice(-6)}
                    </code>
                  </td>
                  <td>₹{e.fuelCost}</td>
                  <td>₹{e.tollCost}</td>
                  <td>₹{e.foodCost}</td>
                  <td>₹{e.maintenanceCost}</td>
                  <td style={{ color: '#06b6d4' }}>₹{e.totalExpense}</td>
                  <td>
                    <span className="status-badge" style={{ background: `${STATUS_COLOR[e.approvalStatus] || '#94a3b8'}22`, color: STATUS_COLOR[e.approvalStatus] || '#94a3b8' }}>
                      {e.approvalStatus?.charAt(0).toUpperCase() + e.approvalStatus?.slice(1)}
                    </span>
                  </td>
                  <td>{e.createdAt ? formatDate(e.createdAt) : '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {isPending && (
                        <>
                          <button
                            className="approve-btn"
                            style={{ padding: '0.3rem 0.75rem' }}
                            type="button"
                            disabled={actionLoading === e._id + '_approved'}
                            onClick={() => handleStatusUpdate(e._id, 'approved')}
                          >
                            {actionLoading === e._id + '_approved' ? '...' : 'Approve'}
                          </button>
                          <button
                            className="reject-btn"
                            style={{ padding: '0.3rem 0.75rem' }}
                            type="button"
                            disabled={actionLoading === e._id + '_rejected'}
                            onClick={() => handleStatusUpdate(e._id, 'rejected')}
                          >
                            {actionLoading === e._id + '_rejected' ? '...' : 'Reject'}
                          </button>
                        </>
                      )}
                      {!isPending && (
                        <span style={{ color: 'var(--dim)' }}>—</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {expenses.length === 0 && (
              <tr>
                <td colSpan={10} style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>
                  No expenses found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminExpenses;
