import { useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useAuth } from '../context/AuthContext';
import { getMyOrders, getTrucks, getTrips } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { useLanguage } from '../context/LanguageContext';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const SOCKET_URL = 'https://satc-backend.onrender.com';
const DEFAULT_CENTER = [20.5937, 78.9629];

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const parseCoordinate = (value) => {
  const parsed = typeof value === 'string' ? Number.parseFloat(value) : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const normalizeLivePayload = (payload) => {
  if (!payload) return null;

  const source = payload.location || payload;
  const lat = parseCoordinate(source.lat);
  const lng = parseCoordinate(source.lng ?? source.lon ?? source.longitude);

  if (lat === null || lng === null) return null;
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;

  return {
    truckId: payload.truckId || payload._id || payload.id || null,
    lat,
    lng,
  };
};

const normalizeLocation = (location) => {
  if (!location) return null;

  const lat = parseCoordinate(location.lat);
  const lng = parseCoordinate(location.lng ?? location.lon ?? location.longitude);

  if (lat === null || lng === null) return null;
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;

  return { lat, lng };
};

const uniqueTrucks = (truckList) => {
  const map = new Map();
  truckList.forEach((truck) => {
    if (truck?._id && !map.has(truck._id)) {
      map.set(truck._id, truck);
    }
  });
  return Array.from(map.values());
};

const FlyToLocation = ({ location }) => {
  const map = useMap();

  useEffect(() => {
    if (!location) return;
    map.setView([location.lat, location.lng], map.getZoom(), { animate: true });
  }, [map, location]);

  return null;
};

const TruckMap = ({ location, truckNumber, waiting = false }) => {
  const { t } = useLanguage();
  const center = location ? [location.lat, location.lng] : DEFAULT_CENTER;
  const mapKey = location
    ? `${truckNumber}-${location.lat.toFixed(5)}-${location.lng.toFixed(5)}`
    : `${truckNumber}-waiting`;

  return (
    <div className="truck-map-shell">
      <MapContainer
        key={mapKey}
        center={center}
        zoom={14}
        scrollWheelZoom={true}
        style={{ height: '260px', width: '100%' }}
      >
        {location ? <FlyToLocation location={location} /> : null}
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {location ? (
          <Marker position={[location.lat, location.lng]}>
            <Popup>
              {t('admin.assignTruck.colTruck')} {truckNumber}
              <br />
              {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
            </Popup>
          </Marker>
        ) : null}
      </MapContainer>
      {waiting ? (
        <div className="truck-map-overlay">
          <span>{t('trackTruck.waitingSignal')}</span>
          <small>{t('trackTruck.mapReadyDesc')}</small>
        </div>
      ) : null}
    </div>
  );
};

const TrackTruck = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [trucks, setTrucks] = useState([]);
  const [locations, setLocations] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const socketRef = useRef(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        if (user?.role === 'customer') {
          const [orders, trips] = await Promise.all([getMyOrders(), getTrips()]);

          // Build a map of truckId → trip so we can get the driver from the trip
          const tripByTruckId = {};
          (Array.isArray(trips) ? trips : []).forEach((trip) => {
            const truckId = trip.truck?._id || trip.truck;
            if (truckId) tripByTruckId[String(truckId)] = trip;
          });

          const rawTrucks = (Array.isArray(orders) ? orders : [])
            .map((order) => order.truck)
            .filter(Boolean);

          const merged = uniqueTrucks(rawTrucks).map((truck) => {
            const trip = tripByTruckId[String(truck._id)];
            return {
              ...truck,
              // Prefer driver from the trip (fully populated) over the truck field
              driver: trip?.driver || truck.driver || null,
            };
          });

          const initial = {};
          merged.forEach((truck) => {
            const normalized = normalizeLocation(truck?.location);
            if (normalized) initial[truck._id] = normalized;
          });

          if (active) {
            setTrucks(merged);
            setLocations(initial);
          }
          return;
        }

        const [data, trips] = await Promise.all([getTrucks(), getTrips()]);
        const trucksData = Array.isArray(data) ? data : [];

        // Build trip lookup by truckId to fill in driver if missing on truck doc
        const tripByTruckId = {};
        (Array.isArray(trips) ? trips : []).forEach((trip) => {
          const truckId = trip.truck?._id || trip.truck;
          if (truckId) tripByTruckId[String(truckId)] = trip;
        });

        const filtered =
          user?.role === 'driver'
            ? trucksData.filter((truck) => truck.driver?._id === user?.id || truck.driver === user?.id)
            : trucksData;

        const merged = filtered.map((truck) => {
          const trip = tripByTruckId[String(truck._id)];
          return {
            ...truck,
            driver: truck.driver || trip?.driver || null,
          };
        });

        const initial = {};
        merged.forEach((truck) => {
          const normalized = normalizeLocation(truck?.location);
          if (normalized) {
            initial[truck._id] = normalized;
          }
        });

        if (active) {
          setTrucks(merged);
          setLocations(initial);
        }
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [user?.id, user?.role]);

  useEffect(() => {
    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    const handleLocation = (payload) => {
      const normalized = normalizeLivePayload(payload);
      if (!normalized?.truckId) return;

      setLocations((prev) => ({
        ...prev,
        [normalized.truckId]: { lat: normalized.lat, lng: normalized.lng },
      }));
    };

    socket.on('locationUpdated', handleLocation);
    socket.on('truckLocationUpdated', handleLocation);

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });

    return () => {
      socket.off('locationUpdated', handleLocation);
      socket.off('truckLocationUpdated', handleLocation);
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const trucksWithLocations = useMemo(
    () =>
      trucks.map((truck) => ({
        ...truck,
        liveLocation: locations[truck._id] || normalizeLocation(truck.location),
      })),
    [locations, trucks]
  );

  const headline =
    user?.role === 'admin'
      ? t('trackTruck.headlineAdmin')
      : user?.role === 'driver'
        ? t('trackTruck.headlineDriver')
        : t('trackTruck.headlineCustomer');

  const subline =
    user?.role === 'admin'
      ? t('trackTruck.sublineAdmin')
      : user?.role === 'driver'
        ? t('trackTruck.sublineDriver')
        : t('trackTruck.sublineCustomer');

  if (loading) return <LoadingSpinner />;

  return (
    <div className="dash-page">
      <div className="dash-section-label">{t('trackTruck.trackingLabel')}</div>
      <h2 className="dash-title">{t('trackTruck.liveTrackingTitle')}</h2>
      <div className="track-summary">
        <div>
          <div className="track-summary-title">{headline}</div>
          <div className="track-summary-sub">{subline}</div>
        </div>
        <div className="track-summary-count">{trucksWithLocations.length} {t('trackTruck.trucksCount')}</div>
      </div>
      {error && <ErrorMessage message={error} />}

      <div className="track-grid">
        {trucksWithLocations.map((truck) => {
          const loc = truck.liveLocation;

          return (
            <div key={truck._id} className="dark-card">
              <div className="dark-card-label">🚛 {truck.truckNumber}</div>
              <div className="dark-info-row">
                <span>{t('trackTruck.driverLabel')}</span>
                <span>{truck.driver?.name || t('trackTruck.unassigned')}</span>
              </div>
              <div className="dark-info-row">
                <span>{t('trackTruck.statusLabel')}</span>
                <span style={{ color: truck.isAvailable ? '#10b981' : '#f59e0b' }}>
                  {truck.isAvailable ? t('trackTruck.availableStatus') : t('trackTruck.onTripStatus')}
                </span>
              </div>

              {loc ? (
                <>
                  <div className="dark-info-row">
                    <span>{t('trackTruck.latLabel')}</span>
                    <span style={{ color: '#06b6d4' }}>{loc.lat.toFixed(5)}</span>
                  </div>
                  <div className="dark-info-row">
                    <span>{t('trackTruck.lngLabel')}</span>
                    <span style={{ color: '#06b6d4' }}>{loc.lng.toFixed(5)}</span>
                  </div>
                  <TruckMap location={loc} truckNumber={truck.truckNumber} />
                </>
              ) : (
                <TruckMap truckNumber={truck.truckNumber} waiting />
              )}
            </div>
          );
        })}

        {trucks.length === 0 && (
          <div className="dark-card">
            <div className="customer-tracker-empty">
              <p>{t('trackTruck.noTrucksAvailable')}</p>
              <span>
                {user?.role === 'admin'
                  ? t('trackTruck.emptyDescAdmin')
                  : user?.role === 'driver'
                    ? t('trackTruck.emptyDescDriver')
                    : t('trackTruck.emptyDescCustomer')}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackTruck;
