import { useEffect, useMemo, useState } from 'react';
import { getTruckETA } from '../services/api';

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

const buildRoutePath = (points) => points.map((p, index) => `${index === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

const fitPointsToViewBox = (coords, width = 1000, height = 520, padding = 64) => {
  if (!coords || coords.length === 0) return [];

  const lats = coords.map((point) => point.lat);
  const lngs = coords.map((point) => point.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const latSpan = Math.max(maxLat - minLat, 0.00001);
  const lngSpan = Math.max(maxLng - minLng, 0.00001);

  return coords.map((point) => ({
    x: padding + ((point.lng - minLng) / lngSpan) * (width - padding * 2),
    y: height - padding - ((point.lat - minLat) / latSpan) * (height - padding * 2),
  }));
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

  // Build the full route: pickup → destination (the static road path)
  // Truck dot is overlaid separately on top
  const showRoute = pickupCoords && destinationCoords && routeCoords && routeCoords.length > 1;
  const routePointsForSvg = showRoute
    ? fitPointsToViewBox(routeCoords)
    : pickupCoords && destinationCoords
      ? fitPointsToViewBox([pickupCoords, destinationCoords])
      : [];

  // Project the truck's live position onto the same coordinate space as the route
  const allCoordsForViewBox = showRoute
    ? routeCoords
    : pickupCoords && destinationCoords
      ? [pickupCoords, destinationCoords]
      : [];

  const truckSvgPoint = useMemo(() => {
    if (!truckCoords || allCoordsForViewBox.length === 0) return null;
    const allWithTruck = [...allCoordsForViewBox, truckCoords];
    const projected = fitPointsToViewBox(allWithTruck);
    // The truck is the last point we added
    return projected[projected.length - 1];
  }, [truckCoords?.lat, truckCoords?.lng, showRoute, pickupCoords, destinationCoords]);

  const routePath = routePointsForSvg.length > 1 ? buildRoutePath(routePointsForSvg) : '';
  const pickupSvgPoint = routePointsForSvg[0] || null;
  const destSvgPoint = routePointsForSvg[routePointsForSvg.length - 1] || null;
  const mapLabel = showRoute ? 'Route: Pickup → Destination (live truck position shown)' : 'Pickup and destination markers';

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

      <div className="tracker-map">
        <div className="tracker-map-topline">
          <span>Route visualization</span>
          <span>{mapLabel}</span>
        </div>

        {pickupCoords && destinationCoords ? (
          <svg viewBox="0 0 1000 520" className="tracker-svg" role="img" aria-label="Delivery route map">
            <defs>
              <pattern id="trackerGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(148,163,184,0.12)" strokeWidth="1" />
              </pattern>
              <linearGradient id="trackerLine" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
            <rect width="1000" height="520" fill="rgba(15,17,23,0.88)" />
            <rect width="1000" height="520" fill="url(#trackerGrid)" />

            {/* Route line: pickup → destination */}
            {routePath ? (
              <path d={routePath} fill="none" stroke="url(#trackerLine)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            ) : pickupSvgPoint && destSvgPoint ? (
              <line
                x1={pickupSvgPoint.x} y1={pickupSvgPoint.y}
                x2={destSvgPoint.x} y2={destSvgPoint.y}
                stroke="url(#trackerLine)" strokeWidth="6" strokeLinecap="round"
              />
            ) : null}

            {/* Pickup marker */}
            {pickupSvgPoint && (
              <>
                <circle cx={pickupSvgPoint.x} cy={pickupSvgPoint.y} r="14" fill="#06b6d4" opacity="0.25" />
                <circle cx={pickupSvgPoint.x} cy={pickupSvgPoint.y} r="8" fill="#06b6d4" />
                <rect x={pickupSvgPoint.x - 10} y={pickupSvgPoint.y - 13} width="20" height="20" rx="4" fill="#06b6d4" />
                <text x={pickupSvgPoint.x} y={pickupSvgPoint.y + 2} fill="#0f1117" fontSize="13" fontWeight="900" textAnchor="middle" dominantBaseline="middle">P</text>
                <text
                  x={pickupSvgPoint.x}
                  y={pickupSvgPoint.y - 22}
                  fill="#06b6d4"
                  fontSize="18"
                  fontWeight="700"
                  textAnchor="middle"
                >
                  {order?.pickupLocation || 'Pickup'}
                </text>
              </>
            )}

            {/* Destination marker */}
            {destSvgPoint && (
              <>
                <circle cx={destSvgPoint.x} cy={destSvgPoint.y} r="14" fill="#10b981" opacity="0.25" />
                <circle cx={destSvgPoint.x} cy={destSvgPoint.y} r="8" fill="#10b981" />
                <rect x={destSvgPoint.x - 10} y={destSvgPoint.y - 13} width="20" height="20" rx="4" fill="#10b981" />
                <text x={destSvgPoint.x} y={destSvgPoint.y + 2} fill="#0f1117" fontSize="13" fontWeight="900" textAnchor="middle" dominantBaseline="middle">D</text>
                <text
                  x={destSvgPoint.x}
                  y={destSvgPoint.y - 22}
                  fill="#10b981"
                  fontSize="18"
                  fontWeight="700"
                  textAnchor="middle"
                >
                  {order?.destination || 'Destination'}
                </text>
              </>
            )}

            {/* Live truck marker */}
            {truckSvgPoint && (
              <>
                <circle cx={truckSvgPoint.x} cy={truckSvgPoint.y} r="18" fill="#f59e0b" opacity="0.2" />
                <circle cx={truckSvgPoint.x} cy={truckSvgPoint.y} r="10" fill="#f59e0b" />
                <rect x={truckSvgPoint.x - 10} y={truckSvgPoint.y - 13} width="20" height="20" rx="4" fill="#f59e0b" />
                <text x={truckSvgPoint.x} y={truckSvgPoint.y + 2} fill="#0f1117" fontSize="13" fontWeight="900" textAnchor="middle" dominantBaseline="middle">T</text>
                <text
                  x={truckSvgPoint.x}
                  y={truckSvgPoint.y - 26}
                  fill="#f59e0b"
                  fontSize="18"
                  fontWeight="700"
                  textAnchor="middle"
                >
                  Truck
                </text>
              </>
            )}

            <text x="36" y="510" fill="#94a3b8" fontSize="20">
              GPS {truckCoords ? formatCoords(truckCoords) : 'Unavailable'}
            </text>
          </svg>
        ) : (
          <div className="tracker-empty">
            Waiting for pickup and destination coordinates before rendering the route.
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
