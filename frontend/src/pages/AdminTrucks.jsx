import { useEffect, useState } from 'react';
import { getTrucks, addTruck, updateTruckApi, deleteTruckApi } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { useLanguage } from '../context/LanguageContext';

const EMPTY = { truckNumber: '', model: '', capacity: '', status: 'available' };

const AdminTrucks = () => {
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const { t } = useLanguage();

  useEffect(() => { fetchTrucks(); }, []);

  const fetchTrucks = () => {
    setLoading(true);
    getTrucks()
      .then(setTrucks)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editId) {
        await updateTruckApi(editId, form);
        setEditId(null);
      } else {
        await addTruck(form);
      }
      setForm(EMPTY);
      fetchTrucks();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (t) => {
    setEditId(t._id);
    setForm({ truckNumber: t.truckNumber, model: t.model || '', capacity: t.capacity || '', status: t.status || 'available' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('admin.trucks.confirmDeleteTruck'))) return;
    setDeletingId(id);
    try {
      await deleteTruckApi(id);
      setTrucks((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="dash-page">
      <div className="dash-section-label">{t('admin.trucks.trucksLabel')}</div>
      <h2 className="dash-title">{editId ? t('admin.trucks.editTitle') : t('admin.trucks.manageTitle')}</h2>
      {error && <ErrorMessage message={error} />}

      <div className="dark-card" style={{ marginBottom: '1.75rem' }}>
        <div style={{ fontWeight: 600, marginBottom: '1rem', color: 'var(--cyan)' }}>
          {editId ? t('admin.trucks.editHeader') : t('admin.trucks.addHeader')}
        </div>
        <form onSubmit={handleSubmit}>
          <div className="admin-form-grid">
            <div className="dark-form-group">
              <label>{t('admin.trucks.truckNumberField')}</label>
              <input className="dark-input" name="truckNumber" value={form.truckNumber} onChange={handleChange} required placeholder={t('admin.trucks.truckNumPlaceholder')} />
            </div>
            <div className="dark-form-group">
              <label>{t('admin.trucks.modelField')}</label>
              <input className="dark-input" name="model" value={form.model} onChange={handleChange} placeholder={t('admin.trucks.modelPlaceholder')} />
            </div>
            <div className="dark-form-group">
              <label>{t('admin.trucks.capacityField')}</label>
              <input className="dark-input" name="capacity" value={form.capacity} onChange={handleChange} placeholder={t('admin.trucks.capacityPlaceholder')} />
            </div>
            <div className="dark-form-group">
              <label>{t('admin.users.colStatus')}</label>
              <select className="dark-input" name="status" value={form.status} onChange={handleChange}>
                <option value="available">{t('admin.users.activeTag')}</option>
                <option value="maintenance">{t('admin.users.inactiveTag')}</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button className="approve-btn" type="submit" disabled={submitting}>
              {submitting ? t('admin.users.saving') : editId ? t('admin.trucks.updateTruckBtn') : t('admin.trucks.addTruckBtn')}
            </button>
            {editId && (
              <button type="button" className="reject-btn" onClick={() => { setEditId(null); setForm(EMPTY); }}>
                {t('admin.users.cancelBtn')}
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="dark-table-wrap">
        <table className="dark-table">
          <thead>
            <tr>
              <th>{t('admin.trucks.colTruckNo')}</th>
              <th>{t('admin.trucks.colModel')}</th>
              <th>{t('admin.trucks.colCapacity')}</th>
              <th>{t('admin.trucks.colStatus')}</th>
              <th>{t('admin.trucks.colDriver')}</th>
              <th>{t('admin.trucks.colEdit')}</th>
              <th>{t('admin.trucks.colDelete')}</th>
            </tr>
          </thead>
          <tbody>
            {trucks.map((tItem) => (
              <tr key={tItem._id}>
                <td>{tItem.truckNumber}</td>
                <td>{tItem.model || '—'}</td>
                <td>{tItem.capacity || '—'}</td>
                <td>
                  <span className={`status-badge ${tItem.status === 'available' ? 'badge-green' : 'badge-yellow'}`}>
                    {tItem.status === 'available' ? t('admin.users.activeTag') : t('admin.users.inactiveTag')}
                  </span>
                </td>
                <td>{tItem.driver?.name || <span style={{ color: 'var(--dim)' }}>{t('admin.trucks.unassigned')}</span>}</td>
                <td>
                  <button className="approve-btn" style={{ padding: '0.3rem 0.75rem' }} onClick={() => handleEdit(tItem)}>
                    {t('admin.trucks.colEdit')}
                  </button>
                </td>
                <td>
                  <button className="reject-btn" style={{ padding: '0.3rem 0.75rem' }} disabled={deletingId === tItem._id} onClick={() => handleDelete(tItem._id)}>
                    {deletingId === tItem._id ? '...' : t('admin.trucks.colDelete')}
                  </button>
                </td>
              </tr>
            ))}
            {trucks.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--dim)', padding: '2rem' }}>{t('admin.trucks.noTrucksRegistered')}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminTrucks;
