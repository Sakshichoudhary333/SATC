import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { getTrips, updateTripStatus, getTrucks, updateTruckLocation } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { formatDate } from '../utils/helpers';

const SOCKET_URL = 'http://localhost:5001';
const STATUS_COLOR = { started: '#3b82f6', 'in-transit': '#8b5cf6', completed: '#10b981' };
const AUTO_COMPLETE_DISTANCE_KM = 0.5;
const getNextTripStatus = (status) => {
  if (status === 'started') return 'in-transit';
  if (status === 'in-transit') return 'completed';
  return null;
};

const geocodeAddress = async (address) => {
  if (!address) return null;

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`
    );
    const data = await res.json();
    const first = data?.[0];

    if (!first) return null;

    return {
      lat: Number.parseFloat(first.lat),
      lng: Number.parseFloat(first.lon),
    };
  } catch {
    return null;
  }
};

const getDistanceKm = (from, to) => {
  if (!from || !to) return null;

  const toRad = (value) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);
  const lat1 = toRad(from.lat);
  const lat2 = toRad(to.lat);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return 2 * earthRadiusKm * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const DriverDashboard = () => {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [myTruck, setMyTruck] = useState(null);
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [selectedTripId, setSelectedTripId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState('');
  const [autoSharing, setAutoSharing] = useState(false);
  const [lastSharedAt, setLastSharedAt] = useState('');
  const socketRef = useRef(null);
  const watchRef = useRef(null);
  const autoCompleteTripRef = useRef('');

  useEffect(() => {
    const load = async () => {
      try {
        const [allTrips, trucks] = await Promise.all([getTrips(), getTrucks()]);
        const driverTrips = allTrips.filter((t) => t.driver?._id === user?.id || t.driver === user?.id);
        const assignedTruck = trucks.find((t) => t.driver?._id === user?.id || t.driver === user?.id);

        setTrips(driverTrips);
        setMyTruck(assignedTruck);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user?.id]);

  useEffect(() => {
    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    const handleLocation = ({ truckId, lat, lng, lastUpdated }) => {
      if (!truckId || !myTruck || truckId !== myTruck._id) return;

      setMyTruck((prev) =>
        prev
          ? {
              ...prev,
              location: { lat, lng },
              lastUpdated: lastUpdated || new Date().toISOString(),
            }
          : prev
      );
    };

    const handleTripStatus = ({ tripId, status }) => {
      setTrips((prev) => prev.map((trip) => (trip._id === tripId ? { ...trip, status } : trip)));
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
  }, [myTruck]);

  const activeTrip = useMemo(
    () => trips.find((trip) => trip.status !== 'completed') || trips[0] || null,
    [trips]
  );

  const selectedTrip = useMemo(
    () => trips.find((trip) => trip._id === selectedTripId) || activeTrip || null,
    [trips, selectedTripId, activeTrip]
  );

  useEffect(() => {
    if (!trips.length) {
      setSelectedTripId('');
      return;
    }

    if (!selectedTripId || !trips.some((trip) => trip._id === selectedTripId)) {
      setSelectedTripId(activeTrip?._id || trips[0]._id);
    }
  }, [trips, activeTrip, selectedTripId]);

  useEffect(() => {
    autoCompleteTripRef.current = '';

    let active = true;

    if (!activeTrip?.order?.destination) {
      setDestinationCoords(null);
      return undefined;
    }

    geocodeAddress(activeTrip.order.destination).then((coords) => {
      if (!active) return;

      if (!coords || !Number.isFinite(coords.lat) || !Number.isFinite(coords.lng)) {
        setDestinationCoords(null);
        return;
      }

      setDestinationCoords(coords);
    });

    return () => {
      active = false;
    };
  }, [activeTrip?._id, activeTrip?.order?.destination]);

  useEffect(() => {
    if (!autoSharing || !myTruck) {
      return undefined;
    }

    if (!navigator.geolocation) {
      setError('Your browser does not support live GPS sharing.');
      setAutoSharing(false);
      return undefined;
    }

    watchRef.current = navigator.geolocation.watchPosition(
      async ({ coords }) => {
        const { latitude: lat, longitude: lng } = coords;
        try {
          await updateTruckLocation(myTruck._id, { lat, lng });
          socketRef.current?.emit('updateLocation', { truckId: myTruck._id, lat, lng });
          setLastSharedAt(new Date().toLocaleString());
          await maybeAutoCompleteTrip(lat, lng);
        } catch (err) {
          setError(err.message);
        }
      },
      () => {
        setError('Location access denied or unavailable.');
        setAutoSharing(false);
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );

    return () => {
      if (watchRef.current != null) {
        navigator.geolocation.clearWatch(watchRef.current);
        watchRef.current = null;
      }
    };
  }, [autoSharing, myTruck, activeTrip?._id, activeTrip?.status, destinationCoords?.lat, destinationCoords?.lng]);

  useEffect(() => () => {
    if (watchRef.current != null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchRef.current);
    }
  }, []);

  const handleStatus = async (tripId, status) => {
    setUpdating(tripId);
    try {
      const updated = await updateTripStatus(tripId, status);
      setTrips((prev) => prev.map((trip) => (trip._id === tripId ? { ...trip, status: updated.status } : trip)));
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating('');
    }
  };

  const maybeAutoCompleteTrip = async (lat, lng) => {
    if (
      !activeTrip ||
      activeTrip.status !== 'in-transit' ||
      !destinationCoords ||
      !Number.isFinite(destinationCoords.lat) ||
      !Number.isFinite(destinationCoords.lng) ||
      autoCompleteTripRef.current === activeTrip._id
    ) {
      return;
    }

    const distanceKm = getDistanceKm({ lat, lng }, destinationCoords);

    if (distanceKm !== null && distanceKm <= AUTO_COMPLETE_DISTANCE_KM) {
      autoCompleteTripRef.current = activeTrip._id;
      await handleStatus(activeTrip._id, 'completed');
    }
  };

  const handleStartTrip = async (tripId, currentStatus) => {
    const nextStatus = getNextTripStatus(currentStatus);
    if (!nextStatus) return;
    await handleStatus(tripId, nextStatus);
  };

  const handleCompleteTrip = async (tripId, currentStatus) => {
    if (currentStatus !== 'in-transit') return;
    await handleStatus(tripId, 'completed');
  };

  const toggleAutoSharing = () => {
    if (!myTruck) {
      setError('No truck assigned to you.');
      return;
    }

    setError('');
    setAutoSharing((prev) => !prev);
  };

  const shareLocationOnce = () => {
    if (!myTruck) {
      setError('No truck assigned to you.');
      return;
    }

    if (!navigator.geolocation) {
      setError('Your browser does not support GPS sharing.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const { latitude: lat, longitude: lng } = coords;
        try {
          await updateTruckLocation(myTruck._id, { lat, lng });
          socketRef.current?.emit('updateLocation', { truckId: myTruck._id, lat, lng });
          setLastSharedAt(new Date().toLocaleString());
          await maybeAutoCompleteTrip(lat, lng);
        } catch (err) {
          setError(err.message);
        }
      },
      () => setError('Location access denied.')
    );
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="dash-page">
      <div className="dash-section-label">DRIVER DASHBOARD</div>
      <div className="dash-title-row">
        <h2 className="dash-title">Assigned Trip Control</h2>
        <div className="driver-actions">
          <button type="button" className="approve-btn" onClick={shareLocationOnce}>📍 Share Location</button>
          <button
            type="button"
            className="approve-btn"
            onClick={toggleAutoSharing}
            style={{ background: autoSharing ? '#10b981' : '#8b5cf6' }}
          >
            {autoSharing ? 'Auto GPS On' : 'Start Auto GPS'}
          </button>
          <Link to="/expenses" className="approve-btn" style={{ background: '#f59e0b' }}>
            💰 Record Expense
          </Link>
        </div>
      </div>
      {error && <ErrorMessage message={error} />}

      <div className="driver-hero-grid">
        <div className="dark-card driver-hero-card">
          <div className="dark-card-label">ASSIGNED TRUCK</div>
          <div className="driver-hero-title">
            {myTruck ? myTruck.truckNumber : 'No truck assigned yet'}
          </div>
          <div className="driver-hero-sub">
            {myTruck?.model || 'Truck details will appear here once an assignment is available.'}
          </div>

          <div className="customer-tracker-meta" style={{ marginTop: '1rem' }}>
            <div className="customer-tracker-kv">
              <span className="customer-tracker-label">Capacity</span>
              <span className="customer-tracker-value">{myTruck?.capacity || '—'}</span>
            </div>
            <div className="customer-tracker-kv">
              <span className="customer-tracker-label">Status</span>
              <span className="customer-tracker-value">{myTruck?.status || 'available'}</span>
            </div>
            <div className="customer-tracker-kv">
              <span className="customer-tracker-label">Last GPS</span>
              <span className="customer-tracker-value">
                {myTruck?.lastUpdated ? new Date(myTruck.lastUpdated).toLocaleString() : 'Waiting for update'}
              </span>
            </div>
            <div className="customer-tracker-kv">
              <span className="customer-tracker-label">Shared At</span>
              <span className="customer-tracker-value">{lastSharedAt || 'Not shared yet'}</span>
            </div>
          </div>

          <div className="customer-tracker-actions">
            <Link to="/track" className="approve-btn" style={{ background: '#06b6d4' }}>
              Open Live Track
            </Link>
            <Link to="/expenses" className="approve-btn" style={{ background: 'transparent', border: '1px solid #334155' }}>
              Expense Log
            </Link>
          </div>
        </div>

        <div className="dark-card driver-hero-card">
          <div className="dark-card-label">ACTIVE TRIP</div>
          {selectedTrip ? (
            <>
              <div className="dark-form-group" style={{ marginBottom: '1rem' }}>
                <label>Select Trip</label>
                <select
                  className="dark-input"
                  value={selectedTrip._id}
                  onChange={(e) => setSelectedTripId(e.target.value)}
                >
                  {trips.map((trip) => (
                    <option key={trip._id} value={trip._id}>
                      {trip._id.slice(-6)} | {trip.status}
                    </option>
                  ))}
                </select>
              </div>
              <div className="driver-hero-title">
                Trip #{selectedTrip._id.slice(-6)}
              </div>
              <div className="driver-hero-sub">
                {selectedTrip.order?.pickupLocation || '—'} → {selectedTrip.order?.destination || '—'}
              </div>

              <div className="customer-tracker-meta" style={{ marginTop: '1rem' }}>
                <div className="customer-tracker-kv">
                  <span className="customer-tracker-label">Trip Status</span>
                  <span className="status-badge" style={{ background: `${STATUS_COLOR[selectedTrip.status] || '#94a3b8'}22`, color: STATUS_COLOR[selectedTrip.status] || '#94a3b8', width: 'fit-content' }}>
                    {selectedTrip.status}
                  </span>
                </div>
                <div className="customer-tracker-kv">
                  <span className="customer-tracker-label">Created</span>
                  <span className="customer-tracker-value">{formatDate(selectedTrip.createdAt)}</span>
                </div>
                <div className="customer-tracker-kv">
                  <span className="customer-tracker-label">Driver</span>
                  <span className="customer-tracker-value">{selectedTrip.driver?.name || user?.name || 'You'}</span>
                </div>
                <div className="customer-tracker-kv">
                  <span className="customer-tracker-label">Truck</span>
                  <span className="customer-tracker-value">{selectedTrip.truck?.truckNumber || myTruck?.truckNumber || '—'}</span>
                </div>
              </div>

              <div className="customer-tracker-actions" style={{ marginBottom: 0 }}>
                {selectedTrip.status === 'started' && (
                  <button
                    type="button"
                    className="approve-btn"
                    style={{ background: '#3b82f6', fontSize: '0.75rem', padding: '4px 10px' }}
                    disabled={updating === selectedTrip._id}
                    onClick={() => handleStartTrip(selectedTrip._id, selectedTrip.status)}
                  >
                    Start Trip
                  </button>
                )}
                {selectedTrip.status === 'in-transit' && (
                  <button
                    type="button"
                    className="approve-btn"
                    style={{ background: '#10b981', fontSize: '0.75rem', padding: '4px 10px' }}
                    disabled={updating === selectedTrip._id}
                    onClick={() => handleCompleteTrip(selectedTrip._id, selectedTrip.status)}
                  >
                    Complete Trip
                  </button>
                )}
                {selectedTrip.status === 'completed' && (
                  <button
                    type="button"
                    className="approve-btn"
                    style={{ background: STATUS_COLOR.completed, fontSize: '0.75rem', padding: '4px 10px' }}
                    disabled
                  >
                    Trip Completed
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="customer-tracker-empty">
              <p>No trips assigned yet.</p>
              <span>Once a trip is allocated, you can update its status, share GPS, and record expenses here.</span>
            </div>
          )}
        </div>
      </div>

      <div className="dash-section-label" style={{ marginBottom: '0.75rem' }}>TRIP LOG</div>
      {trips.length === 0 ? (
        <p style={{ color: '#64748b' }}>No trips assigned to you yet.</p>
      ) : (
        <div className="dark-table-wrap">
          <table className="dark-table">
            <thead>
              <tr>
                <th>TRIP ID</th>
                <th>PICKUP</th>
                <th>DROP</th>
                <th>STATUS</th>
                <th>DATE</th>
              </tr>
            </thead>
            <tbody>
              {trips.map((trip) => (
                <tr key={trip._id}>
                  <td><code style={{ color: '#06b6d4' }}>{trip._id.slice(-6)}</code></td>
                  <td>{trip.order?.pickupLocation || '—'}</td>
                  <td>{trip.order?.destination || '—'}</td>
                  <td>
                    <span className="status-badge" style={{ background: `${STATUS_COLOR[trip.status] || '#94a3b8'}22`, color: STATUS_COLOR[trip.status] || '#94a3b8' }}>
                      {trip.status}
                    </span>
                  </td>
                  <td>{formatDate(trip.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DriverDashboard;
