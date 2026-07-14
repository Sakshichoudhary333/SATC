import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createOrder } from '../services/api';
import ErrorMessage from '../components/ErrorMessage';
import { useLanguage } from '../context/LanguageContext';

const PlaceOrder = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
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

    if (pickup.length < 2) return setError(t('placeOrder.validationPickupShort'));
    if (pickup.length > 200) return setError(t('placeOrder.validationPickupLong'));
    if (dest.length < 2) return setError(t('placeOrder.validationDestShort'));
    if (dest.length > 200) return setError(t('placeOrder.validationDestLong'));
    if (goods.length < 3) return setError(t('placeOrder.validationGoodsShort'));

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
        <div className="dash-section-label">{t('placeOrder.orders')}</div>
        <h2 className="dash-title">{t('placeOrder.orderConfirmed')}</h2>
        <div className="dark-card" style={{ maxWidth: '480px' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✅</div>
          <p style={{ color: '#94a3b8', marginBottom: '0.5rem' }}>{t('placeOrder.orderIdLabel')} <span style={{ color: '#06b6d4' }}>{success._id}</span></p>
          <p style={{ color: '#94a3b8', marginBottom: '0.5rem' }}>{t('placeOrder.pickupLabel')} <span style={{ color: '#e2e8f0' }}>{success.pickupLocation}</span></p>
          <p style={{ color: '#94a3b8', marginBottom: '0.5rem' }}>{t('placeOrder.destinationLabel')} <span style={{ color: '#e2e8f0' }}>{success.destination}</span></p>
          <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
            {t('placeOrder.statusLabel')} <span style={{ color: success.status === 'assigned' ? '#10b981' : '#f59e0b' }}>{success.status}</span>
          </p>
          {success.status === 'assigned' && <p style={{ color: '#10b981', marginBottom: '1rem' }}>{t('placeOrder.truckAssignedAlert')}</p>}
          <button className="approve-btn" onClick={() => navigate('/dashboard')}>{t('placeOrder.viewMyOrders')}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="dash-page">
      <div className="dash-section-label">{t('placeOrder.orders')}</div>
      <h2 className="dash-title">{t('placeOrder.placeNewOrder')}</h2>
      {error && <ErrorMessage message={error} />}
      <div className="dark-card" style={{ maxWidth: '520px' }}>
        <form onSubmit={handleSubmit}>
          <div className="dark-form-group">
            <label>{t('placeOrder.pickupLocation')}</label>
            <input className="dark-input" name="pickupLocation" value={form.pickupLocation} onChange={handleChange} required placeholder={t('placeOrder.pickupPlaceholder')} />
          </div>
          <div className="dark-form-group">
            <label>{t('placeOrder.destination')}</label>
            <input className="dark-input" name="destination" value={form.destination} onChange={handleChange} required placeholder={t('placeOrder.destinationPlaceholder')} />
          </div>
          <div className="dark-form-group">
            <label>{t('placeOrder.goodsDetails')}</label>
            <textarea className="dark-input" name="goodsDetails" value={form.goodsDetails} onChange={handleChange} required placeholder={t('placeOrder.goodsPlaceholder')} rows={4} />
          </div>
          <button type="submit" className="approve-btn" disabled={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
            {loading ? t('placeOrder.placingOrder') : t('placeOrder.placeOrderBtn')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PlaceOrder;
