import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import { getMyOrders, SOCKET_URL } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import LiveDeliveryTracker from '../components/LiveDeliveryTracker';
import { formatDate } from '../utils/helpers';
import { useLanguage } from '../context/LanguageContext';

const STATUS_COLOR = {
  pending: '#f59e0b',
  approved: '#06b6d4',
  rejected: '#ef4444',
  assigned: '#06b6d4',
  started: '#06b6d4',
  'in-transit': '#8b5cf6',
  completed: '#10b981',
};

const getDeliveryStatus = (order) =>
  order.trip?.status === 'completed'
    ? 'completed'
    : order.status === 'completed'
      ? 'completed'
      : order.trip?.status === 'in-transit' || order.trip?.status === 'started'
        ? 'in-transit'
        : order.status === 'approved' || order.status === 'rejected' || order.status === 'pending'
          ? order.status
        : order.truck
          ? 'started'
          : 'pending';

const CustomerDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const socketRef = useRef(null);
  const { t } = useLanguage();

  useEffect(() => {
    getMyOrders()
      .then(setOrders)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL);

    socketRef.current.on('locationUpdated', ({ truckId, lat, lng, lastUpdated }) => {
      setOrders((prev) =>
        prev.map((order) =>
          order.truck?._id === truckId
            ? {
                ...order,
                truck: {
                  ...order.truck,
                  location: { lat, lng },
                  lastUpdated: lastUpdated || new Date().toISOString(),
                },
              }
            : order
        )
      );
    });

    socketRef.current.on('tripStatusUpdated', ({ orderId, tripId, status }) => {
      setOrders((prev) =>
        prev.map((order) => {
          const matchesOrder = order._id === orderId;
          const matchesTrip = order.trip?._id === tripId;

          if (!matchesOrder && !matchesTrip) {
            return order;
          }

          return {
            ...order,
            status: status === 'completed' ? 'completed' : status === 'in-transit' ? 'in-transit' : order.status,
            trip: order.trip
              ? { ...order.trip, status }
              : { _id: tripId, status },
          };
        })
      );
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!socketRef.current || orders.length === 0) return;

    orders.forEach((order) => {
      if (order.truck?._id) {
        socketRef.current.emit('joinTruck', { truckId: order.truck._id });
      }
      if (order.trip?._id) {
        socketRef.current.emit('joinTrip', { tripId: order.trip._id });
      }
    });
  }, [orders]);

  const selectedOrder = useMemo(
    () => orders.find((order) => order._id === selectedOrderId) || null,
    [orders, selectedOrderId]
  );

  const liveOrder = useMemo(
    () => orders.find((order) => order.truck && order.status !== 'completed') || orders.find((order) => order.truck) || orders[0] || null,
    [orders]
  );

  const spotlightOrder = selectedOrder || liveOrder;

  if (loading) return <LoadingSpinner />;

  return (
    <div className="dash-page">
      <div className="dash-section-label">{t('customerDashboard.orders')}</div>
      <div className="dash-title-row">
        <h2 className="dash-title">{t('customerDashboard.myOrders')}</h2>
        <Link to="/place-order" className="approve-btn">{t('customerDashboard.newOrder')}</Link>
      </div>
      {error && <ErrorMessage message={error} />}

      <div className="dark-card customer-tracker-panel">
        <div className="dark-card-label">{t('customerDashboard.liveDelivery')}</div>
        {spotlightOrder?.truck ? (
          <>
            <div className="customer-tracker-meta">
              <div className="customer-tracker-kv">
                <span className="customer-tracker-label">{t('customerDashboard.assignedTruck')}</span>
                <span className="customer-tracker-value">
                  {spotlightOrder.truck.truckNumber}
                  {spotlightOrder.truck.model ? ` • ${spotlightOrder.truck.model}` : ''}
                </span>
              </div>
              <div className="customer-tracker-kv">
                <span className="customer-tracker-label">{t('customerDashboard.driver')}</span>
                <span className="customer-tracker-value">
                  {spotlightOrder.driver?.name || t('customerDashboard.unassigned')}
                </span>
              </div>
              <div className="customer-tracker-kv">
                <span className="customer-tracker-label">{t('customerDashboard.deliveryStatus')}</span>
                <span
                  className="status-badge"
                  style={{
                    background: `${STATUS_COLOR[getDeliveryStatus(spotlightOrder)] || '#94a3b8'}22`,
                    color: STATUS_COLOR[getDeliveryStatus(spotlightOrder)] || '#94a3b8',
                    width: 'fit-content',
                  }}
                >
                  {getDeliveryStatus(spotlightOrder).replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                </span>
              </div>
              <div className="customer-tracker-kv">
                <span className="customer-tracker-label">{t('customerDashboard.lastGps')}</span>
                <span className="customer-tracker-value">
                  {spotlightOrder.truck.lastUpdated ? new Date(spotlightOrder.truck.lastUpdated).toLocaleString() : t('customerDashboard.waitingForUpdate')}
                </span>
              </div>
            </div>

            <div className="customer-tracker-meta customer-tracker-meta-tight">
              <div className="customer-tracker-kv">
                <span className="customer-tracker-label">{t('customerDashboard.pickup')}</span>
                <span className="customer-tracker-value">{spotlightOrder.pickupLocation}</span>
              </div>
              <div className="customer-tracker-kv">
                <span className="customer-tracker-label">{t('customerDashboard.destination')}</span>
                <span className="customer-tracker-value">{spotlightOrder.destination}</span>
              </div>
              <div className="customer-tracker-kv">
                <span className="customer-tracker-label">{t('customerDashboard.truckCapacity')}</span>
                <span className="customer-tracker-value">{spotlightOrder.truck.capacity || '—'}</span>
              </div>
              <div className="customer-tracker-kv">
                <span className="customer-tracker-label">{t('customerDashboard.truckLocation')}</span>
                <span className="customer-tracker-value">
                  {spotlightOrder.truck.location
                    ? `${Number(spotlightOrder.truck.location.lat).toFixed(5)}, ${Number(spotlightOrder.truck.location.lng).toFixed(5)}`
                    : t('customerDashboard.unavailable')}
                </span>
              </div>
            </div>

            <div className="customer-tracker-actions">
              <Link to={`/order/${spotlightOrder._id}`} className="approve-btn">
                {t('customerDashboard.viewOrder')}
              </Link>
              {spotlightOrder.status === 'completed' && (
                <Link
                  to={`/review/${spotlightOrder._id}`}
                  className="approve-btn"
                  style={{ background: '#f59e0b' }}
                >
                  {t('customerDashboard.leaveReview')}
                </Link>
              )}
            </div>

            <LiveDeliveryTracker order={spotlightOrder} />
          </>
        ) : (
          <div className="customer-tracker-empty">
            <p>{t('customerDashboard.noTruckAssigned')}</p>
            <span>{t('customerDashboard.noTruckAssignedDesc')}</span>
          </div>
        )}
      </div>

      <div className="dark-table-wrap">
        <table className="dark-table">
          <thead>
            <tr>
              <th>{t('customerDashboard.orderIdCol')}</th>
              <th>{t('customerDashboard.pickupCol')}</th>
              <th>{t('customerDashboard.dropCol')}</th>
              <th>{t('customerDashboard.orderStatusCol')}</th>
              <th>{t('customerDashboard.deliveryStatusCol')}</th>
              <th>{t('customerDashboard.driverCol')}</th>
              <th>{t('customerDashboard.dateCol')}</th>
              <th>{t('customerDashboard.actionCol')}</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const deliveryStatus = getDeliveryStatus(order);
              const trackable = Boolean(order.truck || order.status === 'completed');

              return (
                <Fragment key={order._id}>
                  <tr
                    style={{ cursor: trackable ? 'pointer' : 'default' }}
                    onClick={() => {
                      if (trackable) {
                        setSelectedOrderId(order._id);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                  >
                    <td><code style={{ color: '#06b6d4' }}>{order._id.slice(-6)}</code></td>
                    <td>{order.pickupLocation}</td>
                    <td>{order.destination}</td>
                    <td>
                      <span
                        className="status-badge"
                        style={{
                          background: `${STATUS_COLOR[order.status] || '#94a3b8'}22`,
                          color: STATUS_COLOR[order.status] || '#94a3b8',
                        }}
                      >
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td>
                      <span
                        className="status-badge"
                        style={{
                          background: `${STATUS_COLOR[deliveryStatus] || '#94a3b8'}22`,
                          color: STATUS_COLOR[deliveryStatus] || '#94a3b8',
                        }}
                      >
                        {deliveryStatus.charAt(0).toUpperCase() + deliveryStatus.slice(1)}
                      </span>
                    </td>
                    <td style={{ color: '#cbd5e1', fontWeight: 500 }}>
                      {order.driver?.name || order.trip?.driver?.name || (
                        <span style={{ color: '#64748b', fontStyle: 'italic' }}>{t('customerDashboard.unassigned')}</span>
                      )}
                    </td>
                    <td>{formatDate(order.createdAt)}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      {order.truck && order.status !== 'completed' && (
                        <Link
                          to={`/track/truck/${order.truck._id}?orderId=${order._id}`}
                          className="approve-btn"
                          style={{ marginRight: '6px', padding: '0.3rem 0.75rem', background: '#8b5cf6', textDecoration: 'none', display: 'inline-block' }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {t('customerDashboard.trackBtn')}
                        </Link>
                      )}
                      {order.status !== 'completed' && (
                        <Link
                          to={`/order/${order._id}`}
                          className="approve-btn"
                          style={{ marginRight: '6px', padding: '0.3rem 0.75rem' }}
                        >
                          {t('customerDashboard.viewBtn')}
                        </Link>
                      )}
                      {order.status === 'completed' && (
                        <Link
                          to={`/review/${order._id}`}
                          className="approve-btn"
                          style={{ background: '#f59e0b', padding: '0.3rem 0.75rem' }}
                        >
                          {t('customerDashboard.reviewBtn')}
                        </Link>
                      )}
                    </td>
                  </tr>
                </Fragment>
              );
            })}
            {orders.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>
                  {t('customerDashboard.noOrdersYet')} <Link to="/place-order" style={{ color: '#06b6d4' }}>{t('customerDashboard.placeFirstOrder')}</Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomerDashboard;
