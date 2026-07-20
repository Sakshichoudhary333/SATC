import { useEffect, useState } from 'react';
import { addExpense, getMyExpenses, getTrips, updateExpense, deleteExpense } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { formatDate } from '../utils/helpers';
import { useLanguage } from '../context/LanguageContext';

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

const EMPTY_COSTS = { fuelCost: '', tollCost: '', foodCost: '', maintenanceCost: '', notes: '', receiptImage: '' };

const STATUS_COLOR = {
  pending: '#f59e0b',
  approved: '#10b981',
  rejected: '#ef4444',
};

const COST_FIELDS = ['fuelCost', 'tollCost', 'foodCost', 'maintenanceCost'];

const ExpenseForm = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [trips, setTrips] = useState([]);           // all driver trips (for history display)
  const [eligibleTrips, setEligibleTrips] = useState([]); // trips that can accept an expense entry
  const [expenses, setExpenses] = useState([]);

  const [selectedTripId, setSelectedTripId] = useState('');
  const [form, setForm] = useState(EMPTY_COSTS);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [receiptPreview, setReceiptPreview] = useState('');
  const [activeReceiptUrl, setActiveReceiptUrl] = useState(null);


  // ── load ──────────────────────────────────────────
  const load = async () => {
    try {
      const [allTrips, myExp] = await Promise.all([getTrips(), getMyExpenses()]);

      const userId = user?.id || user?._id;
      const driverTrips = (Array.isArray(allTrips) ? allTrips : []).filter((tItem) => {
        const driverId = typeof tItem.driver === 'object' ? tItem.driver?._id : tItem.driver;
        return driverId?.toString() === userId?.toString();
      });

      const normalizedExpenses = (Array.isArray(myExp) ? myExp : [])
        .map(normalizeExpense)
        .filter(Boolean);

      // Map of tripId → expense for quick lookup
      const expenseByTripId = {};
      for (const e of normalizedExpenses) {
        const tid = (e.trip?._id || e.trip)?.toString();
        if (tid) expenseByTripId[tid] = e;
      }

      // Eligible = active trips (always) + completed trips where post-trip edit is still available
      const eligible = sortTripsForExpenses(
        driverTrips.filter((tItem) => {
          if (tItem.status !== 'completed') return true;
          const exp = expenseByTripId[tItem._id?.toString()];
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
        if (prev && eligible.some((tItem) => tItem._id === prev)) return prev;
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
    setError('');
    setSuccess('');
    if (!selectedTripId) {
      setForm(EMPTY_COSTS);
      setReceiptPreview('');
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
        receiptImage: existing.receiptImage ?? '',
      });
      setReceiptPreview(existing.receiptImage ?? '');
    } else {
      setForm(EMPTY_COSTS);
      setReceiptPreview('');
    }
  }, [selectedTripId, expenses]);

  const selectedTrip = [...trips, ...eligibleTrips].find((tItem) => tItem._id === selectedTripId) || null;

  // Expense record for the currently selected trip (if any)
  const existingExpense = expenses.find(
    (e) => (e.trip?._id || e.trip)?.toString() === selectedTripId
  ) || null;

  const getTripDisplay = (expense) => {
    const tripId = expense.trip?._id || expense.trip;
    const trip = trips.find((tItem) => tItem._id === tripId);
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setReceiptPreview(reader.result);
      setForm((prev) => ({ ...prev, receiptImage: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveReceipt = () => {
    setReceiptPreview('');
    setForm((prev) => ({ ...prev, receiptImage: '' }));
  };

  const validateForm = () => {
    for (const key of COST_FIELDS) {
      const val = Number(form[key]);
      if (form[key] !== '' && (isNaN(val) || val < 0 || val > 1_000_000)) {
        return `${key.replace('Cost', ' cost')} ${t('expenses.rangeError')}`;
      }
    }
    if (form.notes && form.notes.length > 500) return t('expenses.notesLimit');
    return null;
  };

  // ── Submit: create or update the single expense record for this trip ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedTripId || !isValidMongoId(selectedTripId)) {
      setError(t('expenses.pleaseSelectTrip'));
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
      receiptImage: form.receiptImage || '',
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
            const next = prev.filter((tItem) => tItem._id !== selectedTripId);
            setSelectedTripId(next[0]?._id || '');
            return next;
          });
        }

        setSuccess(t('expenses.successUpdate'));
        alert(t('expenses.successUpdate') || 'Expense updated successfully!');
        setSelectedTripId('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // Create new record for this trip
        const created = await addExpense({ trip: selectedTripId, ...payload });
        const saved = normalizeExpense(created);
        setExpenses((prev) => [saved, ...prev].filter(Boolean));

        // If trip is completed, it's now submitted — remove from eligible list
        setEligibleTrips((prev) => {
          const trip = prev.find((tItem) => tItem._id === selectedTripId);
          if (trip?.status === 'completed') {
            const next = prev.filter((tItem) => tItem._id !== selectedTripId);
            setSelectedTripId(next[0]?._id || '');
            return next;
          }
          return prev;
        });

        setSuccess(t('expenses.successRecord'));
        alert(t('expenses.successRecord') || 'Expense recorded successfully!');
        setSelectedTripId('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      setError(err.message || 'Failed to save expense');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const expense = expenses.find((e) => e._id === id);
    if (expense) {
      const trip = trips.find((tItem) => tItem._id === (expense.trip?._id || expense.trip));
      if (trip && trip.status === 'completed') {
        setError(t('expenses.cannotDeleteCompleted'));
        return;
      }
    }
    if (!confirm(t('expenses.confirmDelete'))) return;
    setError('');
    try {
      await deleteExpense(id);
      setExpenses((prev) => prev.filter((e) => e._id !== id));
      // After deletion the trip becomes eligible again if it was completed
      await load();
      setSuccess(t('expenses.successDelete'));
    } catch (err) {
      setError(err.message || 'Failed to delete expense');
    }
  };

  const canEdit = (expense) => {
    const trip = trips.find((tItem) => tItem._id === (expense.trip?._id || expense.trip));
    if (expense.approvalStatus === 'approved') return false;
    if (!trip || trip.status !== 'completed') return true; // active trip — always editable
    return !expense.postTripEditUsed; // completed trip — only if post-trip edit not yet used
  };

  const canDelete = (expense) => {
    if (expense.approvalStatus === 'approved') return false;
    const trip = trips.find((tItem) => tItem._id === (expense.trip?._id || expense.trip));
    if (trip && trip.status === 'completed') return false; // Cannot delete expenses for completed trips
    return true;
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
      <div className="dash-section-label">{t('expenses.expenses')}</div>
      <h2 className="dash-title">{t('expenses.recordExpense')}</h2>

      {error && <ErrorMessage message={error} />}
      {success && <div className="dark-success">{success}</div>}

      {trips.length === 0 && (
        <p style={{ color: 'orange', marginBottom: '1rem' }}>{t('expenses.noTripsAssigned')}</p>
      )}
      {trips.length > 0 && eligibleTrips.length === 0 && (
        <p style={{ color: '#f59e0b', marginBottom: '1rem' }}>
          {t('expenses.allExpensesSubmitted')}
        </p>
      )}

      {eligibleTrips.length > 0 && (
        <div className="dark-card" style={{ maxWidth: '620px', marginBottom: '2rem' }}>

          {/* Trip selector */}
          <div className="dark-form-group" style={{ marginBottom: '1.25rem' }}>
            <label>{t('expenses.selectTrip')}</label>
            <select
              className="dark-input"
              value={selectedTripId}
              onChange={(e) => setSelectedTripId(e.target.value)}
            >
              <option value="">{t('expenses.selectTripPlaceholder')}</option>
              {eligibleTrips.map((tItem) => (
                <option key={tItem._id} value={tItem._id}>
                  {tItem._id.slice(-6)} — {tItem.order?.pickupLocation || 'N/A'} → {tItem.order?.destination || 'N/A'}
                  {' '}({tItem.status === 'completed' ? t('expenses.completedFinalEntry') : tItem.status})
                </option>
              ))}
            </select>
            {selectedTrip && (
              <div className="users-note" style={{ marginTop: '0.5rem' }}>
                {isEditMode
                  ? `${t('expenses.editingExistingExpense')} ${selectedTripId.slice(-6)}`
                  : `${t('expenses.newExpenseEntry')} ${selectedTripId.slice(-6)}`}
                {isApproved && (
                  <span style={{ color: '#10b981', marginLeft: '0.5rem' }}>{t('expenses.approvedReadOnly')}</span>
                )}
                {!isApproved && isTripCompleted && !postTripEditUsed && isEditMode && (
                  <span style={{ color: '#f59e0b', marginLeft: '0.5rem' }}>{t('expenses.oneEditRemaining')}</span>
                )}
                {!isApproved && isTripCompleted && postTripEditUsed && (
                  <span style={{ color: '#ef4444', marginLeft: '0.5rem' }}>{t('expenses.lockedPostTripUsed')}</span>
                )}
              </div>
            )}
          </div>



          {/* Cost fields */}
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {COST_FIELDS.map((f) => (
                <div className="dark-form-group" key={f}>
                  <label>{t(`expenses.costLabels.${f}`)}</label>
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
              <label>{t('expenses.notesLabel')}</label>
              <textarea
                className="dark-input"
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={3}
                placeholder={t('expenses.notesPlaceholder')}
                disabled={formReadOnly}
              />
            </div>

            <div className="dark-form-group">
              <label>{t('expenses.receiptImageLabel')}</label>
              <input
                key={selectedTripId}
                type="file"
                accept="image/*"
                className="dark-input"
                onChange={handleFileChange}
                disabled={formReadOnly}
              />
              {receiptPreview && (
                <div className="receipt-preview-container">
                  <div className="receipt-preview-img-wrapper">
                    <img
                      src={receiptPreview}
                      alt="Receipt Preview"
                      className="receipt-preview-img"
                    />
                    {!formReadOnly && (
                      <button
                        type="button"
                        onClick={handleRemoveReceipt}
                        className="receipt-remove-btn"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {!formReadOnly && (
              <button
                type="submit"
                className="approve-btn"
                disabled={submitting || !selectedTripId}
                style={{ width: '100%', marginTop: '0.5rem' }}
              >
                {submitting
                  ? t('expenses.saving')
                  : isEditMode
                    ? t('expenses.updateExpense')
                    : t('expenses.submitExpense')}
              </button>
            )}
          </form>
        </div>
      )}

      {/* Expense history table */}
      {expenses.length > 0 && (
        <>
          <div className="dash-section-label" style={{ marginBottom: '0.75rem' }}>
            {t('expenses.expenseHistory')}
          </div>
          <div className="dark-table-wrap">
            <table className="dark-table">
              <thead>
                <tr>
                  <th>{t('expenses.tripCol')}</th>
                  <th>{t('expenses.fuelCol')}</th>
                  <th>{t('expenses.tollCol')}</th>
                  <th>{t('expenses.foodCol')}</th>
                  <th>{t('expenses.maintenanceCol')}</th>
                  <th>{t('expenses.totalCol')}</th>
                  <th>{t('expenses.statusCol')}</th>
                  <th>{t('expenses.dateCol')}</th>
                  <th>{t('admin.expenses.colReceipt') || 'RECEIPT'}</th>
                  <th>{t('expenses.actionsCol')}</th>
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
                      {e.receiptImage ? (
                        <button
                          type="button"
                          className="approve-btn"
                          style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem', background: 'var(--surface2)', border: '1px solid var(--border)' }}
                          onClick={() => setActiveReceiptUrl(e.receiptImage)}
                        >
                          {t('expenses.viewReceipt') || 'View'}
                        </button>
                      ) : (
                        <span style={{ color: 'var(--dim)', fontSize: '0.8rem' }}>{t('expenses.noReceipt') || '—'}</span>
                      )}
                    </td>
                    <td>
                      {canEdit(e) || canDelete(e) ? (
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'nowrap' }}>
                          {canEdit(e) && (
                            <button
                              className="approve-btn"
                              style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem', background: '#3b82f6', whiteSpace: 'nowrap' }}
                              onClick={() => {
                                const tripId = (e.trip?._id || e.trip)?.toString();
                                setSelectedTripId(tripId);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                            >
                              {t('expenses.editBtn')}
                            </button>
                          )}
                          {canDelete(e) && (
                            <button
                              className="reject-btn"
                              style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                              onClick={() => handleDelete(e._id)}
                            >
                              {t('expenses.deleteBtn')}
                            </button>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: '#64748b', fontSize: '0.8rem' }}>{t('expenses.readOnly')}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Full-screen Receipt Modal Viewer */}
      {activeReceiptUrl && (
        <div className="receipt-modal-overlay" onClick={() => setActiveReceiptUrl(null)}>
          <div className="receipt-modal-content" onClick={(e) => e.stopPropagation()}>
            <img
              src={activeReceiptUrl}
              alt="Fuel Expense Receipt"
              className="receipt-modal-img"
            />
            <button
              type="button"
              className="receipt-modal-close-btn"
              onClick={() => setActiveReceiptUrl(null)}
            >
              {t('common.close') || 'Close'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseForm;
