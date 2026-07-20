import { useEffect, useMemo, useState, useRef } from 'react';
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
import { useLanguage } from '../context/LanguageContext';

const SOCKET_URL = 'https://satc-backend.onrender.com';

const STATUS_COLOR = {
  started: '#06b6d4',
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
  const { t } = useLanguage();
  const socketRef = useRef(null);

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
    socketRef.current = socket;

    const handleLocation = ({ truckId, lat, lng, lastUpdated }) => {
      if (!truckId) return;
      setLiveLocations((prev) => ({
        ...prev,
        [truckId]: { lat, lng, updatedAt: lastUpdated || new Date().toISOString() },
      }));
    };

    const handleTripStatus = ({ tripId, status }) => {
      setTrips((prev) =>
        prev.map((tripItem) => (tripItem._id === tripId ? { ...tripItem, status } : tripItem))
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
      socketRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!socketRef.current || trips.length === 0) return;

    trips.forEach((trip) => {
      const truckId = trip.truck?._id || trip.truck;
      if (truckId) {
        socketRef.current.emit('joinTruck', { truckId });
      }
      if (trip._id) {
        socketRef.current.emit('joinTrip', { tripId: trip._id });
      }
    });
  }, [trips]);

  // ── Derived ────────────────────────────────────────
  const pendingOrders = useMemo(() => {
    const tripOrderIds = new Set(
      trips.map((tripItem) => tripItem.order?._id || tripItem.order).filter(Boolean).map(String)
    );
    return orders.filter(
      (o) => ['approved', 'assigned'].includes(o.status) && !tripOrderIds.has(String(o._id))
    );
  }, [orders, trips]);

  const selectedOrder = pendingOrders.find((o) => o._id === form.order) || null;
  const selectedTruck = trucks.find((truckItem) => truckItem._id === form.truck) || null;
  const selectedDriver = drivers.find((d) => d._id === form.driver) || null;

  // ── Create trip ────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === 'truck') {
      const truckItem = trucks.find((truckItem) => truckItem._id === value);
      if (truckItem?.driver) {
        const tid = typeof truckItem.driver === 'object' ? truckItem.driver._id : truckItem.driver;
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
      setSuccess(t('admin.trips.successCreated'));
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
      setSuccess(t('admin.trips.successCompleted'));
      await fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  // ── Cancel trip ────────────────────────────────────
  const handleCancel = async (id) => {
    if (!confirm(t('admin.trips.confirmCancelTrip'))) return;
    setError('');
    setSuccess('');
    try {
      await cancelTrip(id);
      setTrips((prev) => prev.filter((tripItem) => tripItem._id !== id));
      setSuccess(t('admin.trips.successCancelled'));
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
      const truckItem = trucks.find((truckItem) => truckItem._id === value);
      if (truckItem?.driver) {
        const tid = typeof truckItem.driver === 'object' ? truckItem.driver._id : truckItem.driver;
        setEditForm((prev) => ({ ...prev, truck: value, driver: tid || prev.driver }));
      }
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditSubmitting(true);
    setError('');
    try {
      await updateTripDetails(editingTrip._id, editForm);
      closeEdit();
      await fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setEditSubmitting(false);
    }
  };

  if (loading && trips.length === 0) return <LoadingSpinner />;

  return (
    <div className="dash-page">
      <div className="dash-section-label">{t('admin.trips.tripsLabel')}</div>
      <h2 className="dash-title">{t('admin.trips.manageTripsTitle')}</h2>

      {error && <ErrorMessage message={error} />}
      {success && <div className="dark-success">{success}</div>}

      <div className="trips-layout" style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        {/* ── Create trip card ── */}
        <div className="dark-card" style={{ flex: 1, minWidth: '320px' }}>
          <div style={{ fontWeight: 600, color: 'var(--cyan)', marginBottom: '1.25rem' }}>
            {t('admin.trips.createTripTitle')}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="dark-form-group">
              <label>{t('admin.trips.selectOrderField')}</label>
              <select className="dark-input" name="order" value={form.order} onChange={handleChange} required>
                <option value="">
                  {pendingOrders.length === 0 ? t('admin.trips.noPendingOrders') : t('admin.trips.chooseOrder')}
                </option>
                {pendingOrders.map((o) => (
                  <option key={o._id} value={o._id}>
                    {o.customer?.name || o.customer?.email || 'N/A'} — {o.pickupLocation} → {o.destination}
                  </option>
                ))}
              </select>
            </div>

            <div className="dark-form-group">
              <label>{t('admin.trips.selectTruckField')}</label>
              <select className="dark-input" name="truck" value={form.truck} onChange={handleChange} required>
                <option value="">{t('admin.trips.chooseTruck')}</option>
                {trucks.map((truckItem) => (
                  <option key={truckItem._id} value={truckItem._id}>{truckItem.truckNumber}</option>
                ))}
              </select>
              {selectedTruck && <div className="users-note">{t('admin.assignTruck.colTruck')}: <strong>{selectedTruck.truckNumber}</strong></div>}
            </div>

            <div className="dark-form-group">
              <label>{t('admin.trips.selectDriverField')}</label>
              <select className="dark-input" name="driver" value={form.driver} onChange={handleChange} required>
                <option value="">{t('admin.trips.chooseDriver')}</option>
                {drivers.map((d) => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </select>
              {selectedDriver && <div className="users-note">{t('admin.assignTruck.colDriver')}: <strong>{selectedDriver.name}</strong></div>}
            </div>

            {selectedOrder && (
              <div className="users-note">
                {t('admin.trips.routeNote')} {selectedOrder.pickupLocation} → {selectedOrder.destination}
              </div>
            )}

            <button className="approve-btn" type="submit" disabled={submitting}>
              {submitting ? t('admin.trips.creating') : t('admin.trips.createTripBtn')}
            </button>
          </form>
        </div>

        {/* ── Trips table ── */}
        <div style={{ flex: 1.6 }}>
          <div className="dark-table-wrap">
            <table className="dark-table">
              <thead>
                <tr>
                  <th>{t('admin.trips.colTripId')}</th>
                  <th>{t('admin.trips.colRoute')}</th>
                  <th>{t('admin.trips.colTruck')}</th>
                  <th>{t('admin.trips.colDriver')}</th>
                  <th>{t('admin.trips.colLiveGps')}</th>
                  <th>{t('admin.trips.colStatus')}</th>
                  <th>{t('admin.trips.colDate')}</th>
                  <th>{t('admin.trips.colActions')}</th>
                </tr>
              </thead>
              <tbody>
                {trips.map((tItem) => {
                  const truckId = tItem.truck?._id || tItem.truck;
                  const live = liveLocations[truckId] || (tItem.truck?.location ? { lat: tItem.truck.location.lat, lng: tItem.truck.location.lng, updatedAt: tItem.truck.lastUpdated } : null);
                  return (
                    <tr key={tItem._id}>
                      <td><code style={{ color: '#06b6d4' }}>{tItem._id.slice(-6)}</code></td>
                      <td>{tItem.order?.pickupLocation} → {tItem.order?.destination}</td>
                      <td>{tItem.truck?.truckNumber || '—'}</td>
                      <td>{tItem.driver?.name || '—'}</td>
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
                          : <span style={{ color: '#475569' }}>{t('admin.trips.noGps')}</span>
                        }
                      </td>
                      <td>
                        <span className="status-badge" style={{ background: `${STATUS_COLOR[tItem.status] || '#94a3b8'}22`, color: STATUS_COLOR[tItem.status] || '#94a3b8' }}>
                          {tItem.status}
                        </span>
                      </td>
                      <td>{formatDate(tItem.createdAt)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                          {/* Edit — only before trip moves */}
                          {tItem.status === 'started' && (
                            <button
                              className="approve-btn"
                              style={{ padding: '0.25rem 0.6rem', fontSize: '0.78rem' }}
                              onClick={() => openEdit(tItem)}
                            >
                              {t('admin.trips.editBtn')}
                            </button>
                          )}
                          {/* Complete — in-transit only */}
                          {tItem.status === 'in-transit' && (
                            <button
                              className="approve-btn"
                              style={{ padding: '0.25rem 0.6rem', fontSize: '0.78rem', background: '#10b981' }}
                              onClick={() => handleComplete(tItem._id)}
                            >
                              {t('admin.trips.completeBtn')}
                            </button>
                          )}
                          {/* Cancel — active trips only */}
                          {tItem.status !== 'completed' && (
                            <button
                              className="reject-btn"
                              style={{ padding: '0.25rem 0.6rem', fontSize: '0.78rem' }}
                              onClick={() => handleCancel(tItem._id)}
                            >
                              {t('admin.trips.cancelBtn')}
                            </button>
                          )}
                          {tItem.status === 'completed' && (
                            <span style={{ color: '#64748b', fontSize: '0.8rem' }}>{t('admin.trips.lockedTag')}</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {trips.length === 0 && (
                  <tr><td colSpan={8} style={{ textAlign: 'center', color: '#64748b' }}>{t('admin.trips.noTripsFound')}</td></tr>
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
            <h3 style={{ marginBottom: '0.25rem' }}>{t('admin.trips.editTripHeader')}{editingTrip._id.slice(-6)}</h3>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              {t('admin.trips.editTripDesc')}
            </p>

            {error && <ErrorMessage message={error} />}

            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="dark-form-group">
                <label>{t('admin.assignTruck.colTruck')}</label>
                <select className="dark-input" name="truck" value={editForm.truck} onChange={handleEditChange} required>
                  <option value="">{t('admin.trips.chooseTruck')}</option>
                  {trucks.map((truckItem) => (
                    <option key={truckItem._id} value={truckItem._id}>{truckItem.truckNumber}</option>
                  ))}
                </select>
              </div>

              <div className="dark-form-group">
                <label>{t('admin.assignTruck.colDriver')}</label>
                <select className="dark-input" name="driver" value={editForm.driver} onChange={handleEditChange} required>
                  <option value="">{t('admin.trips.chooseDriver')}</option>
                  {drivers.map((d) => (
                    <option key={d._id} value={d._id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="submit" className="approve-btn" disabled={editSubmitting} style={{ flex: 1 }}>
                  {editSubmitting ? t('admin.users.saving') : t('admin.trips.saveChangesBtn')}
                </button>
                <button type="button" className="reject-btn" onClick={closeEdit} style={{ flex: 1 }}>
                  {t('admin.users.cancelBtn')}
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
