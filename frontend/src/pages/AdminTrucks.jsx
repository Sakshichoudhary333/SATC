import { useEffect, useState } from 'react';
import { getTrucks, addTruck, updateTruckApi, deleteTruckApi } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const EMPTY = { truckNumber: '', model: '', capacity: '', status: 'available' };

const AdminTrucks = () => {
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

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
    if (!window.confirm('Delete this truck?')) return;
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
      <div className="dash-section-label">TRUCKS</div>
      <h2 className="dash-title">{editId ? 'Edit Truck' : 'Manage Trucks'}</h2>
      {error && <ErrorMessage message={error} />}

      <div className="dark-card" style={{ marginBottom: '1.75rem' }}>
        <div style={{ fontWeight: 600, marginBottom: '1rem', color: 'var(--cyan)' }}>
          {editId ? '✏️ Edit Truck' : '+ Add Truck'}
        </div>
        <form onSubmit={handleSubmit}>
          <div className="admin-form-grid">
            <div className="dark-form-group">
              <label>Truck Number</label>
              <input className="dark-input" name="truckNumber" value={form.truckNumber} onChange={handleChange} required placeholder="e.g. MH-01-AB-1234" />
            </div>
            <div className="dark-form-group">
              <label>Model / Type</label>
              <input className="dark-input" name="model" value={form.model} onChange={handleChange} placeholder="e.g. Tata 407" />
            </div>
            <div className="dark-form-group">
              <label>Capacity</label>
              <input className="dark-input" name="capacity" value={form.capacity} onChange={handleChange} placeholder="e.g. 5 Tons" />
            </div>
            <div className="dark-form-group">
              <label>Status</label>
              <select className="dark-input" name="status" value={form.status} onChange={handleChange}>
                <option value="available">Available</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button className="approve-btn" type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : editId ? 'Update Truck' : 'Add Truck'}
            </button>
            {editId && (
              <button type="button" className="reject-btn" onClick={() => { setEditId(null); setForm(EMPTY); }}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="dark-table-wrap">
        <table className="dark-table">
          <thead>
            <tr>
              <th>TRUCK NO.</th>
              <th>MODEL</th>
              <th>CAPACITY</th>
              <th>STATUS</th>
              <th>DRIVER</th>
              <th>EDIT</th>
              <th>DELETE</th>
            </tr>
          </thead>
          <tbody>
            {trucks.map((t) => (
              <tr key={t._id}>
                <td>{t.truckNumber}</td>
                <td>{t.model || '—'}</td>
                <td>{t.capacity || '—'}</td>
                <td>
                  <span className={`status-badge ${t.status === 'available' ? 'badge-green' : 'badge-yellow'}`}>
                    {t.status === 'available' ? 'Available' : 'Maintenance'}
                  </span>
                </td>
                <td>{t.driver?.name || <span style={{ color: 'var(--dim)' }}>Unassigned</span>}</td>
                <td>
                  <button className="approve-btn" style={{ padding: '0.3rem 0.75rem' }} onClick={() => handleEdit(t)}>
                    Edit
                  </button>
                </td>
                <td>
                  <button className="reject-btn" style={{ padding: '0.3rem 0.75rem' }} disabled={deletingId === t._id} onClick={() => handleDelete(t._id)}>
                    {deletingId === t._id ? '...' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
            {trucks.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--dim)', padding: '2rem' }}>No trucks registered</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminTrucks;
