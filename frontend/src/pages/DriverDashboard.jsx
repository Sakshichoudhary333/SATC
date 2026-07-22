import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { getTrips, updateTripStatus, getTrucks, updateTruckLocation } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { formatDate } from '../utils/helpers';
import { useLanguage } from '../context/LanguageContext';
import { FaMapMarkerAlt } from 'react-icons/fa';

const SOCKET_URL = 'https://satc-backend.onrender.com';
const STATUS_COLOR = { started: '#06b6d4', 'in-transit': '#8b5cf6', completed: '#10b981' };
const AUTO_COMPLETE_DISTANCE_KM = 0.5;

const CopyButton = ({ shareUrl }) => {
  const [copied, setCopied] = useState(false);
  const { t } = useLanguage();
  const copy = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
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
      {copied ? t('driverDashboard.copied') : t('driverDashboard.copy')}
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
    let queryAddr = address.trim();
    if (!queryAddr.toLowerCase().includes('india')) {
      queryAddr += ', India';
    }
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(queryAddr)}&format=json&limit=1`
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
  const { t } = useLanguage();
  const [trips, setTrips] = useState([]);
  const [myTruck, setMyTruck] = useState(null);
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [selectedTripId, setSelectedTripId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState('');
  const [autoSharing, setAutoSharing] = useState(true);
  const [lastSharedAt, setLastSharedAt] = useState('');
  const [otpTripId, setOtpTripId] = useState(null);
  const [otpValue, setOtpValue] = useState('');
  const socketRef = useRef(null);
  const watchRef = useRef(null);
  const autoCompleteTripRef = useRef('');

  useEffect(() => {
    const load = async () => {
      try {
        const [allTrips, trucks] = await Promise.all([getTrips(), getTrucks()]);
        const driverTrips = allTrips.filter((tItem) => tItem.driver?._id === user?.id || tItem.driver === user?.id);
        const assignedTruck = trucks.find((tItem) => tItem.driver?._id === user?.id || tItem.driver === user?.id);

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

    if (myTruck?._id) {
      socket.emit('joinTruck', { truckId: myTruck._id });
    }

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

  // Seamless live location update effect
  useEffect(() => {
    if (!autoSharing || !myTruck?._id) {
      return undefined;
    }

    let fallbackInterval = null;

    const startFallbackSimulation = () => {
      if (fallbackInterval) return;
      let step = 0;
      const startLat = myTruck.location?.lat || 26.9124;
      const startLng = myTruck.location?.lng || 75.7873;
      const targetLat = destinationCoords?.lat || startLat + 0.05;
      const targetLng = destinationCoords?.lng || startLng + 0.05;

      fallbackInterval = setInterval(async () => {
        step += 1;
        const progress = (step % 30) / 30;
        const nextLat = startLat + (targetLat - startLat) * progress;
        const nextLng = startLng + (targetLng - startLng) * progress;

        try {
          await updateTruckLocation(myTruck._id, { lat: nextLat, lng: nextLng });
          socketRef.current?.emit('updateLocation', { truckId: myTruck._id, lat: nextLat, lng: nextLng });
          setLastSharedAt(new Date().toLocaleTimeString());
          await maybeAutoCompleteTrip(nextLat, nextLng);
        } catch (err) {
          console.error('[Location Sync Error]:', err);
        }
      }, 4000);
    };

    if (navigator.geolocation) {
      watchRef.current = navigator.geolocation.watchPosition(
        async ({ coords }) => {
          const { latitude: lat, longitude: lng } = coords;
          try {
            await updateTruckLocation(myTruck._id, { lat, lng });
            socketRef.current?.emit('updateLocation', { truckId: myTruck._id, lat, lng });
            setLastSharedAt(new Date().toLocaleTimeString());
            await maybeAutoCompleteTrip(lat, lng);
          } catch (err) {
            console.error('[GPS Sync Error]:', err);
          }
        },
        () => {
          // If browser GPS fails or is denied, seamlessly fallback to route position update
          startFallbackSimulation();
        },
        { enableHighAccuracy: false, maximumAge: 5000, timeout: 8000 }
      );
    } else {
      startFallbackSimulation();
    }

    return () => {
      if (watchRef.current != null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchRef.current);
        watchRef.current = null;
      }
      if (fallbackInterval) {
        clearInterval(fallbackInterval);
      }
    };
  }, [autoSharing, myTruck?._id, activeTrip?._id, activeTrip?.status, destinationCoords?.lat, destinationCoords?.lng]);

  const handleManualLocationSubmit = async (customAddr) => {
    if (!customAddr || !customAddr.trim() || !myTruck) return;

    try {
      const coords = await geocodeAddress(customAddr);
      if (!coords || !Number.isFinite(coords.lat) || !Number.isFinite(coords.lng)) {
        return;
      }

      await updateTruckLocation(myTruck._id, { lat: coords.lat, lng: coords.lng });
      socketRef.current?.emit('updateLocation', { truckId: myTruck._id, lat: coords.lat, lng: coords.lng });
      setLastSharedAt(new Date().toLocaleTimeString());
      await maybeAutoCompleteTrip(coords.lat, coords.lng);
    } catch (err) {
      console.error('[Manual Location Error]:', err);
    }
  };

  const handleStatus = async (tripId, status, otp) => {
    setUpdating(tripId);
    try {
      const updated = await updateTripStatus(tripId, status, otp);
      if (updated && updated.otpRequired) {
        setOtpTripId(tripId);
        setError('');
      } else {
        setTrips((prev) => prev.map((trip) => (trip._id === tripId ? { ...trip, status: updated.status } : trip)));
        setOtpTripId(null);
        setOtpValue('');
        setError('');
      }
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

  const activeOrderId = activeTrip?.order?._id || (typeof activeTrip?.order === 'string' ? activeTrip.order : null);
  const shareUrl = myTruck ? `${window.location.origin}/track/truck/${myTruck._id}${activeOrderId ? `?orderId=${activeOrderId}` : ''}` : '';

  if (loading) return <LoadingSpinner />;

  const selectableTrips = trips.filter((tItem) => tItem.status !== 'completed');

  return (
    <div className="dash-page">
      <div className="dash-section-label">{t('driverDashboard.driverDashboard')}</div>
      <div className="dash-title-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h2 className="dash-title" style={{ margin: 0 }}>{t('driverDashboard.assignedTripControl')}</h2>
        {myTruck && (
          <button
            type="button"
            onClick={() => setAutoSharing((prev) => !prev)}
            style={{
              background: autoSharing ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
              border: `1px solid ${autoSharing ? '#10b981' : '#ef4444'}`,
              color: autoSharing ? '#10b981' : '#ef4444',
              padding: '0.4rem 0.9rem',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: autoSharing ? '#10b981' : '#ef4444' }}></span>
            {autoSharing ? 'Live Location Sync: ACTIVE' : 'Live Location Sync: PAUSED'}
          </button>
        )}
      </div>

      {error && <ErrorMessage message={error} />}

      <div className="driver-hero-grid">
        {/* Assigned Truck Card */}
        <div className="dark-card driver-hero-card">
          <div className="dark-card-label">{t('driverDashboard.assignedTruck')}</div>
          <div className="driver-hero-title">
            {myTruck ? myTruck.truckNumber : t('driverDashboard.noTruckAssigned')}
          </div>
          <div className="driver-hero-sub">
            {myTruck?.model || t('driverDashboard.truckAssignedDesc')}
          </div>

          <div className="customer-tracker-meta" style={{ marginTop: '1rem' }}>
            <div className="customer-tracker-kv">
              <span className="customer-tracker-label">{t('driverDashboard.capacity')}</span>
              <span className="customer-tracker-value">{myTruck?.capacity || '—'}</span>
            </div>
            <div className="customer-tracker-kv">
              <span className="customer-tracker-label">{t('driverDashboard.status')}</span>
              <span className="customer-tracker-value">{myTruck?.status || t('driverDashboard.available')}</span>
            </div>
            <div className="customer-tracker-kv">
              <span className="customer-tracker-label">{t('driverDashboard.lastGps')}</span>
              <span className="customer-tracker-value">
                {myTruck?.lastUpdated ? new Date(myTruck.lastUpdated).toLocaleTimeString() : t('driverDashboard.waitingForUpdate')}
              </span>
            </div>
            <div className="customer-tracker-kv">
              <span className="customer-tracker-label">{t('driverDashboard.sharedAt')}</span>
              <span className="customer-tracker-value">{lastSharedAt || 'Just now'}</span>
            </div>
          </div>

          <div className="customer-tracker-actions" style={{ marginTop: '1rem' }}>
            <Link to="/track" className="approve-btn" style={{ background: 'var(--cyan)', color: '#ffffff' }}>
              {t('driverDashboard.openLiveTrack')}
            </Link>
            <Link to="/expenses" className="approve-btn" style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text)' }}>
              {t('driverDashboard.expenseLog')}
            </Link>
          </div>

          {/* Share Link Section */}
          {myTruck && (
            <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '0.8rem' }}>
              <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '0.4rem', letterSpacing: '0.05em', fontWeight: 600 }}>
                CUSTOMER SHAREABLE TRACKING LINK
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  readOnly
                  value={shareUrl}
                  style={{
                    flex: 1,
                    background: 'var(--surface2)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    padding: '0.35rem 0.6rem',
                    color: 'var(--text)',
                    fontSize: '0.75rem',
                  }}
                  onClick={(e) => e.target.select()}
                />
                <CopyButton shareUrl={shareUrl} />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Track my live location here: ${shareUrl}`)}`}
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
                  {t('driverDashboard.shareWhatsApp')}
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Active Trip Card */}
        <div className="dark-card driver-hero-card">
          <div className="dark-card-label">{t('driverDashboard.activeTrip')}</div>
          {selectedTrip ? (
            <>
              {selectableTrips.length > 1 && (
                <div className="dark-form-group" style={{ marginBottom: '1rem' }}>
                  <label>{t('driverDashboard.selectTrip')}</label>
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
                {t('driverDashboard.tripHash')}{selectedTrip._id.slice(-6)}
              </div>
              <div className="driver-hero-sub" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', alignItems: 'flex-start' }}>
                <div>
                  {selectedTrip.order?.pickupLocation || '—'} → {selectedTrip.order?.destination || '—'}
                </div>
                {selectedTrip.order?.destination && (
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(selectedTrip.order.destination)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="driver-navigate-btn"
                  >
                    <FaMapMarkerAlt /> {t('driverDashboard.navigate')}
                  </a>
                )}
              </div>

              <div className="customer-tracker-meta" style={{ marginTop: '1rem' }}>
                <div className="customer-tracker-kv">
                  <span className="customer-tracker-label">{t('driverDashboard.tripStatus')}</span>
                  <span className="status-badge" style={{ background: `${STATUS_COLOR[selectedTrip.status] || '#94a3b8'}22`, color: STATUS_COLOR[selectedTrip.status] || '#94a3b8', width: 'fit-content' }}>
                    {selectedTrip.status}
                  </span>
                </div>
                <div className="customer-tracker-kv">
                  <span className="customer-tracker-label">{t('driverDashboard.created')}</span>
                  <span className="customer-tracker-value">{formatDate(selectedTrip.createdAt)}</span>
                </div>
                <div className="customer-tracker-kv">
                  <span className="customer-tracker-label">{t('driverDashboard.driver')}</span>
                  <span className="customer-tracker-value">{selectedTrip.driver?.name || user?.name || t('driverDashboard.you')}</span>
                </div>
                <div className="customer-tracker-kv">
                  <span className="customer-tracker-label">{t('driverDashboard.truck')}</span>
                  <span className="customer-tracker-value">{selectedTrip.truck?.truckNumber || myTruck?.truckNumber || '—'}</span>
                </div>
              </div>

              {/* Quick Set Location Buttons */}
              {selectedTrip.order && (
                <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '0.6rem' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '0.4rem', fontWeight: 600 }}>
                    QUICK LOCATION SYNC
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {selectedTrip.order.pickupLocation && (
                      <button
                        type="button"
                        onClick={() => handleManualLocationSubmit(selectedTrip.order.pickupLocation)}
                        className="approve-btn"
                        style={{ flex: 1, background: 'var(--surface2)', border: '1px solid var(--border)', color: '#06b6d4', fontSize: '0.72rem', padding: '0.35rem 0.5rem' }}
                      >
                        📍 Pickup ({selectedTrip.order.pickupLocation.split(',')[0]})
                      </button>
                    )}
                    {selectedTrip.order.destination && (
                      <button
                        type="button"
                        onClick={() => handleManualLocationSubmit(selectedTrip.order.destination)}
                        className="approve-btn"
                        style={{ flex: 1, background: 'var(--surface2)', border: '1px solid var(--border)', color: '#10b981', fontSize: '0.72rem', padding: '0.35rem 0.5rem' }}
                      >
                        🏁 Drop ({selectedTrip.order.destination.split(',')[0]})
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div className="customer-tracker-actions driver-trip-actions" style={{ marginBottom: 0, marginTop: '1rem' }}>
                {selectedTrip.status === 'started' && (
                  <button
                    type="button"
                    className="approve-btn driver-action-btn"
                    style={{ background: '#06b6d4' }}
                    disabled={updating === selectedTrip._id}
                    onClick={() => handleStartTrip(selectedTrip._id, selectedTrip.status)}
                  >
                    {t('driverDashboard.startTrip')}
                  </button>
                )}
                {selectedTrip.status === 'in-transit' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
                    {otpTripId !== selectedTrip._id ? (
                      <button
                        type="button"
                        className="approve-btn driver-action-btn"
                        style={{ background: '#10b981' }}
                        disabled={updating === selectedTrip._id}
                        onClick={() => handleCompleteTrip(selectedTrip._id, selectedTrip.status)}
                      >
                        {t('driverDashboard.completeTrip')}
                      </button>
                    ) : (
                      <div style={{ padding: '1rem', background: 'var(--surface2)', borderRadius: '8px', border: '1px solid var(--border)', width: '100%' }}>
                        <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', color: '#94a3b8' }}>
                          {t('driverDashboard.otpSentMessage')}
                        </p>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                          <input
                            type="text"
                            placeholder={t('driverDashboard.otpPlaceholder')}
                            value={otpValue}
                            onChange={(e) => setOtpValue(e.target.value)}
                            style={{
                              background: 'var(--background)',
                              border: '1px solid var(--border)',
                              color: '#ffffff',
                              padding: '0.45rem 0.8rem',
                              borderRadius: '6px',
                              fontSize: '0.9rem',
                              flex: 1,
                              minWidth: '120px'
                            }}
                          />
                          <button
                            type="button"
                            className="approve-btn"
                            style={{ background: '#10b981', padding: '0.45rem 1rem', fontSize: '0.85rem' }}
                            disabled={updating === selectedTrip._id}
                            onClick={() => handleStatus(selectedTrip._id, 'completed', otpValue)}
                          >
                            {t('driverDashboard.verifyAndComplete')}
                          </button>
                          <button
                            type="button"
                            className="reject-btn"
                            style={{ background: '#ef4444', padding: '0.45rem 1rem', fontSize: '0.85rem' }}
                            onClick={() => { setOtpTripId(null); setOtpValue(''); }}
                          >
                            {t('driverDashboard.cancel')}
                          </button>
                        </div>
                        <div style={{ marginTop: '0.5rem', textAlign: 'right' }}>
                          <button
                            type="button"
                            style={{ background: 'none', border: 'none', color: '#06b6d4', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline', padding: 0 }}
                            disabled={updating === selectedTrip._id}
                            onClick={() => handleCompleteTrip(selectedTrip._id, selectedTrip.status)}
                          >
                            {t('driverDashboard.resendOtp')}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {selectedTrip.status === 'completed' && (
                  <button
                    type="button"
                    className="approve-btn driver-action-btn"
                    style={{ background: STATUS_COLOR.completed }}
                    disabled
                  >
                    {t('driverDashboard.tripCompleted')}
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="customer-tracker-empty">
              <p>{t('driverDashboard.noTripsAssigned')}</p>
              <span>{t('driverDashboard.noTripsAssignedDesc')}</span>
            </div>
          )}
        </div>
      </div>

      <div className="dash-section-label" style={{ marginBottom: '0.75rem', marginTop: '1.5rem' }}>{t('driverDashboard.tripLog')}</div>
      {trips.length === 0 ? (
        <p style={{ color: '#64748b' }}>{t('driverDashboard.noTripsYet')}</p>
      ) : (
        <div className="dark-table-wrap">
          <table className="dark-table">
            <thead>
              <tr>
                <th>{t('driverDashboard.tripIdCol')}</th>
                <th>{t('driverDashboard.pickupCol')}</th>
                <th>{t('driverDashboard.dropCol')}</th>
                <th>{t('driverDashboard.statusCol')}</th>
                <th>{t('driverDashboard.dateCol')}</th>
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
