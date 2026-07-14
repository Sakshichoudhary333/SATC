import { useEffect, useState } from 'react';
import { getUsers, addDriver, updateDriverApi, deleteDriver } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { useLanguage } from '../context/LanguageContext';

const EMPTY = { name: '', email: '', password: '', mobile: '', licenseNumber: '', experience: '', driverStatus: 'active' };

const AdminDrivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(EMPTY);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const { t } = useLanguage();

  useEffect(() => { fetchDrivers(); }, []);

  const fetchDrivers = () => {
    setLoading(true);
    getUsers()
      .then((res) => {
        const arr = Array.isArray(res) ? res : res?.users || [];
        setDrivers(arr.filter((u) => u.role === 'driver'));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      if (editId) {
        await updateDriverApi(editId, form);
        setEditId(null);
      } else {
        await addDriver(form);
      }
      setForm(EMPTY);
      fetchDrivers();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (d) => {
    setEditId(d._id);
    setForm({
      name: d.name || '',
      email: d.email || '',
      password: '',
      mobile: d.mobile || '',
      licenseNumber: d.licenseNumber || '',
      experience: d.experience ?? '',
      driverStatus: d.driverStatus || 'active',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('admin.drivers.confirmDeleteDriver'))) return;
    setDeletingId(id);
    try {
      await deleteDriver(id);
      setDrivers((prev) => prev.filter((d) => d._id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="dash-page">
      <div className="dash-section-label">{t('admin.drivers.driversLabel')}</div>
      <h2 className="dash-title">{editId ? t('admin.drivers.editTitle') : t('admin.drivers.manageTitle')}</h2>
      {error && <ErrorMessage message={error} />}

      <div className="dark-card" style={{ marginBottom: '1.75rem' }}>
        <div style={{ fontWeight: 600, marginBottom: '1rem', color: 'var(--cyan)' }}>
          {editId ? t('admin.drivers.editHeader') : t('admin.drivers.addHeader')}
        </div>
        {formError && <ErrorMessage message={formError} />}
        <form onSubmit={handleSubmit}>
          <div className="admin-form-grid">
            <div className="dark-form-group">
              <label>{t('admin.drivers.driverNameField')}</label>
              <input className="dark-input" name="name" value={form.name} onChange={handleChange} required placeholder={t('admin.drivers.fullNamePlaceholder')} />
            </div>
            {!editId && (
              <div className="dark-form-group">
                <label>{t('admin.users.emailField')}</label>
                <input className="dark-input" name="email" type="email" value={form.email} onChange={handleChange} required placeholder={t('admin.drivers.emailPlaceholder')} />
              </div>
            )}
            {!editId && (
              <div className="dark-form-group">
                <label>{t('auth.passwordLabel')}</label>
                <input
                  className="dark-input"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder={t('admin.drivers.passwordPlaceholder')}
                />
              </div>
            )}
            <div className="dark-form-group">
              <label>{t('admin.drivers.phoneField')}</label>
              <input className="dark-input" name="mobile" type="tel" value={form.mobile} onChange={handleChange} required placeholder={t('admin.drivers.phonePlaceholder')} />
            </div>
            <div className="dark-form-group">
              <label>{t('admin.users.licenseField')}</label>
              <input className="dark-input" name="licenseNumber" value={form.licenseNumber} onChange={handleChange} placeholder={t('admin.drivers.licensePlaceholder')} />
            </div>
            <div className="dark-form-group">
              <label>{t('admin.users.experienceField')}</label>
              <input className="dark-input" name="experience" type="number" min="0" value={form.experience} onChange={handleChange} placeholder={t('admin.drivers.expPlaceholder')} />
            </div>
            <div className="dark-form-group">
              <label>{t('admin.users.driverStatusField')}</label>
              <select className="dark-input" name="driverStatus" value={form.driverStatus} onChange={handleChange}>
                <option value="active">{t('admin.users.activeTag')}</option>
                <option value="inactive">{t('admin.users.inactiveTag')}</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button className="approve-btn" type="submit" disabled={submitting}>
              {submitting ? t('admin.users.saving') : editId ? t('admin.drivers.updateDriverBtn') : t('admin.drivers.addDriverBtn')}
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
              <th>{t('admin.drivers.colName')}</th>
              <th>{t('admin.drivers.colPhone')}</th>
              <th>{t('admin.drivers.colLicense')}</th>
              <th>{t('admin.drivers.colExp')}</th>
              <th>{t('admin.drivers.colStatus')}</th>
              <th>{t('admin.drivers.colEdit')}</th>
              <th>{t('admin.drivers.colDelete')}</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((d) => (
              <tr key={d._id}>
                <td>{d.name}</td>
                <td>{d.mobile || '—'}</td>
                <td>{d.licenseNumber || '—'}</td>
                <td>{d.experience != null ? `${d.experience} yr` : '—'}</td>
                <td>
                  <span className={`status-badge ${d.driverStatus === 'active' ? 'badge-green' : 'badge-red'}`}>
                    {d.driverStatus === 'active' ? t('admin.users.activeTag') : t('admin.users.inactiveTag')}
                  </span>
                </td>
                <td>
                  <button type="button" className="approve-btn" style={{ padding: '0.3rem 0.75rem' }} onClick={() => handleEdit(d)}>
                    {t('admin.drivers.colEdit')}
                  </button>
                </td>
                <td>
                  <button type="button" className="reject-btn" style={{ padding: '0.3rem 0.75rem' }} disabled={deletingId === d._id} onClick={() => handleDelete(d._id)}>
                    {deletingId === d._id ? '...' : t('admin.drivers.colDelete')}
                  </button>
                </td>
              </tr>
            ))}
            {drivers.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--dim)', padding: '2rem' }}>{t('admin.drivers.noDriversFound')}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDrivers;
