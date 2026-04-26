import { useEffect, useState } from 'react';
import { approveOrder, getAllOrders, rejectOrder, updateOrderApi } from '../services/api';
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

const EMPTY_FORM = {
  pickupLocation: '',
  destination: '',
  goodsDetails: '',
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

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
      setOrders((prev) => prev.map((o) => (o._id === id ? updated.order : o)));
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
      setOrders((prev) => prev.map((o) => (o._id === id ? updated.order : o)));
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleEdit = (order) => {
    setEditId(order._id);
    setForm({
      pickupLocation: order.pickupLocation || '',
      destination: order.destination || '',
      goodsDetails: order.goodsDetails || '',
    });
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editId) return;

    setSubmitting(true);
    setError('');
    try {
      const updated = await updateOrderApi(editId, form);
      setOrders((prev) => prev.map((o) => (o._id === editId ? updated.order : o)));
      handleCancelEdit();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="dash-page">
      <div className="dash-section-label">ORDERS</div>
      <h2 className="dash-title">{editId ? 'Edit Order' : 'Manage Orders'}</h2>
      {error && <ErrorMessage message={error} />}

      {editId && (
        <div className="dark-card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontWeight: 600, marginBottom: '1rem', color: 'var(--cyan)' }}>
            ✏️ Edit Order
          </div>
          <form onSubmit={handleSubmit}>
            <div className="admin-form-grid">
              <div className="dark-form-group">
                <label>Pickup Location</label>
                <input
                  className="dark-input"
                  name="pickupLocation"
                  value={form.pickupLocation}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="dark-form-group">
                <label>Drop Location</label>
                <input
                  className="dark-input"
                  name="destination"
                  value={form.destination}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="dark-form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Goods Details</label>
                <textarea
                  className="dark-input"
                  name="goodsDetails"
                  value={form.goodsDetails}
                  onChange={handleChange}
                  rows={3}
                  required
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button className="approve-btn" type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : 'Update Order'}
              </button>
              <button className="reject-btn" type="button" onClick={handleCancelEdit}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="dark-table-wrap">
        <table className="dark-table">
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
                  <td>{o.goodsDetails}</td>
                  <td>
                    <span style={{ color: STATUS_COLOR[o.status] || '#94a3b8' }}>
                      {o.status.charAt(0).toUpperCase() + o.status.slice(1)}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button
                        className="approve-btn"
                        style={{ padding: '0.3rem 0.75rem' }}
                        type="button"
                        onClick={() => handleEdit(o)}
                      >
                        Edit
                      </button>
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
