import { useEffect, useState } from 'react';
import { addExpense, getMyExpenses, getTrips } from '../services/api';
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

const ExpenseForm = () => {
  const { user } = useAuth();

  const [trips, setTrips] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({
    trip: '',
    fuelCost: '',
    tollCost: '',
    foodCost: '',
    maintenanceCost: '',
    notes: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [allTrips, myExp] = await Promise.all([
          getTrips(),
          getMyExpenses()
        ]);

        const userId = user?.id || user?._id;
        const filteredTrips = (Array.isArray(allTrips) ? allTrips : [])
          .filter((t) => {
            const driverId = typeof t.driver === 'object' ? t.driver?._id : t.driver;
            return driverId?.toString() === userId?.toString();
          });

        const sortedTrips = sortTripsForExpenses(filteredTrips);
        setTrips(sortedTrips);
        setExpenses((Array.isArray(myExp) ? myExp : []).map(normalizeExpense).filter(Boolean));

        if (sortedTrips.length > 0) {
          setForm((prev) => (prev.trip ? prev : { ...prev, trip: sortedTrips[0]._id }));
        }

      } catch (err) {
        setError(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      load();
    } else {
      setLoading(false);
    }

  }, [user?.id, user?._id]);

  const selectedTrip = trips.find((trip) => trip._id === form.trip) || null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setSuccess('');
    setSubmitting(true);

    if (!form.trip) {
      setError("Please select a trip");
      setSubmitting(false);
      return;
    }

    if (!isValidMongoId(form.trip)) {
      setError('Invalid trip id');
      setSubmitting(false);
      return;
    }

    try {
      const newExp = await addExpense({
        trip: form.trip,
        fuelCost: Number(form.fuelCost) || 0,
        tollCost: Number(form.tollCost) || 0,
        foodCost: Number(form.foodCost) || 0,
        maintenanceCost: Number(form.maintenanceCost) || 0,
        notes: form.notes,
      });

      setExpenses((prev) => [normalizeExpense(newExp), ...prev].filter(Boolean));

      setSuccess('Expense recorded successfully!');

      setForm({
        trip: '',
        fuelCost: '',
        tollCost: '',
        foodCost: '',
        maintenanceCost: '',
        notes: ''
      });

    } catch (err) {
      setError(err.message || "Failed to add expense");
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ Spinner FIXED
  if (loading) return <LoadingSpinner />;

  return (
    <div className="dash-page">
      <div className="dash-section-label">EXPENSES</div>
      <h2 className="dash-title">Record Expense</h2>

      {error && <ErrorMessage message={error} />}
      {success && <div className="dark-success">{success}</div>}

      {trips.length === 0 && (
        <p style={{ color: 'orange', marginBottom: '1rem' }}>
          No trips assigned to you yet
        </p>
      )}

      <div className="dark-card" style={{ maxWidth: '600px', marginBottom: '2rem' }}>
        <form onSubmit={handleSubmit}>
          
          <div className="dark-form-group">
            <label>Select Trip</label>
            <select
              className="dark-input"
              name="trip"
              value={form.trip}
              onChange={handleChange}
              required
            >
              <option value="">-- Select a trip --</option>

              {trips.map((t) => (
                <option key={t._id} value={t._id}>
                  {t._id.slice(-6)} — {t.order?.pickupLocation || 'N/A'} → {t.order?.destination || 'N/A'} ({t.status})
                </option>
              ))}
            </select>
            {selectedTrip && (
              <div className="users-note" style={{ marginTop: '0.75rem' }}>
                Selected trip: <strong>{selectedTrip._id.slice(-6)}</strong> | {selectedTrip.order?.pickupLocation || 'N/A'} → {selectedTrip.order?.destination || 'N/A'} | {selectedTrip.status}
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {['fuelCost', 'tollCost', 'foodCost', 'maintenanceCost'].map((f) => (
              <div className="dark-form-group" key={f}>
                <label>
                  {f.replace('Cost', '').replace(/([A-Z])/g, ' $1').trim()} Cost (₹)
                </label>
                <input
                  className="dark-input"
                  name={f}
                  type="number"
                  min="0"
                  value={form[f]}
                  onChange={handleChange}
                  placeholder="0"
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
            />
          </div>

          <button
            type="submit"
            className="approve-btn"
            disabled={submitting}
            style={{ width: '100%' }}
          >
            {submitting ? 'Saving...' : 'Submit Expense'}
          </button>
        </form>
      </div>

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
                  <th>DATE</th>
                </tr>
              </thead>

              <tbody>
                {expenses.map((e) => (
                  <tr key={e._id}>
                    <td>
                      <code style={{ color: '#06b6d4' }}>
                        {(e.trip?._id || e.trip || '').slice(-6)}
                      </code>
                    </td>
                    <td>₹{e.fuelCost}</td>
                    <td>₹{e.tollCost}</td>
                    <td>₹{e.foodCost}</td>
                    <td>₹{e.maintenanceCost}</td>
                    <td style={{ color: '#06b6d4' }}>₹{e.totalExpense}</td>
                    <td>{e.createdAt ? formatDate(e.createdAt) : '—'}</td>
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
