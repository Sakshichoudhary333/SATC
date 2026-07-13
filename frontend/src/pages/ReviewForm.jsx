import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { addReview } from '../services/api';
import StarRating from '../components/StarRating';
import ErrorMessage from '../components/ErrorMessage';
import {FaStar} from "react-icons/fa";

const isValidMongoId = (value) =>
  typeof value === 'string' && /^[a-fA-F0-9]{24}$/.test(value.trim());

const ReviewForm = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return setError('Please select a rating.');
    if (!isValidMongoId(orderId)) return setError('Invalid order id.');
    const trimmedFeedback = feedback.trim();
    if (trimmedFeedback.length > 1000) return setError('Feedback must be at most 1000 characters.');
    setError(''); setLoading(true);
    try {
      await addReview({ order: orderId, rating, feedback: trimmedFeedback });
      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="dash-page">
        <div className="dark-card" style={{ maxWidth: '420px', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}></div>
          <FaStar size={48} color="#facc15" style={{ marginBottom: '1rem' }} />
          <h3 style={{ color: '#e2e8f0', marginBottom: '0.5rem' }}>Thank you!</h3>
          <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>Your review has been submitted.</p>
          <button className="approve-btn" onClick={() => navigate('/dashboard')}>Back to Orders</button>
        </div>
      </div>
    );
  }

  return (
    <div className="dash-page">
      <div className="dash-section-label">REVIEWS</div>
      <h2 className="dash-title">Rate Your Delivery</h2>
      {error && <ErrorMessage message={error} />}
      <div className="dark-card" style={{ maxWidth: '480px' }}>
        <form onSubmit={handleSubmit}>
          <div className="dark-form-group">
            <label>Your Rating</label>
            <StarRating value={rating} onChange={setRating} />
          </div>
          <div className="dark-form-group">
            <label>Feedback</label>
            <textarea className="dark-input" value={feedback} onChange={(e) => setFeedback(e.target.value)} rows={4} placeholder="Tell us about your experience..." />
          </div>
          <button type="submit" className="approve-btn" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReviewForm;
