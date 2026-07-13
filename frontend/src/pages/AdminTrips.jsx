import { useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import {
  cancelTrip,
  createTrip,
  getAllOrders,
  getTrips,
  getTrucks,
  getUsers,
  updateTripDetails,
  updateTripStatus,
} from '../services/api';

import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { formatDate } from '../utils/helpers';

const SOCKET_URL = 'https://satc-backend.onrender.com';

const STATUS_COLOR = {
  started: '#3b82f6',
  'in-transit': '#8b5cf6',
  completed: '#10b981',
};

const EMPTY_FORM = { order: '', truck: '', driver: '' };

const AdminTrips = () => {
  const [trips, setTrips] = useState([]);
  const [orders, setOrders] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Create form
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  // Edit modal
  const [editingTrip, setEditingTrip] = useState(null);
  const [editForm, setEditForm] = useState({ truck: '', driver: '' });
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Live locations from socket
  const [liveLocations, setLiveLocations] = useState({}); // truckId → { lat, lng, updatedAt }

  // ── Data fetching ──────────────────────────────────
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
      setDrivers(driverList.filter((d) => d.driverStatus !== 'inactive'));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ── Socket: live truck locations ───────────────────
  useEffect(() => {
    const socket = io(SOCKET_URL);

    const handleLocation = ({ truckId, lat, lng, lastUpdated }) => {
      if (!truckId) return;
      setLiveLocations((prev) => ({
        ...prev,
        [truckId]: { lat, lng, updatedAt: lastUpdated || new Date().toISOString() },
      }));
    };

    const handleTripStatus = ({ tripId, status }) => {
      setTrips((prev) =>
        prev.map((t) => (t._id === tripId ? { ...t, status } : t))
      );
    };

    socket.on('locationUpdated', handleLocation);
    socket.on('truckLocationUpdated', handleLocation);
    socket.on('tripStatusUpdated', handleTripStatus);

    return () => {
      socket.off('locationUpdated', handleLocation);
      socket.off('truckLocationUpdated', handleLocation);
      socket.off('tripStatusUpdated', handleTripStatus);
      socket.disconnect();
    };
  }, []);

  // ── Derived ────────────────────────────────────────
  const pendingOrders = useMemo(() => {
    const tripOrderIds = new Set(
      trips.map((t) => t.order?._id || t.order).filter(Boolean).map(String)
    );
    return orders.filter(
      (o) => ['approved', 'assigned'].includes(o.status) && !tripOrderIds.has(String(o._id))
    );
  }, [orders, trips]);

  const selectedOrder = pendingOrders.find((o) => o._id === form.order) || null;
  const selectedTruck = trucks.find((t) => t._id === form.truck) || null;
  const selectedDriver = drivers.find((d) => d._id === form.driver) || null;

  // ── Create trip ────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === 'truck') {
      const truck = trucks.find((t) => t._id === value);
      if (truck?.driver) {
        const tid = typeof truck.driver === 'object' ? truck.driver._id : truck.driver;
        setForm((prev) => ({ ...prev, truck: value, driver: tid || prev.driver }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await createTrip(form);
      setForm(EMPTY_FORM);
      setSuccess('Trip created successfully.');
      await fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Complete trip ──────────────────────────────────
  const handleComplete = async (id) => {
    setError('');
    setSuccess('');
    try {
      await updateTripStatus(id, 'completed');
      setSuccess('Trip marked as completed.');
      await fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  // ── Cancel trip ────────────────────────────────────
  const handleCancel = async (id) => {
    if (!confirm('Cancel this trip? The order will be reset to approved and the truck freed.')) return;
    setError('');
    setSuccess('');
    try {
      await cancelTrip(id);
      setTrips((prev) => prev.filter((t) => t._id !== id));
      setSuccess('Trip cancelled and order reset to approved.');
    } catch (err) {
      setError(err.message);
    }
  };

  // ── Edit trip ──────────────────────────────────────
  const openEdit = (trip) => {
    setEditingTrip(trip);
    setEditForm({
      truck: trip.truck?._id || trip.truck || '',
      driver: trip.driver?._id || trip.driver || '',
    });
    setError('');
  };

  const closeEdit = () => {
    setEditingTrip(null);
    setEditForm({ truck: '', driver: '' });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));

    if (name === 'truck') {
      const truck = trucks.find((t) => t._id === value);
      if (truck?.driver) {
        const tid = typeof truck.driver === 'object' ? truck.driver._id : truck.driver;
        setEditForm((prev) => ({ ...prev, truck: value, driver: tid || prev.driver }));
      }
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingTrip) return;
    setEditSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const res = await updateTripDetails(editingTrip._id, editForm);
      setTrips((prev) => prev.map((t) => (t._id === editingTrip._id ? (res.trip || res) : t)));
      setSuccess('Trip updated successfully.');
      closeEdit();
    } catch (err) {
      setError(err.message);
    } finally {
      setEditSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="dash-page">
      <div className="dash-section-label">TRIPS</div>
      <h2 className="dash-title">Create and Manage Trips</h2>

      {error && <ErrorMessage message={error} />}
      {success && <div className="dark-success">{success}</div>}

      {/* ── Create trip panel ── */}
      <div className="assign-layout">
        <div className="dark-card" style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, marginBottom: '1rem', color: 'var(--cyan)' }}>
            + Create Trip
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="dark-form-group">
              <label>Select Approved Order</label>
              <select className="dark-input" name="order" value={form.order} onChange={handleChange} required>
                <option value="">-- Choose an order --</option>
                {pendingOrders.map((o) => (
                  <option key={o._id} value={o._id}>
                    {o._id.slice(-6)} • {o.customer?.name || o.customer?.email || 'Customer'}
                  </option>
                ))}
              </select>
            </div>

            <div className="dark-form-group">
              <label>Select Truck</label>
              <select className="dark-input" name="truck" value={form.truck} onChange={handleChange} required>
                <option value="">-- Choose a truck --</option>
                {trucks.map((t) => (
                  <option key={t._id} value={t._id}>{t.truckNumber}</option>
                ))}
              </select>
              {selectedTruck && <div className="users-note">Truck: <strong>{selectedTruck.truckNumber}</strong></div>}
            </div>

            <div className="dark-form-group">
              <label>Select Driver</label>
              <select className="dark-input" name="driver" value={form.driver} onChange={handleChange} required>
                <option value="">-- Choose a driver --</option>
                {drivers.map((d) => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </select>
              {selectedDriver && <div className="users-note">Driver: <strong>{selectedDriver.name}</strong></div>}
            </div>

            {selectedOrder && (
              <div className="users-note">
                Route: {selectedOrder.pickupLocation} → {selectedOrder.destination}
              </div>
            )}

            <button className="approve-btn" type="submit" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Trip'}
            </button>
          </form>
        </div>

        {/* ── Trips table ── */}
        <div style={{ flex: 1.6 }}>
          <div className="dark-table-wrap">
            <table className="dark-table">
              <thead>
                <tr>
                  <th>TRIP ID</th>
                  <th>ROUTE</th>
                  <th>TRUCK</th>
                  <th>DRIVER</th>
                  <th>LIVE GPS</th>
                  <th>STATUS</th>
                  <th>DATE</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {trips.map((t) => {
                  const truckId = t.truck?._id || t.truck;
                  const live = liveLocations[truckId] || (t.truck?.location ? { lat: t.truck.location.lat, lng: t.truck.location.lng, updatedAt: t.truck.lastUpdated } : null);
                  return (
                    <tr key={t._id}>
                      <td><code style={{ color: '#06b6d4' }}>{t._id.slice(-6)}</code></td>
                      <td>{t.order?.pickupLocation} → {t.order?.destination}</td>
                      <td>{t.truck?.truckNumber || '—'}</td>
                      <td>{t.driver?.name || '—'}</td>
                      <td style={{ fontSize: '0.75rem' }}>
                        {live
                          ? <>
                              <span style={{ color: '#10b981' }}>
                                {Number(live.lat).toFixed(4)}, {Number(live.lng).toFixed(4)}
                              </span>
                              {live.updatedAt && (
                                <div style={{ color: '#64748b', fontSize: '0.7rem' }}>
                                  {new Date(live.updatedAt).toLocaleTimeString()}
                                </div>
                              )}
                            </>
                          : <span style={{ color: '#475569' }}>No GPS</span>
                        }
                      </td>
                      <td>
                        <span className="status-badge" style={{ background: `${STATUS_COLOR[t.status] || '#94a3b8'}22`, color: STATUS_COLOR[t.status] || '#94a3b8' }}>
                          {t.status}
                        </span>
                      </td>
                      <td>{formatDate(t.createdAt)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                          {/* Edit — only before trip moves */}
                          {t.status === 'started' && (
                            <button
                              className="approve-btn"
                              style={{ padding: '0.25rem 0.6rem', fontSize: '0.78rem' }}
                              onClick={() => openEdit(t)}
                            >
                              Edit
                            </button>
                          )}
                          {/* Complete — in-transit only */}
                          {t.status === 'in-transit' && (
                            <button
                              className="approve-btn"
                              style={{ padding: '0.25rem 0.6rem', fontSize: '0.78rem', background: '#10b981' }}
                              onClick={() => handleComplete(t._id)}
                            >
                              Complete
                            </button>
                          )}
                          {/* Cancel — active trips only */}
                          {t.status !== 'completed' && (
                            <button
                              className="reject-btn"
                              style={{ padding: '0.25rem 0.6rem', fontSize: '0.78rem' }}
                              onClick={() => handleCancel(t._id)}
                            >
                              Cancel
                            </button>
                          )}
                          {t.status === 'completed' && (
                            <span style={{ color: '#64748b', fontSize: '0.8rem' }}>🔒 Locked</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {trips.length === 0 && (
                  <tr><td colSpan={8} style={{ textAlign: 'center', color: '#64748b' }}>No trips found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Edit Trip Modal ── */}
      {editingTrip && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }}>
          <div className="dark-card" style={{ maxWidth: '480px', width: '90%', padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '0.25rem' }}>Edit Trip #{editingTrip._id.slice(-6)}</h3>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Only allowed before the trip starts moving.
            </p>

            {error && <ErrorMessage message={error} />}

            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="dark-form-group">
                <label>Truck</label>
                <select className="dark-input" name="truck" value={editForm.truck} onChange={handleEditChange} required>
                  <option value="">-- Select truck --</option>
                  {trucks.map((t) => (
                    <option key={t._id} value={t._id}>{t.truckNumber}</option>
                  ))}
                </select>
              </div>

              <div className="dark-form-group">
                <label>Driver</label>
                <select className="dark-input" name="driver" value={editForm.driver} onChange={handleEditChange} required>
                  <option value="">-- Select driver --</option>
                  {drivers.map((d) => (
                    <option key={d._id} value={d._id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="submit" className="approve-btn" disabled={editSubmitting} style={{ flex: 1 }}>
                  {editSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" className="reject-btn" onClick={closeEdit} style={{ flex: 1 }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTrips;
