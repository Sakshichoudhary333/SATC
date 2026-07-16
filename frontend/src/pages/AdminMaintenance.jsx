import { useEffect, useState } from 'react';
import { getMaintenanceLogs, createMaintenanceLog, completeMaintenanceLog, deleteMaintenanceLog, getTrucks } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { formatDate } from '../utils/helpers';
import { useLanguage } from '../context/LanguageContext';

const AdminMaintenance = () => {
  const [logs, setLogs] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { t } = useLanguage();

  // Form states
  const [selectedTruckId, setSelectedTruckId] = useState('');
  const [serviceType, setServiceType] = useState('Oil Change');
  const [serviceDate, setServiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [nextDueDate, setNextDueDate] = useState('');
  const [cost, setCost] = useState('');
  const [notes, setNotes] = useState('');

  // Complete log state
  const [completingId, setCompletingId] = useState(null);
  const [completeCost, setCompleteCost] = useState('');
  const [completeNotes, setCompleteNotes] = useState('');

  const loadData = async () => {
    try {
      const [logsData, trucksData] = await Promise.all([
        getMaintenanceLogs(),
        getTrucks()
      ]);
      setLogs(logsData);
      setTrucks(trucksData);
    } catch (err) {
      setError(err.message || 'Failed to load maintenance data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSchedule = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedTruckId) {
      setError('Please select a truck');
      return;
    }
    if (!nextDueDate) {
      setError('Please specify the next service due date');
      return;
    }

    setSubmitting(true);
    try {
      const newLog = await createMaintenanceLog({
        truckId: selectedTruckId,
        serviceType,
        serviceDate,
        nextDueDate,
        cost: Number(cost) || 0,
        notes,
      });

      setLogs((prev) => [newLog, ...prev]);
      setSuccess('Maintenance service scheduled successfully!');
      
      // Reset form
      setSelectedTruckId('');
      setCost('');
      setNotes('');
      setNextDueDate('');
    } catch (err) {
      setError(err.message || 'Failed to schedule maintenance');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteSubmit = async (e) => {
    e.preventDefault();
    if (!completingId) return;

    try {
      const updated = await completeMaintenanceLog(completingId, {
        cost: Number(completeCost) || 0,
        notes: completeNotes,
      });

      setLogs((prev) => prev.map((l) => (l._id === completingId ? updated : l)));
      setSuccess('Maintenance marked as completed!');
      setCompletingId(null);
      setCompleteCost('');
      setCompleteNotes('');
    } catch (err) {
      setError(err.message || 'Failed to complete maintenance');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this maintenance record?')) return;
    setError('');
    setSuccess('');

    try {
      await deleteMaintenanceLog(id);
      setLogs((prev) => prev.filter((l) => l._id !== id));
      setSuccess('Maintenance log deleted successfully!');
    } catch (err) {
      setError(err.message || 'Failed to delete record');
    }
  };

  const overdueCount = logs.filter((l) => l.status === 'overdue').length;

  if (loading) return <LoadingSpinner />;

  return (
    <div className="dash-page">
      <div className="dash-section-label">Fleet Operations</div>
      <h2 className="dash-title">Fleet Maintenance Scheduler</h2>

      {error && <ErrorMessage message={error} />}
      {success && <div className="dark-success" style={{ marginBottom: '1rem' }}>{success}</div>}

      {/* Overdue alert banner */}
      {overdueCount > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.15) 100%)',
          border: '1px solid #ef4444',
          borderRadius: '8px',
          padding: '1rem 1.25rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}>
          <span style={{ fontSize: '1.5rem' }}>⚠️</span>
          <div>
            <div style={{ fontWeight: 700, color: '#ef4444' }}>CRITICAL: OVERDUE VEHICLE MAINTENANCE</div>
            <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '0.15rem' }}>
              There are <strong>{overdueCount}</strong> truck(s) with overdue maintenance schedules. Please complete servicing immediately to prevent breakdown risks.
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'start' }}>
        
        {/* Left column: schedule form */}
        {!completingId ? (
          <div className="dark-card" style={{ maxWidth: '500px' }}>
            <div className="dark-card-label" style={{ color: '#06b6d4' }}>📅 Schedule Maintenance</div>
            <form onSubmit={handleSchedule} style={{ marginTop: '1rem' }}>
              <div className="dark-form-group">
                <label>Select Truck</label>
                <select
                  className="dark-input"
                  value={selectedTruckId}
                  onChange={(e) => setSelectedTruckId(e.target.value)}
                >
                  <option value="">Choose a truck...</option>
                  {trucks.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.truckNumber} ({t.model || 'Unknown Model'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="dark-form-group">
                <label>Service Type</label>
                <select
                  className="dark-input"
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                >
                  <option value="Oil Change">Oil Change</option>
                  <option value="Tire Rotation">Tire Rotation</option>
                  <option value="Brake Inspection">Brake Inspection</option>
                  <option value="Engine Checkup">Engine Checkup</option>
                  <option value="General Repair">General Repair</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="dark-form-group">
                  <label>Service Date</label>
                  <input
                    type="date"
                    className="dark-input"
                    value={serviceDate}
                    onChange={(e) => setServiceDate(e.target.value)}
                  />
                </div>
                <div className="dark-form-group">
                  <label>Next Due Date</label>
                  <input
                    type="date"
                    className="dark-input"
                    value={nextDueDate}
                    onChange={(e) => setNextDueDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="dark-form-group">
                <label>Est. Cost (₹)</label>
                <input
                  type="number"
                  placeholder="0"
                  className="dark-input"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                />
              </div>

              <div className="dark-form-group">
                <label>Notes</label>
                <textarea
                  placeholder="Describe maintenance scope..."
                  className="dark-input"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="approve-btn"
                style={{ width: '100%', marginTop: '0.5rem' }}
                disabled={submitting}
              >
                {submitting ? 'Scheduling...' : 'Schedule Service'}
              </button>
            </form>
          </div>
        ) : (
          /* Complete Maintenance Form */
          <div className="dark-card" style={{ maxWidth: '500px' }}>
            <div className="dark-card-label" style={{ color: '#10b981' }}>✔️ Record Completed Service</div>
            <form onSubmit={handleCompleteSubmit} style={{ marginTop: '1rem' }}>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1rem' }}>
                Finalize the service logs. Enter the actual costs spent during servicing.
              </p>
              
              <div className="dark-form-group">
                <label>Actual Cost (₹)</label>
                <input
                  type="number"
                  placeholder="Enter final cost..."
                  className="dark-input"
                  value={completeCost}
                  onChange={(e) => setCompleteCost(e.target.value)}
                  required
                />
              </div>

              <div className="dark-form-group">
                <label>Final Notes</label>
                <textarea
                  placeholder="Spare parts replaced, mechanic notes..."
                  className="dark-input"
                  rows={3}
                  value={completeNotes}
                  onChange={(e) => setCompleteNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="submit" className="approve-btn" style={{ flex: 1 }}>
                  Submit Log
                </button>
                <button
                  type="button"
                  className="reject-btn"
                  style={{ flex: 1 }}
                  onClick={() => setCompletingId(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Right column: maintenance logs table */}
        <div style={{ flex: 2 }}>
          <div className="dash-section-label" style={{ marginBottom: '0.75rem' }}>Maintenance Logs</div>
          {logs.length === 0 ? (
            <p style={{ color: '#64748b' }}>No scheduled or historical maintenance records found.</p>
          ) : (
            <div className="dark-card" style={{ padding: 0, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase' }}>Truck</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase' }}>Type</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase' }}>Next Due</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase' }}>Status</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase' }}>Cost</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '0.75rem 1rem', color: '#e2e8f0', fontWeight: 600 }}>{log.truck?.truckNumber || '—'}</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#94a3b8' }}>{log.serviceType}</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#e2e8f0', fontSize: '0.85rem' }}>{formatDate(log.nextDueDate)}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span style={{
                          color: log.status === 'completed' ? '#10b981' : log.status === 'overdue' ? '#ef4444' : '#f59e0b',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          textTransform: 'uppercase'
                        }}>
                          {log.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: '#06b6d4' }}>₹{log.cost}</td>
                      <td style={{ padding: '0.75rem 1rem', display: 'flex', gap: '0.4rem' }}>
                        {log.status !== 'completed' && (
                          <button
                            className="approve-btn"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                            onClick={() => {
                              setCompletingId(log._id);
                              setCompleteCost(log.cost || '');
                              setCompleteNotes(log.notes || '');
                            }}
                          >
                            Complete
                          </button>
                        )}
                        <button
                          className="reject-btn"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                          onClick={() => handleDelete(log._id)}
                        >
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
      </div>
    </div>
  );
};

export default AdminMaintenance;
