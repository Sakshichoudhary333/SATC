import { useEffect, useRef, useState, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { MapContainer, Marker, Popup, TileLayer, useMap, Polyline, Circle } from 'react-leaflet';
import L from 'leaflet';
import { getTruckById, getTruckActiveTrip } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { useLanguage } from '../context/LanguageContext';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const SOCKET_URL = 'https://satc-backend.onrender.com';
const DEFAULT_CENTER = [20.5937, 78.9629];

// Helper to calculate distance in km
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

const FlyTo = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom(), { animate: true });
  }, [lat, lng, map]);
  return null;
};

const LiveTruckTrack = () => {
  const { truckId } = useParams();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [truck, setTruck] = useState(null);
  const [activeTrip, setActiveTrip] = useState(null);
  const [location, setLocation] = useState(null);
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [socketAlert, setSocketAlert] = useState(null);
  const socketRef = useRef(null);
  const { t } = useLanguage();

  // Load truck details and active trip on mount
  useEffect(() => {
    setLoading(true);
    Promise.all([
      getTruckById(truckId),
      getTruckActiveTrip(truckId, orderId).catch(() => null)
    ])
      .then(([truckData, tripData]) => {
        setTruck(truckData);
        setActiveTrip(tripData);
        if (truckData?.location?.lat && truckData?.location?.lng) {
          setLocation({ lat: Number(truckData.location.lat), lng: Number(truckData.location.lng) });
          setLastUpdated(truckData.lastUpdated);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [truckId]);

  // Geocode destination address
  useEffect(() => {
    if (!activeTrip?.order?.destination) {
      setDestinationCoords(null);
      return;
    }

    const geocode = async () => {
      try {
        let queryAddr = activeTrip.order.destination.trim();
        if (!queryAddr.toLowerCase().includes('india')) {
          queryAddr += ', India';
        }
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(queryAddr)}&format=json&limit=1`
        );
        const data = await res.json();
        const first = data?.[0];
        if (first) {
          setDestinationCoords({
            lat: Number.parseFloat(first.lat),
            lng: Number.parseFloat(first.lon),
          });
        }
      } catch (err) {
        console.error('Failed to geocode destination address', err);
      }
    };

    geocode();
  }, [activeTrip?.order?.destination]);

  // Fetch OSRM driving route polyline
  useEffect(() => {
    if (!location || !destinationCoords) {
      setRouteCoords([]);
      return;
    }

    const fetchRoute = async () => {
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${location.lng},${location.lat};${destinationCoords.lng},${destinationCoords.lat}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        const data = await res.json();
        if (data?.routes?.[0]?.geometry?.coordinates) {
          const mappedCoords = data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
          setRouteCoords(mappedCoords);
        }
      } catch (err) {
        console.error('Failed to fetch driving route polyline', err);
      }
    };

    fetchRoute();
  }, [location?.lat, location?.lng, destinationCoords]);

  // Socket: live location & geofence updates
  useEffect(() => {
    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    const handleLocation = ({ truckId: tid, lat, lng, lastUpdated: ts }) => {
      if (tid !== truckId) return;
      const parsedLat = Number(lat);
      const parsedLng = Number(lng);
      if (!Number.isFinite(parsedLat) || !Number.isFinite(parsedLng)) return;
      setLocation({ lat: parsedLat, lng: parsedLng });
      setLastUpdated(ts || new Date().toISOString());
    };

    const handleGeofenceAlert = (data) => {
      if (data.truckId === truckId) {
        setSocketAlert(data);
      }
    };

    socket.on('locationUpdated', handleLocation);
    socket.on('truckLocationUpdated', handleLocation);
    socket.on('geofenceAlert', handleGeofenceAlert);

    return () => {
      socket.off('locationUpdated', handleLocation);
      socket.off('truckLocationUpdated', handleLocation);
      socket.off('geofenceAlert', handleGeofenceAlert);
      socket.disconnect();
    };
  }, [truckId]);

  const currentDistance = useMemo(() => {
    if (!location || !destinationCoords) return null;
    return getDistanceKm(location, destinationCoords);
  }, [location, destinationCoords]);

  const shareUrl = window.location.href;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div style={{ minHeight: '100vh', background: '#0f1117', color: '#e2e8f0', padding: '1.5rem' }}>
      <style>{`
        @keyframes pulse-border {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.5); }
          70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
        .pulse-banner {
          animation: pulse-border 2s infinite;
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.7rem', letterSpacing: '0.1em', color: '#64748b', marginBottom: '0.25rem' }}>
          {t('liveTruckTrack.liveTruckTracking')}
        </div>
        <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700 }}>
          {truck ? `${t('admin.assignTruck.colTruck')} ${truck.truckNumber}` : t('liveTruckTrack.liveTracker')}
        </h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.5rem' }}>
          {truck?.driver?.name && (
            <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
              {t('liveTruckTrack.driverLabel')}{truck.driver.name}
            </div>
          )}
          {activeTrip?.order && (
            <div style={{ color: '#cbd5e1', fontSize: '0.85rem', background: '#1e293b', padding: '0.35rem 0.85rem', borderRadius: '9999px', border: '1px solid #334155', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: '#a78bfa', fontWeight: 500 }}>{t('liveTruckTrack.source')}:</span>
              <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{activeTrip.order.pickupLocation}</span>
              <span style={{ color: '#64748b' }}>➔</span>
              <span style={{ color: '#f472b6', fontWeight: 500 }}>{t('liveTruckTrack.destination')}:</span>
              <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{activeTrip.order.destination}</span>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div style={{ background: '#ef444422', border: '1px solid #ef4444', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1rem', color: '#ef4444' }}>
          {error}
        </div>
      )}

      {/* Geofence Alert Banner */}
      {(currentDistance !== null && currentDistance <= 2.0 || socketAlert) && (
        <div className="pulse-banner" style={{
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(244, 63, 94, 0.15) 100%)',
          border: '1px solid #ef4444',
          borderRadius: '10px',
          padding: '1rem 1.25rem',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
        }}>
          <span style={{ fontSize: '1.75rem', animation: 'bounce 1s infinite' }}>🚨</span>
          <div>
            <div style={{ fontWeight: 700, color: '#f43f5e', fontSize: '1rem', letterSpacing: '0.05em' }}>
              PROXIMITY WARNING: ENTERING GEOFENCE
            </div>
            <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '0.25rem' }}>
              This truck is currently within <strong>{currentDistance ? currentDistance.toFixed(2) : socketAlert?.distance?.toFixed(2) || '2.0'} km</strong> of the destination address: <em>{activeTrip?.order?.destination || socketAlert?.destination}</em>.
            </div>
          </div>
        </div>
      )}

      {/* Stats bar */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        <div style={{ background: 'var(--surface2)', borderRadius: '8px', padding: '0.75rem 1.25rem', flex: 1, minWidth: '140px' }}>
          <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '0.25rem' }}>{t('liveTruckTrack.statusLabel')}</div>
          <div style={{ color: truck?.isAvailable ? '#10b981' : '#8b5cf6', fontWeight: 600 }}>
            {truck?.isAvailable ? t('liveTruckTrack.available') : t('liveTruckTrack.onTrip')}
          </div>
        </div>
        {activeTrip?.order?.pickupLocation && (
          <div style={{ background: 'var(--surface2)', borderRadius: '8px', padding: '0.75rem 1.25rem', flex: 1, minWidth: '140px' }}>
            <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '0.25rem' }}>{t('liveTruckTrack.source')}</div>
            <div style={{ color: '#a78bfa', fontWeight: 600, fontSize: '0.9rem' }}>
              {activeTrip.order.pickupLocation}
            </div>
          </div>
        )}
        {activeTrip?.order?.destination && (
          <div style={{ background: 'var(--surface2)', borderRadius: '8px', padding: '0.75rem 1.25rem', flex: 1, minWidth: '140px' }}>
            <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '0.25rem' }}>{t('liveTruckTrack.destination')}</div>
            <div style={{ color: '#f472b6', fontWeight: 600, fontSize: '0.9rem' }}>
              {activeTrip.order.destination}
            </div>
          </div>
        )}
        <div style={{ background: 'var(--surface2)', borderRadius: '8px', padding: '0.75rem 1.25rem', flex: 1, minWidth: '140px' }}>
          <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '0.25rem' }}>{t('liveTruckTrack.liveLocation')}</div>
          <div style={{ color: '#06b6d4', fontWeight: 600, fontSize: '0.9rem' }}>
            {location
              ? `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`
              : t('liveTruckTrack.waitingGps')}
          </div>
        </div>
        <div style={{ background: 'var(--surface2)', borderRadius: '8px', padding: '0.75rem 1.25rem', flex: 1, minWidth: '140px' }}>
          <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '0.25rem' }}>Distance & Route</div>
          <div style={{ color: 'var(--text)', fontSize: '0.85rem', fontWeight: 600 }}>
            {currentDistance !== null ? `${currentDistance.toFixed(1)} km left` : 'Calculating route...'}
          </div>
        </div>
      </div>

      {/* Map */}
      <div style={{ borderRadius: '12px', overflow: 'hidden', marginBottom: '1.25rem', border: '1px solid var(--border)' }}>
        <MapContainer
          center={location ? [location.lat, location.lng] : DEFAULT_CENTER}
          zoom={location ? 12 : 5}
          scrollWheelZoom={true}
          style={{ height: '420px', width: '100%' }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {location && (
            <>
              <FlyTo lat={location.lat} lng={location.lng} />
              <Marker position={[location.lat, location.lng]}>
                <Popup>
                  <strong>{truck?.truckNumber}</strong><br />
                  {truck?.driver?.name && <>{t('liveTruckTrack.driverLabel')}{truck.driver.name}<br /></>}
                  {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                </Popup>
              </Marker>
            </>
          )}

          {destinationCoords && (
            <>
              <Marker position={[destinationCoords.lat, destinationCoords.lng]}>
                <Popup>
                  <strong>Destination Address</strong><br />
                  {activeTrip?.order?.destination}
                </Popup>
              </Marker>
              <Circle
                center={[destinationCoords.lat, destinationCoords.lng]}
                radius={2000}
                pathOptions={{
                  color: '#ef4444',
                  fillColor: '#ef4444',
                  fillOpacity: 0.1,
                  dashArray: '6, 6',
                  weight: 2
                }}
              />
            </>
          )}

          {routeCoords.length > 0 && (
            <Polyline
              positions={routeCoords}
              pathOptions={{
                color: '#8b5cf6',
                weight: 5,
                opacity: 0.75,
              }}
            />
          )}
        </MapContainer>
        {!location && (
          <div style={{ background: 'var(--surface2)', padding: '1rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
            {t('liveTruckTrack.waitingDriverShare')}
          </div>
        )}
      </div>

      {/* Shareable link */}
      <div style={{ background: 'var(--surface2)', borderRadius: '10px', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '0.5rem', letterSpacing: '0.08em' }}>
          {t('liveTruckTrack.shareableLink')}
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            readOnly
            value={shareUrl}
            style={{
              flex: 1,
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              padding: '0.5rem 0.75rem',
              color: 'var(--text)',
              fontSize: '0.82rem',
              minWidth: '200px',
            }}
            onClick={(e) => e.target.select()}
          />
          <button
            onClick={handleCopy}
            style={{
              background: copied ? '#10b981' : '#06b6d4',
              color: '#0f1117',
              border: 'none',
              borderRadius: '6px',
              padding: '0.5rem 1rem',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {copied ? t('liveTruckTrack.copied') : t('liveTruckTrack.copyLink')}
          </button>
        </div>
        <div style={{ color: '#475569', fontSize: '0.75rem', marginTop: '0.5rem' }}>
          {t('liveTruckTrack.noLoginRequiredDesc')}
        </div>
      </div>
    </div>
  );
};

export default LiveTruckTrack;
