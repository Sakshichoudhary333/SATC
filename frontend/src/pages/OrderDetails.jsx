import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { io } from 'socket.io-client';

import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import LiveDeliveryTracker from '../components/LiveDeliveryTracker';
import { getOrderById } from '../services/api';

const SOCKET_URL = 'http://localhost:5001';

const isValidMongoId = (value) =>
  typeof value === 'string' && /^[a-fA-F0-9]{24}$/.test(value.trim());

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const socketRef = useRef(null);

  useEffect(() => {
    if (!isValidMongoId(id)) {
      setError('Invalid order id');
      setLoading(false);
      return;
    }

    getOrderById(id)
      .then(setOrder)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!order?._id) return undefined;

    socketRef.current = io(SOCKET_URL);

    socketRef.current.on('locationUpdated', ({ truckId, lat, lng, lastUpdated }) => {
      if (truckId === order.truck?._id) {
        setOrder((prev) =>
          prev
            ? {
                ...prev,
                truck: {
                  ...prev.truck,
                  location: { lat, lng },
                  lastUpdated: lastUpdated || new Date().toISOString(),
                },
              }
            : prev
        );
      }
    });

    socketRef.current.on('tripStatusUpdated', ({ orderId, tripId, status }) => {
      const matchesOrder = orderId === order._id || tripId === order.trip?._id;
      if (!matchesOrder) return;

      setOrder((prev) =>
        prev
          ? {
              ...prev,
              status: status === 'completed' ? 'completed' : status === 'in-transit' ? 'in-transit' : prev.status,
              trip: prev.trip ? { ...prev.trip, status } : { _id: tripId, status },
            }
          : prev
      );
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [order?._id, order?.trip?._id, order?.truck?._id]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!order) return null;

  return (
    <div className="dash-page">
      <div className="dash-section-label">DELIVERY TRACKING</div>
      <div className="dash-title-row">
        <h2 className="dash-title">Order #{order._id.slice(-6)}</h2>
        {order.status === 'completed' && (
          <Link to={`/review/${order._id}`} className="approve-btn" style={{ background: '#f59e0b' }}>
            Leave Review
          </Link>
        )}
      </div>

      <LiveDeliveryTracker order={order} />

      <div style={{ marginTop: '1rem' }}>
        <Link
          to="/dashboard"
          className="approve-btn"
          style={{ background: 'transparent', border: '1px solid #334155' }}
        >
          Back to Orders
        </Link>
      </div>
    </div>
  );
};

export default OrderDetails;
