import { useEffect, useState } from 'react';
import { getUsers, getTrucks, assignTruck } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const AdminAssignTruck = () => {
  const [drivers, setDrivers] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({ driverId: '', truckId: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [usersRes, trucksRes] = await Promise.all([getUsers(), getTrucks()]);
      const arr = Array.isArray(usersRes) ? usersRes : usersRes?.users || [];
      setDrivers(arr.filter((u) => u.role === 'driver'));
      setTrucks(Array.isArray(trucksRes) ? trucksRes : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedDriver = drivers.find((d) => d._id === form.driverId);
  const selectedTruck = trucks.find((t) => t._id === form.truckId);
  const assignedDriverIds = new Set(
    trucks
      .filter((t) => Boolean(t.driver))
      .map((t) => (typeof t.driver === 'object' ? t.driver?._id : t.driver))
      .filter(Boolean)
      .map(String)
  );
  const unassignedDrivers = drivers.filter((d) => !assignedDriverIds.has(String(d._id)));
  const availableTrucks = trucks.filter((t) => t.isAvailable && !t.driver);
  const canAssign = Boolean(form.driverId && form.truckId && unassignedDrivers.some((d) => d._id === form.driverId) && availableTrucks.some((t) => t._id === form.truckId));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canAssign) {
      setError('Please choose an available driver and truck.');
      return;
    }
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await assignTruck(form);
      setSuccess(`Truck assigned successfully to ${selectedDriver?.name}`);
      setForm({ driverId: '', truckId: '' });
      fetchAll();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="dash-page">
      <div className="dash-section-label">ASSIGN TRUCK</div>
      <h2 className="dash-title">Assign Truck to Driver</h2>

      {error && <ErrorMessage message={error} />}
      {success && <div className="dark-success">{success}</div>}

      <div className="assign-layout">
        {/* Form */}
        <div className="dark-card" style={{ flex: 1 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Driver select */}
            <div className="dark-form-group" style={{ marginBottom: 0 }}>
              <label>Select Driver</label>
              <select
                className="dark-input"
                value={form.driverId}
                onChange={(e) => setForm({ ...form, driverId: e.target.value, truckId: '' })}
                required
                disabled={unassignedDrivers.length === 0}
              >
                <option value="">
                  {unassignedDrivers.length === 0 ? '— No available drivers —' : '— Choose a driver —'}
                </option>
                {unassignedDrivers.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name} ({d.mobile || d.email})
                  </option>
                ))}
              </select>
              {selectedDriver && (
                <div className="assign-badge-row">
                  <span className={`status-badge ${selectedDriver.driverStatus === 'active' ? 'badge-green' : 'badge-red'}`}>
                    {selectedDriver.driverStatus === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>
              )}
              {unassignedDrivers.length === 0 && (
                <div className="users-note" style={{ marginTop: '0.75rem' }}>
                  No drivers are available right now. Unassign a truck first before creating a new assignment.
                </div>
              )}
            </div>

            {/* Truck select */}
            <div className="dark-form-group" style={{ marginBottom: 0 }}>
              <label>Select Truck</label>
              <select
                className="dark-input"
                value={form.truckId}
                onChange={(e) => setForm({ ...form, truckId: e.target.value })}
                required
                disabled={!form.driverId || availableTrucks.length === 0}
              >
                <option value="">
                  {availableTrucks.length === 0 ? '— No available trucks —' : '— Choose a truck —'}
                </option>
                {availableTrucks.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.truckNumber}{t.model ? ` — ${t.model}` : ''}{t.capacity ? ` (${t.capacity})` : ''}
                  </option>
                ))}
              </select>
              {selectedTruck && (
                <div className="assign-badge-row">
                  <span className="status-badge badge-green">Available</span>
                  {selectedTruck.status === 'maintenance' && (
                    <span className="status-badge badge-red">Maintenance</span>
                  )}
                </div>
              )}
              {availableTrucks.length === 0 && (
                <div className="users-note" style={{ marginTop: '0.75rem' }}>
                  No trucks are available right now. Assignments are blocked until a truck is freed up.
                </div>
              )}
            </div>

            <button className="approve-btn" type="submit" disabled={submitting || !canAssign}
              style={{ alignSelf: 'flex-start', padding: '0.6rem 1.5rem' }}>
              {submitting ? 'Assigning...' : '🔗 Assign Truck'}
            </button>
          </form>
        </div>

        {/* Current assignments table */}
        <div style={{ flex: 1.5 }}>
          <div style={{ fontWeight: 600, color: 'var(--muted)', fontSize: '0.75rem', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
            CURRENT ASSIGNMENTS
          </div>
          <div className="dark-table-wrap">
            <table className="dark-table">
              <thead>
                <tr>
                  <th>DRIVER</th>
                  <th>TRUCK</th>
                  <th>TRUCK STATUS</th>
                </tr>
              </thead>
              <tbody>
                {drivers.map((d) => {
                  const truck = trucks.find((t) => t.driver?._id === d._id || t.driver === d._id);
                  return (
                    <tr key={d._id}>
                      <td>
                        <div>{d.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--dim)' }}>{d.mobile || d.email}</div>
                      </td>
                      <td>
                        {truck
                          ? <span style={{ color: '#10b981' }}>{truck.truckNumber}</span>
                          : <span style={{ color: 'var(--dim)' }}>Unassigned</span>}
                      </td>
                      <td>
                        {truck
                          ? <span className={`status-badge ${truck.status === 'available' ? 'badge-green' : 'badge-yellow'}`}>
                              {truck.status === 'available' ? 'Available' : 'Maintenance'}
                            </span>
                          : '—'}
                      </td>
                    </tr>
                  );
                })}
                {drivers.length === 0 && (
                  <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--dim)', padding: '2rem' }}>No drivers found</td></tr>
                )}
                {drivers.length > 0 && unassignedDrivers.length === 0 && (
                  <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--dim)', padding: '2rem' }}>All drivers already have trucks assigned</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAssignTruck;
