import { useEffect, useState } from 'react';
import { getUsers, getTrucks, assignTruck } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { useLanguage } from '../context/LanguageContext';

const AdminAssignTruck = () => {
  const [drivers, setDrivers] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({ driverId: '', truckId: '' });
  const [submitting, setSubmitting] = useState(false);
  const { t } = useLanguage();

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
      setError(t('admin.assignTruck.validationChoose'));
      return;
    }
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await assignTruck(form);
      setSuccess(`${t('admin.assignTruck.successAssign')} ${selectedDriver?.name}`);
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
      <div className="dash-section-label">{t('admin.assignTruck.assignLabel')}</div>
      <h2 className="dash-title">{t('admin.assignTruck.title')}</h2>

      {error && <ErrorMessage message={error} />}
      {success && <div className="dark-success">{success}</div>}

      <div className="assign-layout">
        {/* Form */}
        <div className="dark-card" style={{ flex: 1 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Driver select */}
            <div className="dark-form-group" style={{ marginBottom: 0 }}>
              <label>{t('admin.assignTruck.driverField')}</label>
              <select
                className="dark-input"
                value={form.driverId}
                onChange={(e) => setForm({ ...form, driverId: e.target.value, truckId: '' })}
                required
                disabled={unassignedDrivers.length === 0}
              >
                <option value="">
                  {unassignedDrivers.length === 0 ? t('admin.assignTruck.noDrivers') : t('admin.assignTruck.chooseDriver')}
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
                    {selectedDriver.driverStatus === 'active' ? t('admin.users.activeTag') : t('admin.users.inactiveTag')}
                  </span>
                </div>
              )}
              {unassignedDrivers.length === 0 && (
                <div className="users-note" style={{ marginTop: '0.75rem' }}>
                  {t('admin.assignTruck.noDriversNote')}
                </div>
              )}
            </div>

            {/* Truck select */}
            <div className="dark-form-group" style={{ marginBottom: 0 }}>
              <label>{t('admin.assignTruck.truckField')}</label>
              <select
                className="dark-input"
                value={form.truckId}
                onChange={(e) => setForm({ ...form, truckId: e.target.value })}
                required
                disabled={!form.driverId || availableTrucks.length === 0}
              >
                <option value="">
                  {availableTrucks.length === 0 ? t('admin.assignTruck.noTrucks') : t('admin.assignTruck.chooseTruck')}
                </option>
                {availableTrucks.map((tItem) => (
                  <option key={tItem._id} value={tItem._id}>
                    {tItem.truckNumber}{tItem.model ? ` — ${tItem.model}` : ''}{tItem.capacity ? ` (${tItem.capacity})` : ''}
                  </option>
                ))}
              </select>
              {selectedTruck && (
                <div className="assign-badge-row">
                  <span className="status-badge badge-green">{t('admin.users.activeTag')}</span>
                  {selectedTruck.status === 'maintenance' && (
                    <span className="status-badge badge-red">{t('admin.users.inactiveTag')}</span>
                  )}
                </div>
              )}
              {availableTrucks.length === 0 && (
                <div className="users-note" style={{ marginTop: '0.75rem' }}>
                  {t('admin.assignTruck.noTrucksNote')}
                </div>
              )}
            </div>

            <button className="approve-btn" type="submit" disabled={submitting || !canAssign}
              style={{ alignSelf: 'flex-start', padding: '0.6rem 1.5rem' }}>
              {submitting ? t('admin.assignTruck.assigning') : t('admin.assignTruck.assignBtn')}
            </button>
          </form>
        </div>

        {/* Current assignments table */}
        <div style={{ flex: 1.5 }}>
          <div style={{ fontWeight: 600, color: 'var(--muted)', fontSize: '0.75rem', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
            {t('admin.assignTruck.currentAssignments')}
          </div>
          <div className="dark-table-wrap">
            <table className="dark-table">
              <thead>
                <tr>
                  <th>{t('admin.assignTruck.colDriver')}</th>
                  <th>{t('admin.assignTruck.colTruck')}</th>
                  <th>{t('admin.assignTruck.colTruckStatus')}</th>
                </tr>
              </thead>
              <tbody>
                {drivers.map((d) => {
                  const truck = trucks.find((tItem) => tItem.driver?._id === d._id || tItem.driver === d._id);
                  return (
                    <tr key={d._id}>
                      <td>
                        <div>{d.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--dim)' }}>{d.mobile || d.email}</div>
                      </td>
                      <td>
                        {truck
                          ? <span style={{ color: '#10b981' }}>{truck.truckNumber}</span>
                          : <span style={{ color: 'var(--dim)' }}>{t('admin.assignTruck.unassigned')}</span>}
                      </td>
                      <td>
                        {truck
                          ? <span className={`status-badge ${truck.status === 'available' ? 'badge-green' : 'badge-yellow'}`}>
                              {truck.status === 'available' ? t('admin.users.activeTag') : t('admin.users.inactiveTag')}
                            </span>
                          : '—'}
                      </td>
                    </tr>
                  );
                })}
                {drivers.length === 0 && (
                  <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--dim)', padding: '2rem' }}>{t('admin.drivers.noDriversFound')}</td></tr>
                )}
                {drivers.length > 0 && unassignedDrivers.length === 0 && (
                  <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--dim)', padding: '2rem' }}>{t('admin.assignTruck.allDriversAssigned')}</td></tr>
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
