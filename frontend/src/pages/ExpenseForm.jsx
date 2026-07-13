import { useEffect, useState } from 'react';
import { addExpense, getMyExpenses, getTrips, updateExpense, deleteExpense } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { formatDate } from '../utils/helpers';

const isValidMongoId = (value) =>
  typeof value === 'string' && /^[a-fA-F0-9]{24}$/.test(value.trim());

const sortTripsForExpenses = (trips = []) =>
  [...trips].sort((a, b) => {
    const rank = { started: 0, 'in-transit': 1, completed: 2 };
    const aRank = rank[a?.status] ?? 99;
    const bRank = rank[b?.status] ?? 99;
    if (aRank !== bRank) return aRank - bRank;
    return new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0);
  });

const normalizeExpense = (entry) => entry?.expense || entry || null;

const EMPTY_COSTS = { fuelCost: '', tollCost: '', foodCost: '', maintenanceCost: '', notes: '' };

const STATUS_COLOR = {
  pending: '#f59e0b',
  approved: '#10b981',
  rejected: '#ef4444',
};

const COST_FIELDS = ['fuelCost', 'tollCost', 'foodCost', 'maintenanceCost'];

const ExpenseForm = () => {
  const { user } = useAuth();

  const [trips, setTrips] = useState([]);           // all driver trips (for history display)
  const [eligibleTrips, setEligibleTrips] = useState([]); // trips that can accept an expense entry
  const [expenses, setExpenses] = useState([]);

  const [selectedTripId, setSelectedTripId] = useState('');
  const [form, setForm] = useState(EMPTY_COSTS);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // ── load ──────────────────────────────────────────
  const load = async () => {
    try {
      const [allTrips, myExp] = await Promise.all([getTrips(), getMyExpenses()]);

      const userId = user?.id || user?._id;
      const driverTrips = (Array.isArray(allTrips) ? allTrips : []).filter((t) => {
        const driverId = typeof t.driver === 'object' ? t.driver?._id : t.driver;
        return driverId?.toString() === userId?.toString();
      });

      const normalizedExpenses = (Array.isArray(myExp) ? myExp : [])
        .map(normalizeExpense)
        .filter(Boolean);

      // Trip IDs that already have an expense record
      const submittedTripIds = new Set(
        normalizedExpenses.map((e) => (e.trip?._id || e.trip)?.toString()).filter(Boolean)
      );

      // Map of tripId → expense for quick lookup
      const expenseByTripId = {};
      for (const e of normalizedExpenses) {
        const tid = (e.trip?._id || e.trip)?.toString();
        if (tid) expenseByTripId[tid] = e;
      }

      // Eligible = active trips (always) + completed trips where post-trip edit is still available
      const eligible = sortTripsForExpenses(
        driverTrips.filter((t) => {
          if (t.status !== 'completed') return true;
          const exp = expenseByTripId[t._id?.toString()];
          // No expense yet → eligible (first submission)
          if (!exp) return true;
          // Expense exists but post-trip edit not yet used → eligible (one final edit)
          return !exp.postTripEditUsed;
        })
      );

      setTrips(sortTripsForExpenses(driverTrips));
      setEligibleTrips(eligible);
      setExpenses(normalizedExpenses);

      // Auto-select first eligible trip
      setSelectedTripId((prev) => {
        if (prev && eligible.some((t) => t._id === prev)) return prev;
        return eligible[0]?._id || '';
      });
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) load();
    else setLoading(false);
  }, [user?.id, user?._id]);

  // ── When selected trip changes, pre-fill form if an expense already exists ──
  useEffect(() => {
    if (!selectedTripId) {
      setForm(EMPTY_COSTS);
      return;
    }
    const existing = expenses.find(
      (e) => (e.trip?._id || e.trip)?.toString() === selectedTripId
    );
    if (existing) {
      setForm({
        fuelCost: existing.fuelCost ?? '',
        tollCost: existing.tollCost ?? '',
        foodCost: existing.foodCost ?? '',
        maintenanceCost: existing.maintenanceCost ?? '',
        notes: existing.notes ?? '',
      });
    } else {
      setForm(EMPTY_COSTS);
    }
  }, [selectedTripId, expenses]);

  const selectedTrip = [...trips, ...eligibleTrips].find((t) => t._id === selectedTripId) || null;

  // Expense record for the currently selected trip (if any)
  const existingExpense = expenses.find(
    (e) => (e.trip?._id || e.trip)?.toString() === selectedTripId
  ) || null;

  const getTripDisplay = (expense) => {
    const tripId = expense.trip?._id || expense.trip;
    const trip = trips.find((t) => t._id === tripId);
    if (trip) {
      return (
        <>
          <code style={{ color: '#06b6d4' }}>{trip._id.slice(-6)}</code>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
            {trip.order?.pickupLocation || 'N/A'} → {trip.order?.destination || 'N/A'}
          </div>
        </>
      );
    }
    return <code style={{ color: '#06b6d4' }}>{String(tripId || '').slice(-6)}</code>;
  };

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const validateForm = () => {
    for (const key of COST_FIELDS) {
      const val = Number(form[key]);
      if (form[key] !== '' && (isNaN(val) || val < 0 || val > 1_000_000)) {
        return `${key.replace('Cost', ' cost')} must be between 0 and 1,000,000.`;
      }
    }
    if (form.notes && form.notes.length > 500) return 'Notes must be at most 500 characters.';
    return null;
  };

  // ── Submit: create or update the single expense record for this trip ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedTripId || !isValidMongoId(selectedTripId)) {
      setError('Please select a trip');
      return;
    }

    const validationError = validateForm();
    if (validationError) { setError(validationError); return; }

    setSubmitting(true);

    const payload = {
      fuelCost: Number(form.fuelCost) || 0,
      tollCost: Number(form.tollCost) || 0,
      foodCost: Number(form.foodCost) || 0,
      maintenanceCost: Number(form.maintenanceCost) || 0,
      notes: form.notes,
    };

    try {
      if (existingExpense) {
        // Update the existing record
        const updated = await updateExpense(existingExpense._id, payload);
        const saved = normalizeExpense(updated);
        setExpenses((prev) =>
          prev.map((ex) => (ex._id === existingExpense._id ? saved : ex))
        );

        // If the post-trip edit was just consumed, remove this trip from eligible list
        if (saved?.postTripEditUsed) {
          setEligibleTrips((prev) => {
            const next = prev.filter((t) => t._id !== selectedTripId);
            setSelectedTripId(next[0]?._id || '');
            return next;
          });
        }

        setSuccess('Expense updated successfully!');
      } else {
        // Create new record for this trip
        const created = await addExpense({ trip: selectedTripId, ...payload });
        const saved = normalizeExpense(created);
        setExpenses((prev) => [saved, ...prev].filter(Boolean));

        // If trip is completed, it's now submitted — remove from eligible list
        setEligibleTrips((prev) => {
          const trip = prev.find((t) => t._id === selectedTripId);
          if (trip?.status === 'completed') {
            const next = prev.filter((t) => t._id !== selectedTripId);
            setSelectedTripId(next[0]?._id || '');
            return next;
          }
          return prev;
        });

        setSuccess('Expense recorded successfully!');
      }
    } catch (err) {
      setError(err.message || 'Failed to save expense');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    setError('');
    try {
      await deleteExpense(id);
      setExpenses((prev) => prev.filter((e) => e._id !== id));
      // After deletion the trip becomes eligible again if it was completed
      await load();
      setSuccess('Expense deleted.');
    } catch (err) {
      setError(err.message || 'Failed to delete expense');
    }
  };

  const canEdit = (expense) => {
    const trip = trips.find((t) => t._id === (expense.trip?._id || expense.trip));
    if (expense.approvalStatus === 'approved') return false;
    if (!trip || trip.status !== 'completed') return true; // active trip — always editable
    return !expense.postTripEditUsed; // completed trip — only if post-trip edit not yet used
  };

  if (loading) return <LoadingSpinner />;

  const isEditMode = Boolean(existingExpense);
  const isApproved = existingExpense?.approvalStatus === 'approved';
  const isTripCompleted = selectedTrip?.status === 'completed';
  const postTripEditUsed = existingExpense?.postTripEditUsed === true;
  // Form is read-only when: approved, or completed trip with post-trip edit already used
  const formReadOnly = isApproved || (isTripCompleted && postTripEditUsed);

  return (
    <div className="dash-page">
      <div className="dash-section-label">EXPENSES</div>
      <h2 className="dash-title">Record Expense</h2>

      {error && <ErrorMessage message={error} />}
      {success && <div className="dark-success">{success}</div>}

      {trips.length === 0 && (
        <p style={{ color: 'orange', marginBottom: '1rem' }}>No trips assigned to you yet.</p>
      )}
      {trips.length > 0 && eligibleTrips.length === 0 && (
        <p style={{ color: '#f59e0b', marginBottom: '1rem' }}>
          All trip expenses have been submitted.
        </p>
      )}

      {eligibleTrips.length > 0 && (
        <div className="dark-card" style={{ maxWidth: '620px', marginBottom: '2rem' }}>

          {/* Trip selector */}
          <div className="dark-form-group" style={{ marginBottom: '1.25rem' }}>
            <label>Select Trip</label>
            <select
              className="dark-input"
              value={selectedTripId}
              onChange={(e) => setSelectedTripId(e.target.value)}
            >
              <option value="">-- Select a trip --</option>
              {eligibleTrips.map((t) => (
                <option key={t._id} value={t._id}>
                  {t._id.slice(-6)} — {t.order?.pickupLocation || 'N/A'} → {t.order?.destination || 'N/A'}
                  {' '}({t.status === 'completed' ? 'completed – final entry' : t.status})
                </option>
              ))}
            </select>
            {selectedTrip && (
              <div className="users-note" style={{ marginTop: '0.5rem' }}>
                {isEditMode
                  ? `Editing existing expense for trip ${selectedTripId.slice(-6)}`
                  : `New expense entry for trip ${selectedTripId.slice(-6)}`}
                {isApproved && (
                  <span style={{ color: '#10b981', marginLeft: '0.5rem' }}> — Approved (read-only)</span>
                )}
                {!isApproved && isTripCompleted && !postTripEditUsed && isEditMode && (
                  <span style={{ color: '#f59e0b', marginLeft: '0.5rem' }}> — 1 edit remaining after completion</span>
                )}
                {!isApproved && isTripCompleted && postTripEditUsed && (
                  <span style={{ color: '#ef4444', marginLeft: '0.5rem' }}> — Locked (post-trip edit used)</span>
                )}
              </div>
            )}
          </div>

          {/* Cost fields */}
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {COST_FIELDS.map((f) => (
                <div className="dark-form-group" key={f}>
                  <label>{f.replace('Cost', '').replace(/([A-Z])/g, ' $1').trim()} Cost (₹)</label>
                  <input
                    className="dark-input"
                    name={f}
                    type="number"
                    min="0"
                    value={form[f]}
                    onChange={handleChange}
                    placeholder="0"
                    disabled={formReadOnly}
                  />
                </div>
              ))}
            </div>

            <div className="dark-form-group">
              <label>Notes</label>
              <textarea
                className="dark-input"
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={3}
                placeholder="Additional notes..."
                disabled={formReadOnly}
              />
            </div>

            {!formReadOnly && (
              <button
                type="submit"
                className="approve-btn"
                disabled={submitting || !selectedTripId}
                style={{ width: '100%', marginTop: '0.5rem' }}
              >
                {submitting
                  ? 'Saving...'
                  : isEditMode
                    ? 'Update Expense'
                    : 'Submit Expense'}
              </button>
            )}
          </form>
        </div>
      )}

      {/* Expense history table */}
      {expenses.length > 0 && (
        <>
          <div className="dash-section-label" style={{ marginBottom: '0.75rem' }}>
            MY EXPENSE HISTORY
          </div>
          <div className="dark-table-wrap">
            <table className="dark-table">
              <thead>
                <tr>
                  <th>TRIP</th>
                  <th>FUEL</th>
                  <th>TOLL</th>
                  <th>FOOD</th>
                  <th>MAINTENANCE</th>
                  <th>TOTAL</th>
                  <th>STATUS</th>
                  <th>DATE</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((e) => (
                  <tr key={e._id}>
                    <td>{getTripDisplay(e)}</td>
                    <td>₹{e.fuelCost}</td>
                    <td>₹{e.tollCost}</td>
                    <td>₹{e.foodCost}</td>
                    <td>₹{e.maintenanceCost}</td>
                    <td style={{ color: '#06b6d4' }}>₹{e.totalExpense}</td>
                    <td>
                      <span
                        className="status-badge"
                        style={{
                          background: `${STATUS_COLOR[e.approvalStatus] || '#94a3b8'}22`,
                          color: STATUS_COLOR[e.approvalStatus] || '#94a3b8',
                        }}
                      >
                        {e.approvalStatus?.charAt(0).toUpperCase() + e.approvalStatus?.slice(1)}
                      </span>
                    </td>
                    <td>{e.createdAt ? formatDate(e.createdAt) : '—'}</td>
                    <td>
                      {canEdit(e) ? (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            className="approve-btn"
                            style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }}
                            onClick={() => {
                              const tripId = (e.trip?._id || e.trip)?.toString();
                              setSelectedTripId(tripId);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className="reject-btn"
                            style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }}
                            onClick={() => handleDelete(e._id)}
                          >
                            Delete
                          </button>
                        </div>
                      ) : (
                        <span style={{ color: '#64748b', fontSize: '0.8rem' }}>Read-only</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default ExpenseForm;
