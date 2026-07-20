import { useEffect, useState } from 'react';
import { getAllExpenses, updateExpenseStatus } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { formatDate } from '../utils/helpers';
import { useLanguage } from '../context/LanguageContext';

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
  const [activeReceiptUrl, setActiveReceiptUrl] = useState(null);
  const { t } = useLanguage();

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
      <div className="dash-section-label">{t('admin.expenses.expensesLabel')}</div>
      <h2 className="dash-title">{t('admin.expenses.manageApprovalsTitle')}</h2>
      {error && <ErrorMessage message={error} />}

      <div className="dark-table-wrap">
        <table className="dark-table">
          <thead>
            <tr>
              <th>{t('admin.expenses.colDriver')}</th>
              <th>{t('admin.expenses.colTrip')}</th>
              <th>{t('admin.expenses.colFuel')}</th>
              <th>{t('admin.expenses.colToll')}</th>
              <th>{t('admin.expenses.colFood')}</th>
              <th>{t('admin.expenses.colMaintenance')}</th>
              <th>{t('admin.expenses.colTotal')}</th>
              <th>{t('admin.expenses.colStatus')}</th>
              <th>{t('admin.expenses.colDate')}</th>
              <th>{t('admin.expenses.colReceipt')}</th>
              <th>{t('admin.expenses.colAction')}</th>
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
                    {e.receiptImage ? (
                      <button
                        type="button"
                        className="approve-btn"
                        style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem', background: 'var(--surface2)', border: '1px solid var(--border)' }}
                        onClick={() => setActiveReceiptUrl(e.receiptImage)}
                      >
                        {t('admin.expenses.viewReceipt') || 'View'}
                      </button>
                    ) : (
                      <span style={{ color: 'var(--dim)', fontSize: '0.8rem' }}>{t('admin.expenses.noReceipt') || '—'}</span>
                    )}
                  </td>
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
                            {actionLoading === e._id + '_approved' ? '...' : t('admin.expenses.approveBtn')}
                          </button>
                          <button
                            className="reject-btn"
                            style={{ padding: '0.3rem 0.75rem' }}
                            type="button"
                            disabled={actionLoading === e._id + '_rejected'}
                            onClick={() => handleStatusUpdate(e._id, 'rejected')}
                          >
                            {actionLoading === e._id + '_rejected' ? '...' : t('admin.expenses.rejectBtn')}
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
                <td colSpan={11} style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>
                  {t('admin.expenses.noExpensesFound')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Full-screen Receipt Modal Viewer */}
      {activeReceiptUrl && (
        <div className="receipt-modal-overlay" onClick={() => setActiveReceiptUrl(null)}>
          <div className="receipt-modal-content" onClick={(e) => e.stopPropagation()}>
            <img
              src={activeReceiptUrl}
              alt="Fuel Expense Receipt"
              className="receipt-modal-img"
            />
            <button
              type="button"
              className="receipt-modal-close-btn"
              onClick={() => setActiveReceiptUrl(null)}
            >
              {t('common.close') || 'Close'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminExpenses;
