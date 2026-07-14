import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTruck, FaShieldAlt, FaPlusCircle, FaUserCheck, FaMapMarkerAlt, FaRoute, FaCheckCircle, FaChartLine } from 'react-icons/fa';
import { MdSpeed, MdOutlineSupportAgent } from 'react-icons/md';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import LanguageSelector from '../components/LanguageSelector';
import './LandingPage.css'; // Reuse landing layout
import './HowItWorks.css';

const HowItWorks = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

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

  const stepsData = [
    {
      num: "01",
      icon: <FaPlusCircle />,
      title: "Create a Shipment",
      desc: "Customers submit shipment details, including pickup and delivery locations, cargo information, and preferred delivery schedule."
    },
    {
      num: "02",
      icon: <FaUserCheck />,
      title: "Assign Driver & Vehicle",
      desc: "The administrator reviews the shipment request and assigns the most suitable driver and truck based on availability and operational requirements."
    },
    {
      num: "03",
      icon: <FaRoute />,
      title: "Start the Journey",
      desc: "The assigned driver begins the trip, updates the shipment status, and shares live GPS location through the platform."
    },
    {
      num: "04",
      icon: <FaMapMarkerAlt />,
      title: "Track in Real Time",
      desc: "Customers and administrators can monitor the shipment's progress, receive live location updates, and stay informed throughout the delivery process."
    },
    {
      num: "05",
      icon: <FaCheckCircle />,
      title: "Complete Delivery",
      desc: "Once the shipment reaches its destination, the driver marks the trip as completed, and the customer receives confirmation of successful delivery."
    },
    {
      num: "06",
      icon: <FaChartLine />,
      title: "Review & Analytics",
      desc: "Customers can rate their delivery experience, while administrators access trip reports, expense records, and performance insights to improve future operations."
    }
  ];

  return (
    <div className="landing-container">
      {/* Navigation Header */}
      <header className="landing-header">
        <Link to="/" className="landing-logo" style={{ textDecoration: 'none' }}>
          <FaTruck size={26} color="var(--cyan)" />
          TMS<span>Logistics</span>
        </Link>
        
        <div className="landing-nav-actions">
          <Link to="/" className="landing-nav-link">Home</Link>
          <Link to="/about" className="landing-nav-link">About</Link>
          <Link to="/features" className="landing-nav-link">Features</Link>
          <Link to="/careers" className="landing-nav-link">Careers</Link>
          <Link to="/faq" className="landing-nav-link">FAQ</Link>
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
      <section className="hiw-hero-section">
        <div className="hiw-hero-glow"></div>
        <div className="hiw-container">
          <h1 className="hiw-main-title">How It Works</h1>
          <p className="hiw-intro-text">
            Our platform simplifies the entire logistics process by connecting customers, administrators, and drivers through one centralized system.
          </p>
        </div>
      </section>

      {/* Steps Lifecycle Section */}
      <section className="hiw-steps-section">
        <div className="hiw-container">
          <div className="hiw-timeline">
            
            {stepsData.map((step, idx) => (
              <div key={idx} className="hiw-timeline-item">
                <div className="hiw-timeline-num-col">
                  <div className="hiw-timeline-circle">
                    <span className="hiw-step-num">{step.num}</span>
                  </div>
                  {idx !== stepsData.length - 1 && <div className="hiw-timeline-line"></div>}
                </div>
                
                <div className="hiw-timeline-content-col">
                  <div className="hiw-step-card">
                    <div className="hiw-step-header">
                      <div className="hiw-step-icon">{step.icon}</div>
                      <h3 className="hiw-step-title">{step.title}</h3>
                    </div>
                    <p className="hiw-step-desc">{step.desc}</p>
                  </div>
                </div>
              </div>
            ))}

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

export default HowItWorks;
