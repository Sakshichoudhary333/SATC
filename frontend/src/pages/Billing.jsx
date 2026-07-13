import { useEffect, useState } from 'react';
import { getBills, payBill, deleteBill } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const Billing = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getBills()
      .then((data) =>
        setBills(Array.isArray(data) ? data : Array.isArray(data?.bills) ? data.bills : [])
      )
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const refreshBills = async () => {
    const data = await getBills();
    setBills(Array.isArray(data) ? data : Array.isArray(data?.bills) ? data.bills : []);
  };

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
    if (billType === 'driver_payout') return 'Driver Payout';
    if (billType === 'customer_advance') return 'Customer Advance';
    return 'Bill';
  };
  const getStatusLabel = (bill) => {
    const billType = inferBillType(bill);
    if (bill.paymentStatus === 'Paid') return billType === 'driver_payout' ? 'Paid to Driver' : 'Advance Received';
    return billType === 'driver_payout' ? 'Due to Driver' : 'Advance Due';
  };
  const getActionLabel = (bill) => (inferBillType(bill) === 'driver_payout' ? 'Pay Driver' : 'Mark Received');

  if (loading) return <LoadingSpinner />;

  return (
    <div className="dash-page">
      <div className="dash-section-label">ADMIN</div>
      <h2 className="dash-title">Billing</h2>

      {error && <ErrorMessage message={error} />}

      {bills.length === 0 ? (
        <p style={{ color: '#94a3b8' }}>No bills found.</p>
      ) : (
        <div className="dark-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                {['Party', 'Type', 'Amount', 'Status', 'Date', 'Actions'].map((h) => (
                  <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#94a3b8', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>{h}</th>
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
                      Delete
                    </button>
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
