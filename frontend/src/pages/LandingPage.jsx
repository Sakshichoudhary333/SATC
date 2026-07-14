import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import LanguageSelector from '../components/LanguageSelector';
import { getTruckById, getTruckActiveTrip, getPublicTrucks, getTruckETA } from '../services/api';
import { 
  FaTruck, 
  FaMapMarkerAlt, 
  FaBoxes, 
  FaCogs, 
  FaChartLine, 
  FaArrowRight, 
  FaStar, 
  FaRoute,
  FaShieldAlt,
  FaFileInvoiceDollar
} from 'react-icons/fa';
import { 
  MdSpeed, 
  MdOutlineSupportAgent 
} from 'react-icons/md';
import './LandingPage.css';

// Mock database for tracking simulation
const MOCK_TRACKING_DATA = {
  'tms-882': {
    id: 'TMS-882',
    origin: 'Mumbai Hub (BCT)',
    destination: 'New Delhi Logistics Park',
    status: 'transit',
    location: 'National Highway 48 (near Jaipur)',
    speed: '65 km/h',
    distance: 245,
    eta: '3 hours 40 mins',
    steps: [
      { key: 'placed', time: 'Yesterday, 09:15 AM', state: 'completed' },
      { key: 'assigned', time: 'Yesterday, 11:30 AM', state: 'completed' },
      { key: 'transit', time: 'Live Updates Active', state: 'active' },
      { key: 'delivered', time: 'Estimated: Today, 07:30 PM', state: 'pending' }
    ]
  },
  'tms-104': {
    id: 'TMS-104',
    origin: 'Bengaluru Fulfillment Center',
    destination: 'Chennai Port Depot',
    status: 'delivered',
    location: 'Chennai Port Terminal gate 3',
    speed: '0 km/h (Stopped)',
    distance: 0,
    eta: 'Delivered (OTP Verified)',
    steps: [
      { key: 'placed', time: 'July 12, 08:00 AM', state: 'completed' },
      { key: 'assigned', time: 'July 12, 10:00 AM', state: 'completed' },
      { key: 'transit', time: 'July 12, 11:30 AM', state: 'completed' },
      { key: 'delivered', time: 'July 13, 03:45 PM', state: 'completed' }
    ]
  }
};

const LandingPage = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trackId, setTrackId] = useState('');
  const [simulatedData, setSimulatedData] = useState(null);
  const [searchError, setSearchError] = useState('');
  const [activeTab, setActiveTab] = useState('how-it-works');


  // Load default simulation on mount
  useEffect(() => {
    setSimulatedData(MOCK_TRACKING_DATA['tms-882']);
  }, []);

  const handleTrackSubmit = async (e) => {
    e.preventDefault();
    setSearchError('');
    
    const query = trackId.trim();
    if (!query) {
      setSimulatedData(MOCK_TRACKING_DATA['tms-882']);
      return;
    }

    const queryLower = query.toLowerCase();
    if (MOCK_TRACKING_DATA[queryLower]) {
      setSimulatedData(MOCK_TRACKING_DATA[queryLower]);
      return;
    }

    // 1. Clean query input (extract hex ID if a full tracking URL is pasted)
    let cleanQuery = query;
    const urlMatch = query.match(/\/track\/truck\/([a-fA-F0-9]+)/);
    if (urlMatch) {
      cleanQuery = urlMatch[1];
    }
    const cleanQueryLower = cleanQuery.toLowerCase();

    // 2. Fetch all trucks via public endpoint to support prefix matching (truncated IDs) or license numbers
    try {
      const trucksList = await getPublicTrucks();
      const matchedTruck = trucksList.find(truck => {
        const idLower = truck._id.toLowerCase();
        const numberLower = truck.truckNumber.toLowerCase();
        return idLower === cleanQueryLower || 
               idLower.startsWith(cleanQueryLower) || 
               numberLower === cleanQueryLower ||
               numberLower.replace(/[^a-z0-9]/g, '') === cleanQueryLower.replace(/[^a-z0-9]/g, '');
      });

      if (matchedTruck) {
        let tripData = null;
        let realDistance = null;
        let realEtaStr = 'Calculating...';
        try {
          tripData = await getTruckActiveTrip(matchedTruck._id);
          if (tripData && tripData.status === 'in-transit' && tripData.order?.destination) {
            try {
              let queryAddr = tripData.order.destination.trim();
              if (!queryAddr.toLowerCase().includes('india')) {
                queryAddr += ', India';
              }
              const geocodeRes = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(queryAddr)}&format=json&limit=1`
              );
              const geocodeData = await geocodeRes.json();
              if (geocodeData?.[0]) {
                const destLat = parseFloat(geocodeData[0].lat);
                const destLng = parseFloat(geocodeData[0].lon);
                const etaData = await getTruckETA(matchedTruck._id, destLat, destLng);
                if (etaData) {
                  realDistance = Math.round(etaData.distance);
                  if (etaData.eta) {
                    const hours = etaData.eta.hours || 0;
                    const mins = etaData.eta.minutes || 0;
                    realEtaStr = `${hours}h ${mins}m`;
                  }
                }
              }
            } catch (etaErr) {
              console.log('Error calculating live ETA coordinates:', etaErr);
            }
          }
        } catch (tripErr) {
          console.log('No active trip for this matched truck:', tripErr);
        }

        const isCompleted = tripData?.status === 'completed';
        const isInTransit = tripData?.status === 'in-transit';

        const realData = {
          id: matchedTruck.truckNumber || matchedTruck._id,
          realId: matchedTruck._id,
          origin: tripData?.order?.pickupLocation || 'Awaiting Dispatch Point',
          destination: tripData?.order?.destination || 'Awaiting Delivery Point',
          status: isCompleted ? 'delivered' : 'transit',
          location: matchedTruck.location?.lat ? `${matchedTruck.location.lat.toFixed(4)}, ${matchedTruck.location.lng.toFixed(4)}` : 'No GPS signal yet',
          speed: isInTransit ? '65 km/h' : '0 km/h (Stopped)',
          distance: isCompleted ? 0 : realDistance || (isInTransit ? 245 : null),
          eta: isCompleted ? 'Delivered' : isInTransit ? realEtaStr : 'Awaiting Dispatch',
          isReal: true,
          steps: [
            { key: 'placed', time: tripData ? 'Order placed' : 'Awaiting assignment', state: 'completed' },
            { key: 'assigned', time: matchedTruck.driver?.name ? `Driver: ${matchedTruck.driver.name}` : 'No driver assigned', state: 'completed' },
            { key: 'transit', time: isCompleted ? 'Completed transit' : isInTransit ? 'Active transport' : 'Pending transit', state: isCompleted ? 'completed' : isInTransit ? 'active' : 'pending' },
            { key: 'delivered', time: isCompleted ? 'Delivered' : 'Awaiting delivery', state: isCompleted ? 'completed' : 'pending' }
          ]
        };
        setSimulatedData(realData);
        return;
      }
    } catch (dbErr) {
      console.error('Error fetching all trucks list:', dbErr);
    }

    // 3. Fallback: Search strictly by direct 24-character MongoDB ID if fuzzy list matching failed
    const isValidMongoId = /^[a-fA-F0-9]{24}$/.test(cleanQuery);
    if (isValidMongoId) {
      try {
        const truckData = await getTruckById(cleanQuery);
        let tripData = null;
        let realDistance = null;
        let realEtaStr = 'Calculating...';
        try {
          tripData = await getTruckActiveTrip(cleanQuery);
          if (tripData && tripData.status === 'in-transit' && tripData.order?.destination) {
            try {
              let queryAddr = tripData.order.destination.trim();
              if (!queryAddr.toLowerCase().includes('india')) {
                queryAddr += ', India';
              }
              const geocodeRes = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(queryAddr)}&format=json&limit=1`
              );
              const geocodeData = await geocodeRes.json();
              if (geocodeData?.[0]) {
                const destLat = parseFloat(geocodeData[0].lat);
                const destLng = parseFloat(geocodeData[0].lon);
                const etaData = await getTruckETA(cleanQuery, destLat, destLng);
                if (etaData) {
                  realDistance = Math.round(etaData.distance);
                  if (etaData.eta) {
                    const hours = etaData.eta.hours || 0;
                    const mins = etaData.eta.minutes || 0;
                    realEtaStr = `${hours}h ${mins}m`;
                  }
                }
              }
            } catch (etaErr) {
              console.log('Error calculating live ETA coordinates:', etaErr);
            }
          }
        } catch (tripErr) {
          console.log('No active trip or details:', tripErr);
        }

        const isCompleted = tripData?.status === 'completed';
        const isInTransit = tripData?.status === 'in-transit';

        const realData = {
          id: truckData.truckNumber || truckData._id,
          realId: truckData._id,
          origin: tripData?.order?.pickupLocation || 'Awaiting Dispatch Point',
          destination: tripData?.order?.destination || 'Awaiting Delivery Point',
          status: isCompleted ? 'delivered' : 'transit',
          location: truckData.location?.lat ? `${truckData.location.lat.toFixed(4)}, ${truckData.location.lng.toFixed(4)}` : 'No GPS signal yet',
          speed: isInTransit ? '65 km/h' : '0 km/h (Stopped)',
          distance: isCompleted ? 0 : realDistance || (isInTransit ? 245 : null),
          eta: isCompleted ? 'Delivered' : isInTransit ? realEtaStr : 'Awaiting Dispatch',
          isReal: true,
          steps: [
            { key: 'placed', time: tripData ? 'Order placed' : 'Awaiting assignment', state: 'completed' },
            { key: 'assigned', time: truckData.driver?.name ? `Driver: ${truckData.driver.name}` : 'No driver assigned', state: 'completed' },
            { key: 'transit', time: isCompleted ? 'Completed transit' : isInTransit ? 'Active transport' : 'Pending transit', state: isCompleted ? 'completed' : isInTransit ? 'active' : 'pending' },
            { key: 'delivered', time: isCompleted ? 'Delivered' : 'Awaiting delivery', state: isCompleted ? 'completed' : 'pending' }
          ]
        };
        setSimulatedData(realData);
        return;
      } catch (err) {
        setSearchError('Truck not found in database. Showing simulation fallback.');
      }
    }

    // 4. Fallback simulation (default for non-matching inputs)
    const randomSeed = cleanQuery.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const isDelivered = randomSeed % 2 === 0;
    const generated = {
      id: cleanQuery.toUpperCase(),
      origin: randomSeed % 3 === 0 ? 'Kolkata Depot' : randomSeed % 3 === 1 ? 'Hyderabad Zone A' : 'Pune Hub',
      destination: randomSeed % 2 === 0 ? 'Ahmedabad Plaza' : 'Kochi Terminus',
      status: isDelivered ? 'delivered' : 'transit',
      location: isDelivered ? 'Destination Warehouse' : 'State Highway 9, Sector ' + (randomSeed % 10 + 1),
      speed: isDelivered ? '0 km/h (Parked)' : (50 + (randomSeed % 30)) + ' km/h',
      distance: isDelivered ? 0 : (50 + (randomSeed % 250)),
      eta: isDelivered ? 'Completed' : (1 + (randomSeed % 12)) + ' hours remaining',
      steps: [
        { key: 'placed', time: 'Date: 2 days ago', state: 'completed' },
        { key: 'assigned', time: 'Date: 1 day ago', state: 'completed' },
        { key: 'transit', time: isDelivered ? 'Date: Yesterday' : 'Active tracking...', state: isDelivered ? 'completed' : 'active' },
        { key: 'delivered', time: isDelivered ? 'Date: Today' : 'Scheduled soon', state: isDelivered ? 'completed' : 'pending' }
      ]
    };
    setSimulatedData(generated);
  };

  const getStepTitle = (key) => {
    const titles = {
      placed: t('landing.mockOrderPlaced'),
      assigned: t('landing.mockAssigned'),
      transit: t('landing.mockTransit'),
      delivered: t('landing.mockDelivered')
    };
    return titles[key] || key;
  };

  const handleGetStarted = () => {
    if (user) {
      const routeMap = {
        admin: '/admin',
        driver: '/driver',
        customer: '/dashboard',
      };
      navigate(routeMap[user.role] || '/dashboard');
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="landing-container">
      {/* Navigation Header */}
      <header className="landing-header">
        <div className="landing-logo">
          <FaTruck size={26} color="var(--cyan)" />
          TMS<span>Logistics</span>
        </div>
        
        <div className="landing-nav-actions">
          <Link to="/features" className="landing-nav-link">{t('landing.features') || 'Features'}</Link>
          <Link to="/how-it-works" className="landing-nav-link">{t('landing.howItWorks') || 'How It Works'}</Link>
          <a href="#tracking-simulator" className="landing-nav-link">{t('landing.trackShipment')}</a>
          <Link to="/contact" className="landing-nav-link">{t('landing.contactUs') || 'Contact Us'}</Link>
          
          <LanguageSelector />
          
          {user ? (
            <button className="landing-btn-signup" onClick={handleGetStarted}>
              {t('nav.dashboard')}
            </button>
          ) : (
            <>
              <Link to="/login" className="landing-btn-login">{t('landing.signIn')}</Link>
              <button className="landing-btn-signup" onClick={handleGetStarted}>{t('landing.getStarted')}</button>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="landing-hero-content">
          <div className="landing-hero-badge">
            ⚡ {t('common.logisticsControl')}
          </div>
          <h1 className="landing-hero-title">
            <span className="landing-gradient-text">{t('landing.heroTitle')}</span>
          </h1>
          <p className="landing-hero-sub">
            {t('landing.heroSub')}
          </p>
          <div className="landing-hero-ctas">
            <button className="landing-hero-btn-primary" onClick={handleGetStarted}>
              {t('landing.getStarted')} <FaArrowRight size={14} />
            </button>
            <a href="#tracking-simulator" className="landing-hero-btn-secondary">
              {t('landing.trackShipment')}
            </a>
          </div>
        </div>

        {/* Interactive Tracking Simulator on Hero Grid */}
        <div className="landing-interactive-showcase" id="tracking-simulator">
          <div className="landing-glass-card">
            <div className="landing-glass-card-header">
              <span className="landing-card-label">{t('landing.trackingTitle')}</span>
              <h3 className="landing-card-title">{t('landing.trackShipment')}</h3>
              <p className="landing-card-desc">{t('landing.trackingDesc')}</p>
            </div>

            <form onSubmit={handleTrackSubmit} className="landing-search-box">
              <input 
                type="text" 
                className="landing-search-input" 
                placeholder={t('landing.trackPlaceholder')} 
                value={trackId}
                onChange={(e) => setTrackId(e.target.value)}
              />
              <button type="submit" className="landing-search-btn">
                {t('landing.trackBtn').split(' ')[0]}
              </button>
            </form>

            {searchError && (
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#f87171', borderRadius: '8px', padding: '0.75rem', marginBottom: '1rem', fontSize: '0.85rem', textAlign: 'center' }}>
                ⚠️ {searchError}
              </div>
            )}

            {simulatedData && (
              <div className="landing-tracker-result">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                  <span style={{ fontWeight: '700', color: 'var(--cyan)' }}>ID: {simulatedData.id}</span>
                  <span style={{ fontSize: '0.8rem', color: simulatedData.status === 'delivered' ? '#10b981' : 'var(--cyan)' }}>
                    ● {simulatedData.status === 'delivered' ? t('landing.mockDelivered') : t('landing.mockTransit')}
                  </span>
                </div>

                <div className="landing-timeline">
                  {simulatedData.steps.map((step, idx) => (
                    <div key={idx} className={`landing-timeline-step ${step.state}`}>
                      <div className="landing-timeline-dot">
                        {step.state === 'completed' ? '✓' : idx + 1}
                      </div>
                      <div className="landing-timeline-content">
                        <div className="landing-timeline-title">{getStepTitle(step.key)}</div>
                        <div className="landing-timeline-time">{step.time}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="landing-tracker-meta" style={{ gridTemplateColumns: '1.2fr 1fr 1fr' }}>
                  <div className="landing-meta-item">
                    <span className="landing-meta-label">{t('landing.mockLocation')}</span>
                    <span className="landing-meta-value" style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {simulatedData.location}
                    </span>
                  </div>
                  <div className="landing-meta-item">
                    <span className="landing-meta-label">{t('landing.mockDistance') || 'Distance'}</span>
                    <span className="landing-meta-value">
                      {simulatedData.distance !== undefined && simulatedData.distance !== null ? `${simulatedData.distance} km` : '—'}
                    </span>
                  </div>
                  <div className="landing-meta-item">
                    <span className="landing-meta-label">{t('landing.mockEta')}</span>
                    <span className="landing-meta-value">{simulatedData.eta}</span>
                  </div>
                </div>

                {simulatedData.isReal && (
                  <div style={{ marginTop: '1.25rem' }}>
                    <Link 
                      to={`/track/truck/${simulatedData.realId}`} 
                      className="landing-search-btn" 
                      style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}
                    >
                      🎯 {t('liveTruckTrack.liveTracker')}
                    </Link>
                  </div>
                )}
              </div>
            )}
            <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.75rem', color: 'var(--dim)' }}>
              💡 {t('landing.mockInfo')}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="landing-stats-section">
        <div className="landing-stats-grid">
          <div className="landing-stat-card">
            <div className="landing-stat-icon">📈</div>
            <div className="landing-stat-num">10M+</div>
            <div className="landing-stat-label">{t('landing.statDelivered')}</div>
          </div>
          <div className="landing-stat-card">
            <div className="landing-stat-icon">🚚</div>
            <div className="landing-stat-num">5,420</div>
            <div className="landing-stat-label">{t('landing.statActive')}</div>
          </div>
          <div className="landing-stat-card">
            <div className="landing-stat-icon">⚡</div>
            <div className="landing-stat-num">&lt; 150ms</div>
            <div className="landing-stat-label">{t('landing.statPing')}</div>
          </div>
          <div className="landing-stat-card">
            <div className="landing-stat-icon">⭐</div>
            <div className="landing-stat-num">4.92 / 5</div>
            <div className="landing-stat-label">{t('landing.statSatisfaction')}</div>
          </div>
        </div>
      </section>

      {/* Features Showcase Section */}
      <section className="landing-features-section" id="features">
        <div className="landing-section-container">
          <div className="landing-section-header">
            <h2 className="landing-section-title">{t('landing.featuresTitle')}</h2>
            <p className="landing-section-sub">{t('landing.featuresSub')}</p>
          </div>

          <div className="landing-features-grid">
            <div className="landing-feature-card">
              <div className="landing-feat-icon-container">
                <FaRoute />
              </div>
              <h3 className="landing-feature-title">{t('landing.featTrackingTitle')}</h3>
              <p className="landing-feature-desc">{t('landing.featTrackingDesc')}</p>
            </div>

            <div className="landing-feature-card">
              <div className="landing-feat-icon-container">
                <FaCogs />
              </div>
              <h3 className="landing-feature-title">{t('landing.featFleetTitle')}</h3>
              <p className="landing-feature-desc">{t('landing.featFleetDesc')}</p>
            </div>

            <div className="landing-feature-card">
              <div className="landing-feat-icon-container">
                <FaFileInvoiceDollar />
              </div>
              <h3 className="landing-feature-title">{t('landing.featReportsTitle')}</h3>
              <p className="landing-feature-desc">{t('landing.featReportsDesc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works / Workflow Steps */}
      <section className="landing-workflow-section" id="how-it-works">
        <div className="landing-section-header">
          <h2 className="landing-section-title">{t('landing.howItWorks')}</h2>
          <p className="landing-section-sub">{t('landing.howItWorksSub')}</p>
        </div>

        <div className="landing-workflow-grid">
          <div className="landing-workflow-card">
            <div className="landing-workflow-num">01</div>
            <h3 className="landing-workflow-title">{t('landing.step1Title').replace(/^\d+\.\s*/, '')}</h3>
            <p className="landing-workflow-desc">{t('landing.step1Desc')}</p>
          </div>

          <div className="landing-workflow-card">
            <div className="landing-workflow-num">02</div>
            <h3 className="landing-workflow-title">{t('landing.step2Title').replace(/^\d+\.\s*/, '')}</h3>
            <p className="landing-workflow-desc">{t('landing.step2Desc')}</p>
          </div>

          <div className="landing-workflow-card">
            <div className="landing-workflow-num">03</div>
            <h3 className="landing-workflow-title">{t('landing.step3Title').replace(/^\d+\.\s*/, '')}</h3>
            <p className="landing-workflow-desc">{t('landing.step3Desc')}</p>
          </div>

          <div className="landing-workflow-card">
            <div className="landing-workflow-num">04</div>
            <h3 className="landing-workflow-title">{t('landing.step4Title').replace(/^\d+\.\s*/, '')}</h3>
            <p className="landing-workflow-desc">{t('landing.step4Desc')}</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          <div className="landing-footer-brand">
            <div className="landing-logo">
              <FaTruck size={22} color="var(--cyan)" />
              TMS<span>Logistics</span>
            </div>
            <p className="landing-footer-desc">
              {t('auth.tagline')}
            </p>
          </div>

          <div>
            <h4 className="landing-footer-title">Platform</h4>
            <div className="landing-footer-links">
              <Link to="/features">{t('landing.features') || 'Features'}</Link>
              <Link to="/how-it-works">{t('landing.howItWorks') || 'How It Works'}</Link>
              <Link to="/#tracking-simulator">{t('landing.trackShipment')}</Link>
            </div>
          </div>

          <div>
            <h4 className="landing-footer-title">{t('landing.company') || 'Company'}</h4>
            <div className="landing-footer-links">
              <Link to="/about">{t('landing.aboutUs') || 'About Us'}</Link>
              <Link to="/contact">{t('landing.contactUs') || 'Contact Us'}</Link>
              <Link to="/careers">{t('landing.careers') || 'Careers'}</Link>
              <Link to="/faq">{t('landing.faq') || 'FAQ'}</Link>
            </div>
          </div>

          <div>
            <h4 className="landing-footer-title">SECURE & RELIABLE</h4>
            <div className="landing-footer-links" style={{ color: 'var(--muted)', fontSize: '0.875rem', gap: '0.65rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                Secure Authentication
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                Live GPS Tracking
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                Smart Trip Management
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                Expense Monitoring
              </div>
            </div>
          </div>

          <div id="contact-details">
            <h4 className="landing-footer-title">{t('landing.contactUs') || 'Contact Us'}</h4>
            <div className="landing-footer-links" style={{ color: 'var(--muted)', fontSize: '0.875rem', gap: '0.6rem' }}>
              <div>
                <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--dim)', fontWeight: 700 }}>Email</span>
                <a href="mailto:choudharysakshi828@gmail.com" style={{ color: 'var(--muted)' }}>choudharysakshi828@gmail.com</a>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--dim)', fontWeight: 700 }}>Phone</span>
                <a href="tel:+919664372498" style={{ color: 'var(--muted)' }}>+91-9664372498</a>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--dim)', fontWeight: 700 }}>Address</span>
                <span>Mansarovar, Jaipur</span>
              </div>
            </div>
          </div>

        </div>

        <div className="landing-footer-bottom">
          <span>&copy; {new Date().getFullYear()} TMS Logistics Inc. All rights reserved.</span>
          <span style={{ display: 'flex', gap: '1rem' }}>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </span>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
