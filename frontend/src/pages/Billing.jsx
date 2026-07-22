import { useEffect, useState } from 'react';
import { getBills, payBill, deleteBill } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { useLanguage } from '../context/LanguageContext';
import { getApiBaseUrl } from '../services/api';

const Billing = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { t } = useLanguage();

  useEffect(() => {
    getBills()
      .then((data) =>
        setBills(Array.isArray(data) ? data : Array.isArray(data?.bills) ? data.bills : [])
      )
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const inferBillType = (bill) => bill.billType || (bill.driverId ? 'driver_payout' : 'customer_advance');

  const handlePay = async (id) => {
    try {
      const updated = await payBill(id);
      setBills((prev) => prev.map((b) => (b._id === id ? updated : b)));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteBill(id);
      setBills((prev) => prev.filter((b) => b._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const getPartyName = (bill) => bill.partyName || bill.customerName || bill.driverName || '—';
  
  const getBillTypeLabel = (bill) => {
    const billType = inferBillType(bill);
    if (billType === 'driver_payout') return t('admin.billing.driverPayout');
    if (billType === 'customer_advance') return t('admin.billing.customerAdvance');
    return t('admin.billing.bill');
  };

  const getStatusLabel = (bill) => {
    const billType = inferBillType(bill);
    if (bill.paymentStatus === 'Paid') return billType === 'driver_payout' ? t('admin.billing.paidToDriver') : t('admin.billing.advanceReceived');
    return billType === 'driver_payout' ? t('admin.billing.dueToDriver') : t('admin.billing.advanceDue');
  };

  const getActionLabel = (bill) => (inferBillType(bill) === 'driver_payout' ? t('admin.billing.payDriver') : t('admin.billing.markReceived'));

  if (loading) return <LoadingSpinner />;

  return (
    <div className="dash-page">
      <div className="dash-section-label">{t('admin.billing.adminLabel')}</div>
      <h2 className="dash-title">{t('admin.billing.title')}</h2>

      {error && <ErrorMessage message={error} />}

      {bills.length === 0 ? (
        <p style={{ color: '#94a3b8' }}>{t('admin.billing.noBillsFound')}</p>
      ) : (
        <div className="dark-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                {[
                  t('admin.billing.colParty'),
                  t('admin.billing.colType'),
                  t('admin.billing.colAmount'),
                  t('admin.billing.colStatus'),
                  t('admin.billing.colDate'),
                  t('admin.billing.colActions')
                ].map((h, i) => (
                  <th key={i} style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#94a3b8', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bills.map((bill) => (
                <tr key={bill._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '0.75rem 1rem', color: '#e2e8f0' }}>{getPartyName(bill)}</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#94a3b8' }}>{getBillTypeLabel(bill)}</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#e2e8f0' }}>₹{bill.amount ?? '—'}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span style={{ color: bill.paymentStatus === 'Paid' ? '#10b981' : '#f59e0b', fontWeight: 600 }}>
                      {getStatusLabel(bill)}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                    {bill.createdAt ? new Date(bill.createdAt).toLocaleDateString() : '—'}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', display: 'flex', gap: '0.5rem' }}>
                    {bill.paymentStatus !== 'Paid' && (
                      <button className="approve-btn" style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }} onClick={() => handlePay(bill._id)}>
                        {getActionLabel(bill)}
                      </button>
                    )}
                    <button className="reject-btn" style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }} onClick={() => handleDelete(bill._id)}>
                      {t('admin.billing.deleteBtn')}
                    </button>
                    <a
                      href={`${getApiBaseUrl()}/billing/${bill._id}/invoice`}
                      download
                      className="approve-btn"
                      style={{
                        padding: '0.3rem 0.75rem',
                        fontSize: '0.8rem',
                        textDecoration: 'none',
                        display: 'inline-block',
                        background: '#0891b2',
                        color: '#0f1117',
                        fontWeight: 700,
                      }}
                    >
                      Invoice
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Billing;
