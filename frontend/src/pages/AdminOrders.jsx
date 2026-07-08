import { useEffect, useState } from 'react';
import { approveOrder, getAllOrders, rejectOrder } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const STATUS_COLOR = {
  pending: '#f59e0b',
  approved: '#10b981',
  rejected: '#ef4444',
  assigned: '#3b82f6',
  'in-transit': '#8b5cf6',
  completed: '#10b981',
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = () => {
    setLoading(true);
    getAllOrders()
      .then(setOrders)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  const handleApprove = async (id) => {
    setActionLoading(id + '_approve');
    try {
      const updated = await approveOrder(id);
      setOrders((prev) => prev.map((o) => (o._id === id ? (updated.order || updated) : o)));
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    setActionLoading(id + '_reject');
    try {
      const updated = await rejectOrder(id);
      setOrders((prev) => prev.map((o) => (o._id === id ? (updated.order || updated) : o)));
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="dash-page">
      <div className="dash-section-label">ORDERS</div>
      <h2 className="dash-title">Manage Orders</h2>
      {error && <ErrorMessage message={error} />}

      <div className="dark-table-wrap admin-orders-wrap">
        <table className="dark-table admin-orders-table">
          <thead>
            <tr>
              <th>CUSTOMER</th>
              <th>PICKUP</th>
              <th>DROP</th>
              <th>GOODS</th>
              <th>STATUS</th>
              <th>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => {
              const isPending = o.status === 'pending';
              return (
                <tr key={o._id}>
                  <td>{o.customer?.name || o.customer?.email || 'N/A'}</td>
                  <td>{o.pickupLocation}</td>
                  <td>{o.destination}</td>
                  <td className="admin-orders-goods">{o.goodsDetails}</td>
                  <td>
                    <span className="status-badge" style={{ background: `${STATUS_COLOR[o.status] || '#94a3b8'}22`, color: STATUS_COLOR[o.status] || '#94a3b8' }}>
                      {o.status.charAt(0).toUpperCase() + o.status.slice(1)}
                    </span>
                  </td>
                  <td className="admin-orders-actions">
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {isPending && (
                        <>
                          <button
                            className="approve-btn"
                            style={{ padding: '0.3rem 0.75rem' }}
                            type="button"
                            disabled={actionLoading === o._id + '_approve'}
                            onClick={() => handleApprove(o._id)}
                          >
                            {actionLoading === o._id + '_approve' ? '...' : 'Approve'}
                          </button>
                          <button
                            className="reject-btn"
                            style={{ padding: '0.3rem 0.75rem' }}
                            type="button"
                            disabled={actionLoading === o._id + '_reject'}
                            onClick={() => handleReject(o._id)}
                          >
                            {actionLoading === o._id + '_reject' ? '...' : 'Reject'}
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
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrders;
