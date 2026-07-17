import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { getTruckETA } from '../services/api';
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

const DEFAULT_CENTER = [20.5937, 78.9629];

const FlyTo = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom(), { animate: true });
  }, [lat, lng, map]);
  return null;
};

const isValidMongoId = (value) =>
  typeof value === 'string' && /^[a-fA-F0-9]{24}$/.test(value.trim());

const formatCoords = (coords) => {
  if (!coords) return 'Unavailable';
  return `${Number(coords.lat).toFixed(5)}, ${Number(coords.lng).toFixed(5)}`;
};

const formatEta = (eta) => {
  if (!eta || (!eta.hours && !eta.minutes)) return '0 min';
  const parts = [];
  if (eta.hours) parts.push(`${eta.hours}h`);
  if (eta.minutes || !parts.length) parts.push(`${eta.minutes}m`);
  return parts.join(' ');
};

const getEtaMinutes = (eta) => {
  if (!eta) return null;
  return (Number(eta.hours) || 0) * 60 + (Number(eta.minutes) || 0);
};

const getStatusTone = (status) => {
  const map = {
    Delivered: '#10b981',
    'On Trip': '#8b5cf6',
    Delayed: '#ef4444',
    'Awaiting Dispatch': '#06b6d4',
  };

  return map[status] || '#94a3b8';
};

const getTrackingStatus = (order, etaMinutes) => {
  if (order?.status === 'completed' || order?.trip?.status === 'completed') return 'Delivered';

  const lastUpdated = order?.truck?.lastUpdated ? new Date(order.truck.lastUpdated).getTime() : null;
  const staleMinutes = lastUpdated ? (Date.now() - lastUpdated) / 60000 : null;

  if (staleMinutes !== null && staleMinutes >= 20) return 'Delayed';
  if (etaMinutes !== null && etaMinutes >= 120) return 'Delayed';
  if (order?.truck) return 'On Trip';
  return 'Awaiting Dispatch';
};

const geocodeAddress = async (address) => {
  try {
    const cleanAddress = address.trim();
    
    // Try multiple query strategies for better accuracy with ambiguous locations
    const queryStrategies = [
      cleanAddress, // Original address
      cleanAddress.includes(', India') ? cleanAddress : `${cleanAddress}, India`, // With country
    ];

    // For Indian locations, try with state context if address doesn't contain a state
    const indianStates = ['Rajasthan', 'Maharashtra', 'Madhya Pradesh', 'Gujarat', 'Uttar Pradesh', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Kerala', 'Punjab', 'Haryana', 'Bihar', 'West Bengal', 'Odisha', 'Assam'];
    
    if (!indianStates.some(state => cleanAddress.toLowerCase().includes(state.toLowerCase()))) {
      queryStrategies.push(`${cleanAddress}, Rajasthan, India`);
      queryStrategies.push(`${cleanAddress}, Rajasthan`);
    }

    for (const queryAddr of queryStrategies) {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(queryAddr)}&format=json&limit=1`
      );
      const data = await res.json();
      const first = data?.[0];
      if (first) {
        return {
          lat: Number.parseFloat(first.lat),
          lng: Number.parseFloat(first.lon),
        };
      }
    }

    return null;
  } catch {
    return null;
  }
};

const fetchRoutePolyline = async (start, end) => {
  try {
    const res = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`
    );
    const data = await res.json();
    const points = data?.routes?.[0]?.geometry?.coordinates;

    if (!Array.isArray(points) || points.length === 0) {
      return null;
    }

    return points.map(([lng, lat]) => ({ lat, lng }));
  } catch {
    return null;
  }
};

const LiveDeliveryTracker = ({ order }) => {
  const [pickupCoords, setPickupCoords] = useState(null);
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [routeCoords, setRouteCoords] = useState(null);
  const [eta, setEta] = useState(null);
  const [etaLoading, setEtaLoading] = useState(false);
  const [etaError, setEtaError] = useState('');

  const truckCoords = order?.truck?.location || null;
  const truckId = order?.truck?._id;
  const etaMinutes = useMemo(() => getEtaMinutes(eta?.eta), [eta]);
  const trackingStatus = useMemo(() => getTrackingStatus(order, etaMinutes), [order, etaMinutes]);
  const trackingTone = getStatusTone(trackingStatus);
  const liveLastUpdated = order?.truck?.lastUpdated ? new Date(order.truck.lastUpdated).toLocaleString() : 'Waiting for GPS feed';

  const mapLabel = truckCoords ? 'Live Route Tracking' : 'Route (Pickup → Destination)';

  // Geocode pickup
  useEffect(() => {
    let active = true;
    if (!order?.pickupLocation) { setPickupCoords(null); return undefined; }
    geocodeAddress(order.pickupLocation).then((coords) => { if (active) setPickupCoords(coords); });
    return () => { active = false; };
  }, [order?.pickupLocation]);

  // Geocode destination
  useEffect(() => {
    let active = true;
    if (!order?.destination) { setDestinationCoords(null); return undefined; }
    geocodeAddress(order.destination).then((coords) => { if (active) setDestinationCoords(coords); });
    return () => { active = false; };
  }, [order?.destination]);

  useEffect(() => {
    const canFetchETA =
      truckId &&
      isValidMongoId(truckId) &&
      truckCoords &&
      destinationCoords &&
      Number.isFinite(destinationCoords.lat) &&
      Number.isFinite(destinationCoords.lng);

    if (!canFetchETA) {
      setEta(null);
      setEtaError('');
      setEtaLoading(false);
      return undefined;
    }

    let active = true;

    const loadETA = async () => {
      setEtaLoading(true);
      setEtaError('');

      try {
        const data = await getTruckETA(truckId, destinationCoords.lat, destinationCoords.lng);
        if (active) setEta(data);
      } catch (err) {
        if (active) { setEta(null); setEtaError(err.message || 'Unable to load ETA'); }
      } finally {
        if (active) setEtaLoading(false);
      }
    };

    loadETA();
    return () => { active = false; };
  }, [truckId, truckCoords?.lat, truckCoords?.lng, destinationCoords?.lat, destinationCoords?.lng]);

  // Fetch route polyline from pickup to destination (not truck position)
  useEffect(() => {
    const canBuildRoute =
      pickupCoords && destinationCoords &&
      Number.isFinite(pickupCoords.lat) && Number.isFinite(pickupCoords.lng) &&
      Number.isFinite(destinationCoords.lat) && Number.isFinite(destinationCoords.lng);

    if (!canBuildRoute) { setRouteCoords(null); return undefined; }

    let active = true;
    fetchRoutePolyline(pickupCoords, destinationCoords).then((points) => {
      if (active) setRouteCoords(points);
    });
    return () => { active = false; };
  }, [pickupCoords?.lat, pickupCoords?.lng, destinationCoords?.lat, destinationCoords?.lng]);

  const etaText = etaLoading
    ? 'Loading...'
    : etaError
      ? etaError
      : eta?.eta
        ? formatEta(eta.eta)
        : 'Unavailable';

  const distanceText = eta?.distance !== undefined ? `${Number(eta.distance).toFixed(2)} km` : 'Unavailable';
  const statusHint =
    trackingStatus === 'Delayed'
      ? 'The truck has not sent a recent GPS update.'
      : trackingStatus === 'Delivered'
        ? 'Delivery completed successfully.'
        : trackingStatus === 'On Trip'
          ? 'Truck is actively moving toward the destination.'
          : 'Waiting for assignment and live GPS updates.';

  return (
    <div className="tracker-shell">
      <div className="tracker-head">
        <div>
          <div className="tracker-kicker">LIVE DELIVERY TRACKER</div>
          <h3 className="tracker-title">Real-time tracking for order #{order?._id?.slice(-6)}</h3>
        </div>
        <span className="tracker-status-pill" style={{ background: `${trackingTone}22`, color: trackingTone }}>
          {trackingStatus}
        </span>
      </div>

      <div className="tracker-grid">
        <div className="tracker-metric">
          <span className="tracker-label">Live Location</span>
          <span className="tracker-value">{formatCoords(truckCoords)}</span>
        </div>
        <div className="tracker-metric">
          <span className="tracker-label">Status</span>
          <span className="tracker-value">{trackingStatus}</span>
        </div>
        <div className="tracker-metric">
          <span className="tracker-label">ETA</span>
          <span className="tracker-value">{etaText}</span>
        </div>
        <div className="tracker-metric">
          <span className="tracker-label">Distance</span>
          <span className="tracker-value">{distanceText}</span>
        </div>
      </div>

      {eta?.distance !== undefined && Number(eta.distance) <= 2.0 && Number(eta.distance) > 0.0 && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(245, 158, 11, 0.1) 100%)',
          border: '1px solid #ef4444',
          borderRadius: '8px',
          padding: '0.85rem 1.25rem',
          margin: '1.25rem 0',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          boxShadow: '0 0 10px rgba(239, 68, 68, 0.1)',
        }}>
          <span style={{ fontSize: '1.5rem' }}>🚨</span>
          <div>
            <div style={{ fontWeight: 700, color: '#f43f5e', fontSize: '0.9rem', letterSpacing: '0.05em' }}>PROXIMITY WARNING: TRUCK IS NEAR DESTINATION</div>
            <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '0.15rem' }}>
              The truck is within <strong>{Number(eta.distance).toFixed(2)} km</strong> of the delivery address.
            </div>
          </div>
        </div>
      )}

      <div className="tracker-map" style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' }}>
        <div className="tracker-map-topline">
          <span>{mapLabel}</span>
          <span>GPS: {truckCoords ? formatCoords(truckCoords) : 'Unavailable'}</span>
        </div>

        {pickupCoords || destinationCoords || truckCoords ? (
          <MapContainer
            center={truckCoords ? [truckCoords.lat, truckCoords.lng] : pickupCoords ? [pickupCoords.lat, pickupCoords.lng] : DEFAULT_CENTER}
            zoom={truckCoords || pickupCoords ? 12 : 5}
            scrollWheelZoom={true}
            style={{ height: '380px', width: '100%' }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            
            {truckCoords && <FlyTo lat={truckCoords.lat} lng={truckCoords.lng} />}
            
            {pickupCoords && (
              <Marker position={[pickupCoords.lat, pickupCoords.lng]}>
                <Popup>
                  <strong>Pickup</strong><br />
                  {order?.pickupLocation || 'Pickup Point'}
                </Popup>
              </Marker>
            )}

            {destinationCoords && (
              <Marker position={[destinationCoords.lat, destinationCoords.lng]}>
                <Popup>
                  <strong>Destination</strong><br />
                  {order?.destination || 'Delivery Point'}
                </Popup>
              </Marker>
            )}

            {truckCoords && (
              <Marker position={[truckCoords.lat, truckCoords.lng]}>
                <Popup>
                  <strong>Truck {order.truck?.truckNumber}</strong><br />
                  Status: {trackingStatus}
                </Popup>
              </Marker>
            )}

            {destinationCoords && (
              <Circle
                center={[destinationCoords.lat, destinationCoords.lng]}
                radius={2000}
                pathOptions={{
                  color: '#ef4444',
                  fillColor: '#ef4444',
                  fillOpacity: 0.08,
                  dashArray: '6, 6',
                  weight: 2
                }}
              />
            )}

            {routeCoords && routeCoords.length > 1 && (
              <Polyline
                positions={routeCoords.map(p => [p.lat, p.lng])}
                pathOptions={{
                  color: '#8b5cf6',
                  weight: 5,
                  opacity: 0.75,
                }}
              />
            )}
          </MapContainer>
        ) : (
          <div className="tracker-empty" style={{ height: '380px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface2)', color: '#64748b' }}>
            Waiting for coordinates before rendering the map.
          </div>
        )}
      </div>

      <div className="tracker-foot">
        <div>
          <div className="tracker-label">Pickup</div>
          <div className="tracker-foot-value">{order?.pickupLocation || 'Unavailable'}</div>
        </div>
        <div>
          <div className="tracker-label">Destination</div>
          <div className="tracker-foot-value">{order?.destination || 'Unavailable'}</div>
        </div>
        <div>
          <div className="tracker-label">Last GPS Update</div>
          <div className="tracker-foot-value">{liveLastUpdated}</div>
        </div>
      </div>

      <div className="tracker-note">{statusHint}</div>
    </div>
  );
};

export default LiveDeliveryTracker;
