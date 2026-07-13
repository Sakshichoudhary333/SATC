import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { getTrips, updateTripStatus, getTrucks, updateTruckLocation } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { formatDate } from '../utils/helpers';


const SOCKET_URL = 'https://satc-backend.onrender.com';
const STATUS_COLOR = { started: '#3b82f6', 'in-transit': '#8b5cf6', completed: '#10b981' };
const AUTO_COMPLETE_DISTANCE_KM = 0.5;

const CopyButton = ({ truckId }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(`${window.location.origin}/track/truck/${truckId}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };
  return (
    <button
      type="button"
      onClick={copy}
      style={{
        background: copied ? '#10b981' : '#06b6d4',
        color: '#0f1117',
        border: 'none',
        borderRadius: '6px',
        padding: '0.35rem 0.7rem',
        fontWeight: 700,
        fontSize: '0.75rem',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
      }}
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
};
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
    () => trips.find((trip) => trip.status !== 'completed') || null,
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
      // Only auto-select a non-completed trip; never fall back to a completed one
      setSelectedTripId(activeTrip?._id || '');
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

  const [sharing, setSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  const shareLocationOnce = async () => {
    if (!myTruck) {
      setError('No truck assigned to you.');
      return;
    }

    if (!navigator.geolocation) {
      setError('Your browser does not support GPS. Please use Chrome or Safari on a mobile device.');
      return;
    }

    setError('');
    setSharing(true);

    const getPosition = () =>
      new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        })
      );

    try {
      const position = await getPosition();
      const { latitude: lat, longitude: lng } = position.coords;

      await updateTruckLocation(myTruck._id, { lat, lng });

      // Update truck state so the "Last GPS" field refreshes immediately
      setMyTruck((prev) =>
        prev ? { ...prev, location: { lat, lng }, lastUpdated: new Date().toISOString() } : prev
      );

      socketRef.current?.emit('updateLocation', {
        truckId: myTruck._id,
        lat,
        lng,
        lastUpdated: new Date().toISOString(),
      });

      setLastSharedAt(new Date().toLocaleString());
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 8000);

      // Check auto-complete only if trip is in-transit and destination is known
      if (
        activeTrip?.status === 'in-transit' &&
        destinationCoords &&
        Number.isFinite(destinationCoords.lat) &&
        Number.isFinite(destinationCoords.lng) &&
        autoCompleteTripRef.current !== activeTrip._id
      ) {
        const distanceKm = getDistanceKm({ lat, lng }, destinationCoords);
        if (distanceKm !== null && distanceKm <= AUTO_COMPLETE_DISTANCE_KM) {
          autoCompleteTripRef.current = activeTrip._id;
          await handleStatus(activeTrip._id, 'completed');
        }
      }
    } catch (err) {
      if (err?.code === 1) {
        setError('Location permission denied. Please allow location access in your browser settings.');
      } else if (err?.code === 2) {
        setError('Location unavailable. Make sure GPS is enabled on your device.');
      } else if (err?.code === 3) {
        setError('Location request timed out. Please try again.');
      } else {
        setError(err?.message || 'Failed to share location.');
      }
    } finally {
      setSharing(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  // Non-completed trips available for selection
  const selectableTrips = trips.filter((t) => t.status !== 'completed');

  return (
    <div className="dash-page">
      <div className="dash-section-label">DRIVER DASHBOARD</div>
      <div className="dash-title-row">
        <h2 className="dash-title">Assigned Trip Control</h2>
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

          {/* GPS sharing + shareable link — only when truck is assigned */}
          {myTruck && (
            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>

              {/* Auto GPS toggle */}
              <button
                type="button"
                className="approve-btn"
                style={{ width: '100%', background: autoSharing ? '#10b981' : '#8b5cf6' }}
                onClick={toggleAutoSharing}
              >
                {autoSharing ? '� Live GPS On — Tap to Stop' : '� Start Live GPS (auto-updates while driving)'}
              </button>
              <div style={{ fontSize: '0.7rem', color: autoSharing ? '#10b981' : '#64748b', textAlign: 'center', marginTop: '-0.2rem' }}>
                {autoSharing
                  ? 'Continuously updating your position — keep this page open'
                  : 'Keeps updating every few seconds while you drive'}
              </div>

              {lastSharedAt && (
                <div style={{ fontSize: '0.72rem', color: '#64748b', textAlign: 'center' }}>
                  Last shared: {lastSharedAt}
                </div>
              )}

              {/* Divider */}
              <div style={{ borderTop: '1px solid #1e2330', paddingTop: '0.6rem' }}>
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '0.4rem', letterSpacing: '0.08em' }}>
                  SHAREABLE LINK — admin &amp; customer can open this
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    readOnly
                    value={`${window.location.origin}/track/truck/${myTruck._id}`}
                    style={{
                      flex: 1,
                      background: '#1e2330',
                      border: '1px solid #334155',
                      borderRadius: '6px',
                      padding: '0.35rem 0.6rem',
                      color: '#94a3b8',
                      fontSize: '0.75rem',
                    }}
                    onClick={(e) => e.target.select()}
                  />
                  <CopyButton truckId={myTruck._id} />
                </div>

                {/* WhatsApp + Copy share row */}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`Track my live location here: ${window.location.origin}/track/truck/${myTruck._id}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      background: '#25D366',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '0.4rem 0.6rem',
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      textDecoration: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    Share on WhatsApp
                  </a>
                </div>

                <div style={{ color: '#475569', fontSize: '0.7rem', marginTop: '0.3rem' }}>
                  No login needed to view.
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="dark-card driver-hero-card">
          <div className="dark-card-label">ACTIVE TRIP</div>
          {selectedTrip ? (
            <>
              {selectableTrips.length > 1 && (
                <div className="dark-form-group" style={{ marginBottom: '1rem' }}>
                  <label>Select Trip</label>
                  <select
                    className="dark-input"
                    value={selectedTrip._id}
                    onChange={(e) => setSelectedTripId(e.target.value)}
                  >
                    {selectableTrips.map((trip) => (
                      <option key={trip._id} value={trip._id}>
                        {trip._id.slice(-6)} | {trip.status}
                      </option>
                    ))}
                  </select>
                </div>
              )}
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
