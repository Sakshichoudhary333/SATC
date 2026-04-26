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
  const showRoute = truckCoords && destinationCoords && routeCoords && routeCoords.length > 1;
  const pointsForSvg = showRoute
    ? fitPointsToViewBox(routeCoords)
    : truckCoords && destinationCoords
      ? fitPointsToViewBox([truckCoords, destinationCoords])
      : [];
  const routePath = showRoute ? buildRoutePath(pointsForSvg) : pointsForSvg.length > 1 ? buildRoutePath(pointsForSvg) : '';
  const mapLabel = showRoute ? 'Route visualized from live GPS to destination' : 'Live GPS and destination markers';

  useEffect(() => {
    let active = true;

    if (!order?.destination) {
      setDestinationCoords(null);
      return undefined;
    }

    geocodeAddress(order.destination).then((coords) => {
      if (active) {
        setDestinationCoords(coords);
      }
    });

    return () => {
      active = false;
    };
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
        if (active) {
          setEta(data);
        }
      } catch (err) {
        if (active) {
          setEta(null);
          setEtaError(err.message || 'Unable to load ETA');
        }
      } finally {
        if (active) {
          setEtaLoading(false);
        }
      }
    };

    loadETA();
    return () => {
      active = false;
    };
  }, [truckId, truckCoords?.lat, truckCoords?.lng, destinationCoords?.lat, destinationCoords?.lng]);

  useEffect(() => {
    const canBuildRoute =
      truckCoords &&
      destinationCoords &&
      Number.isFinite(truckCoords.lat) &&
      Number.isFinite(truckCoords.lng) &&
      Number.isFinite(destinationCoords.lat) &&
      Number.isFinite(destinationCoords.lng);

    if (!canBuildRoute) {
      setRouteCoords(null);
      return undefined;
    }

    let active = true;

    fetchRoutePolyline(truckCoords, destinationCoords).then((points) => {
      if (active) {
        setRouteCoords(points);
      }
    });

    return () => {
      active = false;
    };
  }, [truckCoords?.lat, truckCoords?.lng, destinationCoords?.lat, destinationCoords?.lng]);

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

      <div className="tracker-map">
        <div className="tracker-map-topline">
          <span>Route visualization</span>
          <span>{mapLabel}</span>
        </div>

        {truckCoords && destinationCoords ? (
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
            {routePath ? (
              <path d={routePath} fill="none" stroke="url(#trackerLine)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            ) : (
              <line
                x1={pointsForSvg[0]?.x || 120}
                y1={pointsForSvg[0]?.y || 360}
                x2={pointsForSvg[1]?.x || 880}
                y2={pointsForSvg[1]?.y || 160}
                stroke="url(#trackerLine)"
                strokeWidth="6"
                strokeLinecap="round"
              />
            )}

            {pointsForSvg.length >= 2 && (
              <>
                <circle cx={pointsForSvg[0].x} cy={pointsForSvg[0].y} r="12" fill="#06b6d4" />
                <circle cx={pointsForSvg[1].x} cy={pointsForSvg[1].y} r="12" fill="#10b981" />
                <text x={pointsForSvg[0].x + 18} y={pointsForSvg[0].y - 16} fill="#e2e8f0" fontSize="24" fontWeight="700">
                  Truck
                </text>
                <text x={pointsForSvg[1].x + 18} y={pointsForSvg[1].y - 16} fill="#e2e8f0" fontSize="24" fontWeight="700">
                  Destination
                </text>
              </>
            )}

            <text x="36" y="484" fill="#94a3b8" fontSize="22">
              GPS {truckCoords ? formatCoords(truckCoords) : 'Unavailable'}
            </text>
            <text x="36" y="48" fill="#94a3b8" fontSize="22">
              {order?.destination || 'Destination unavailable'}
            </text>
          </svg>
        ) : (
          <div className="tracker-empty">
            Waiting for both truck GPS and destination coordinates before rendering the route.
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
