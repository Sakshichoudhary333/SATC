import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import { getTruckById } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
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

const FlyTo = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom(), { animate: true });
  }, [lat, lng, map]);
  return null;
};

const LiveTruckTrack = () => {
  const { truckId } = useParams();
  const [truck, setTruck] = useState(null);
  const [location, setLocation] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const socketRef = useRef(null);

  // Load truck details
  useEffect(() => {
    getTruckById(truckId)
      .then((data) => {
        setTruck(data);
        if (data?.location?.lat && data?.location?.lng) {
          setLocation({ lat: Number(data.location.lat), lng: Number(data.location.lng) });
          setLastUpdated(data.lastUpdated);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [truckId]);

  // Socket: live location updates
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

    socket.on('locationUpdated', handleLocation);
    socket.on('truckLocationUpdated', handleLocation);

    return () => {
      socket.off('locationUpdated', handleLocation);
      socket.off('truckLocationUpdated', handleLocation);
      socket.disconnect();
    };
  }, [truckId]);

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
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.7rem', letterSpacing: '0.1em', color: '#64748b', marginBottom: '0.25rem' }}>
          LIVE TRUCK TRACKING
        </div>
        <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700 }}>
          {truck ? `Truck ${truck.truckNumber}` : 'Live Tracker'}
        </h2>
        {truck?.driver?.name && (
          <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Driver: {truck.driver.name}
          </div>
        )}
      </div>

      {error && (
        <div style={{ background: '#ef444422', border: '1px solid #ef4444', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1rem', color: '#ef4444' }}>
          {error}
        </div>
      )}

      {/* Stats bar */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        <div style={{ background: '#1e2330', borderRadius: '8px', padding: '0.75rem 1.25rem', flex: 1, minWidth: '140px' }}>
          <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '0.25rem' }}>STATUS</div>
          <div style={{ color: truck?.isAvailable ? '#10b981' : '#8b5cf6', fontWeight: 600 }}>
            {truck?.isAvailable ? 'Available' : 'On Trip'}
          </div>
        </div>
        <div style={{ background: '#1e2330', borderRadius: '8px', padding: '0.75rem 1.25rem', flex: 1, minWidth: '140px' }}>
          <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '0.25rem' }}>LIVE LOCATION</div>
          <div style={{ color: '#06b6d4', fontWeight: 600, fontSize: '0.9rem' }}>
            {location
              ? `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`
              : 'Waiting for GPS...'}
          </div>
        </div>
        <div style={{ background: '#1e2330', borderRadius: '8px', padding: '0.75rem 1.25rem', flex: 1, minWidth: '140px' }}>
          <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '0.25rem' }}>LAST UPDATED</div>
          <div style={{ color: '#e2e8f0', fontSize: '0.85rem' }}>
            {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : '—'}
          </div>
        </div>
      </div>

      {/* Map */}
      <div style={{ borderRadius: '12px', overflow: 'hidden', marginBottom: '1.25rem', border: '1px solid #1e2330' }}>
        <MapContainer
          center={location ? [location.lat, location.lng] : DEFAULT_CENTER}
          zoom={14}
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
                  {truck?.driver?.name && <>Driver: {truck.driver.name}<br /></>}
                  {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                </Popup>
              </Marker>
            </>
          )}
        </MapContainer>
        {!location && (
          <div style={{ background: '#1e2330', padding: '1rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
            Waiting for the driver to share their GPS location...
          </div>
        )}
      </div>

      {/* Shareable link */}
      <div style={{ background: '#1e2330', borderRadius: '10px', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '0.5rem', letterSpacing: '0.08em' }}>
          SHAREABLE LINK
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            readOnly
            value={shareUrl}
            style={{
              flex: 1,
              background: '#0f1117',
              border: '1px solid #334155',
              borderRadius: '6px',
              padding: '0.5rem 0.75rem',
              color: '#94a3b8',
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
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
        <div style={{ color: '#475569', fontSize: '0.75rem', marginTop: '0.5rem' }}>
          Anyone with this link can view the truck's live location — no login required.
        </div>
      </div>
    </div>
  );
};

export default LiveTruckTrack;
