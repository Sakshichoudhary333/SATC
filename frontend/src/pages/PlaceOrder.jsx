import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createOrder } from '../services/api';
import ErrorMessage from '../components/ErrorMessage';

const PlaceOrder = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ pickupLocation: '', destination: '', goodsDetails: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const pickup = form.pickupLocation.trim();
    const dest = form.destination.trim();
    const goods = form.goodsDetails.trim();

    if (pickup.length < 2) return setError('Pickup location must be at least 2 characters.');
    if (pickup.length > 200) return setError('Pickup location is too long (max 200 characters).');
    if (dest.length < 2) return setError('Destination must be at least 2 characters.');
    if (dest.length > 200) return setError('Destination is too long (max 200 characters).');
    if (goods.length < 3) return setError('Goods details must be at least 3 characters.');
    // if (goods.length > 50) return setError('Goods details are too long (max 50 characters).');

    setLoading(true);
    try {
      const order = await createOrder({ pickupLocation: pickup, destination: dest, goodsDetails: goods });
      setSuccess(order);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="dash-page">
        <div className="dash-section-label">ORDERS</div>
        <h2 className="dash-title">Order Confirmed</h2>
        <div className="dark-card" style={{ maxWidth: '480px' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✅</div>
          <p style={{ color: '#94a3b8', marginBottom: '0.5rem' }}>Order ID: <span style={{ color: '#06b6d4' }}>{success._id}</span></p>
          <p style={{ color: '#94a3b8', marginBottom: '0.5rem' }}>Pickup: <span style={{ color: '#e2e8f0' }}>{success.pickupLocation}</span></p>
          <p style={{ color: '#94a3b8', marginBottom: '0.5rem' }}>Destination: <span style={{ color: '#e2e8f0' }}>{success.destination}</span></p>
          <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
            Status: <span style={{ color: success.status === 'assigned' ? '#10b981' : '#f59e0b' }}>{success.status}</span>
          </p>
          {success.status === 'assigned' && <p style={{ color: '#10b981', marginBottom: '1rem' }}>🚚 A truck has been assigned!</p>}
          <button className="approve-btn" onClick={() => navigate('/dashboard')}>View My Orders</button>
        </div>
      </div>
    );
  }

  return (
    <div className="dash-page">
      <div className="dash-section-label">ORDERS</div>
      <h2 className="dash-title">Place New Order</h2>
      {error && <ErrorMessage message={error} />}
      <div className="dark-card" style={{ maxWidth: '520px' }}>
        <form onSubmit={handleSubmit}>
          <div className="dark-form-group">
            <label>Pickup Location</label>
            <input className="dark-input" name="pickupLocation" value={form.pickupLocation} onChange={handleChange} required placeholder="e.g. Mumbai Warehouse" />
          </div>
          <div className="dark-form-group">
            <label>Destination</label>
            <input className="dark-input" name="destination" value={form.destination} onChange={handleChange} required placeholder="e.g. Delhi Hub" />
          </div>
          <div className="dark-form-group">
            <label>Goods Details</label>
            <textarea className="dark-input" name="goodsDetails" value={form.goodsDetails} onChange={handleChange} required placeholder="Describe the goods..." rows={4} />
          </div>
          <button type="submit" className="approve-btn" disabled={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
            {loading ? 'Placing Order...' : 'Place Order'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PlaceOrder;
