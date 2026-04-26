import { useEffect, useMemo, useState } from 'react';
import { createTrip, getAllOrders, getTrips, getTrucks, getUsers } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { formatDate } from '../utils/helpers';

const STATUS_COLOR = { started: '#3b82f6', 'in-transit': '#8b5cf6', completed: '#10b981' };
const EMPTY_FORM = { order: '', truck: '', driver: '' };

const AdminTrips = () => {
  const [trips, setTrips] = useState([]);
  const [orders, setOrders] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError('');

    try {
      const [tripRes, orderRes, truckRes, driverRes] = await Promise.all([
        getTrips(),
        getAllOrders(),
        getTrucks(),
        getUsers({ role: 'driver', limit: 100 }),
      ]);

      setTrips(Array.isArray(tripRes) ? tripRes : []);
      setOrders(Array.isArray(orderRes) ? orderRes : []);
      setTrucks(Array.isArray(truckRes) ? truckRes : []);
      const driverList = Array.isArray(driverRes) ? driverRes : driverRes?.users || [];
      setDrivers(driverList.filter((driver) => driver.driverStatus !== 'inactive'));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const pendingOrders = useMemo(() => {
    const tripOrderIds = new Set(trips.map((trip) => trip.order?._id || trip.order).filter(Boolean).map(String));
    return orders.filter((order) =>
      ['approved', 'assigned'].includes(order.status) && !tripOrderIds.has(String(order._id))
    );
  }, [orders, trips]);

  const selectedOrder = pendingOrders.find((order) => order._id === form.order) || null;
  const selectedTruck = trucks.find((truck) => truck._id === form.truck) || null;
  const selectedDriver = drivers.find((driver) => driver._id === form.driver) || null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === 'truck') {
      const truck = trucks.find((item) => item._id === value);
      if (truck && truck.driver) {
        const truckDriverId = typeof truck.driver === 'object' ? truck.driver._id : truck.driver;
        setForm((prev) => ({
          ...prev,
          truck: value,
          driver: truckDriverId || prev.driver,
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await createTrip(form);
      setForm(EMPTY_FORM);
      await fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="dash-page">
      <div className="dash-section-label">TRIPS</div>
      <h2 className="dash-title">Create and Manage Trips</h2>
      {error && <ErrorMessage message={error} />}

      <div className="assign-layout">
        <div className="dark-card" style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, marginBottom: '1rem', color: 'var(--cyan)' }}>
            + Create Trip
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="dark-form-group" style={{ marginBottom: 0 }}>
              <label>Select Approved Order</label>
              <select className="dark-input" name="order" value={form.order} onChange={handleChange} required>
                <option value="">-- Choose an order --</option>
                {pendingOrders.map((order) => (
                  <option key={order._id} value={order._id}>
                    {order._id.slice(-6)} • {order.customer?.name || order.customer?.email || 'Customer'} • {order.pickupLocation} → {order.destination}
                  </option>
                ))}
              </select>
            </div>

            <div className="dark-form-group" style={{ marginBottom: 0 }}>
              <label>Select Truck</label>
              <select className="dark-input" name="truck" value={form.truck} onChange={handleChange} required>
                <option value="">-- Choose a truck --</option>
                {trucks.filter((truck) => truck.status !== 'maintenance').map((truck) => (
                  <option key={truck._id} value={truck._id}>
                    {truck.truckNumber} {truck.driver?.name ? `• ${truck.driver.name}` : '• Unassigned'}
                  </option>
                ))}
              </select>
              {selectedTruck && (
                <div className="users-note" style={{ marginTop: '0.75rem' }}>
                  Truck selected: <strong>{selectedTruck.truckNumber}</strong>
                </div>
              )}
            </div>

            <div className="dark-form-group" style={{ marginBottom: 0 }}>
              <label>Select Driver</label>
              <select className="dark-input" name="driver" value={form.driver} onChange={handleChange} required>
                <option value="">-- Choose a driver --</option>
                {drivers.map((driver) => (
                  <option key={driver._id} value={driver._id}>
                    {driver.name} ({driver.mobile || driver.email})
                  </option>
                ))}
              </select>
              {selectedDriver && (
                <div className="users-note" style={{ marginTop: '0.75rem' }}>
                  Driver selected: <strong>{selectedDriver.name}</strong>
                </div>
              )}
            </div>

            {selectedOrder && (
              <div className="users-note">
                Route: <strong>{selectedOrder.pickupLocation}</strong> to <strong>{selectedOrder.destination}</strong>
              </div>
            )}

            <button className="approve-btn" type="submit" disabled={submitting || !form.order || !form.truck || !form.driver}>
              {submitting ? 'Creating...' : 'Create Trip'}
            </button>
          </form>
        </div>

        <div style={{ flex: 1.6 }}>
          <div className="dark-table-wrap">
            <table className="dark-table">
              <thead>
                <tr><th>TRIP ID</th><th>ROUTE</th><th>TRUCK</th><th>DRIVER</th><th>STATUS</th><th>DATE</th></tr>
              </thead>
              <tbody>
                {trips.map((t) => (
                  <tr key={t._id}>
                    <td><code style={{ color: '#06b6d4' }}>{t._id.slice(-6)}</code></td>
                    <td>{t.order?.pickupLocation || '—'} → {t.order?.destination || '—'}</td>
                    <td>{t.truck?.truckNumber || '—'}</td>
                    <td>{t.driver?.name || '—'}</td>
                    <td><span style={{ color: STATUS_COLOR[t.status] || '#94a3b8' }}>{t.status}</span></td>
                    <td>{formatDate(t.createdAt)}</td>
                  </tr>
                ))}
                {trips.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>No trips found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTrips;
