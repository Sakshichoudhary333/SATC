import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTruck, FaShieldAlt, FaRoute, FaCogs, FaFileInvoiceDollar, FaCheckCircle, FaGlobe, FaEye } from 'react-icons/fa';
import { MdSpeed, MdOutlineSupportAgent } from 'react-icons/md';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import LanguageSelector from '../components/LanguageSelector';
import './LandingPage.css'; // Reuse landing styling for layout and themes
import './AboutUs.css';

const AboutUs = () => {
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

  return (
    <div className="landing-container">
      {/* Navigation Header */}
      <header className="landing-header">
        <Link to="/" className="landing-logo" style={{ textDecoration: 'none' }}>
          <FaTruck size={26} color="var(--cyan)" />
          TMS<span>Logistics</span>
        </Link>
        
        <div className="landing-nav-actions">
          <Link to="/" className="landing-nav-link">{t('common.home')}</Link>
          <Link to="/about" className="landing-nav-link">{t('landing.aboutUs')}</Link>
          <Link to="/careers" className="landing-nav-link">{t('landing.careers')}</Link>
          <Link to="/faq" className="landing-nav-link">{t('landing.faq')}</Link>
          <Link to="/features" className="landing-nav-link">{t('landing.features') || 'Features'}</Link>
          <Link to="/how-it-works" className="landing-nav-link">{t('landing.howItWorks') || 'How It Works'}</Link>
          <Link to="/#tracking-simulator" className="landing-nav-link">{t('landing.trackShipment')}</Link>
          <Link to="/contact" className="landing-nav-link">{t('landing.contactUs')}</Link>
          <LanguageSelector />
          
          {user ? (
            <button className="landing-btn-signup" onClick={() => navigate('/login')}>
              {t('landing.signIn')}
            </button>
          ) : (
            <>
              <Link to="/login" className="landing-btn-login">{t('landing.signIn')}</Link>
              <button className="landing-btn-signup" onClick={handleGetStarted}>{t('landing.getStarted')}</button>
            </>
          )}
        </div>
      </header>

      {/* About Main Section */}
      <section className="about-hero-section">
        <div className="about-hero-glow"></div>
        <div className="about-container">
          <h1 className="about-main-title">{t('aboutPage.title')}</h1>
          <p className="about-intro-text">
            {t('aboutPage.intro1')}
          </p>
          <p className="about-intro-text">
            {t('aboutPage.intro2')}
          </p>
        </div>
      </section>

      {/* Offerings Grid */}
      <section className="about-offer-section">
        <div className="about-container">
          <h2 className="about-section-title">{t('aboutPage.whatWeOffer')}</h2>
          <div className="about-offer-grid">
            <div className="about-card">
              <div className="about-card-icon"><FaFileInvoiceDollar /></div>
              <h3>{t('aboutPage.orderManagementTitle')}</h3>
              <p>{t('aboutPage.orderManagementDesc')}</p>
            </div>
            <div className="about-card">
              <div className="about-card-icon"><FaRoute /></div>
              <h3>{t('aboutPage.tripManagementTitle')}</h3>
              <p>{t('aboutPage.tripManagementDesc')}</p>
            </div>
            <div className="about-card">
              <div className="about-card-icon"><FaCogs /></div>
              <h3>{t('aboutPage.driverManagementTitle')}</h3>
              <p>{t('aboutPage.driverManagementDesc')}</p>
            </div>
            <div className="about-card">
              <div className="about-card-icon"><FaTruck /></div>
              <h3>{t('aboutPage.fleetManagementTitle')}</h3>
              <p>{t('aboutPage.fleetManagementDesc')}</p>
            </div>
            <div className="about-card">
              <div className="about-card-icon"><MdSpeed /></div>
              <h3>{t('aboutPage.liveGpsTitle')}</h3>
              <p>{t('aboutPage.liveGpsDesc')}</p>
            </div>
            <div className="about-card">
              <div className="about-card-icon"><FaFileInvoiceDollar /></div>
              <h3>{t('aboutPage.expenseManagementTitle')}</h3>
              <p>{t('aboutPage.expenseManagementDesc')}</p>
            </div>
            <div className="about-card">
              <div className="about-card-icon"><FaCheckCircle /></div>
              <h3>{t('aboutPage.reviewsFeedbackTitle')}</h3>
              <p>{t('aboutPage.reviewsFeedbackDesc')}</p>
            </div>
            <div className="about-card">
              <div className="about-card-icon"><FaShieldAlt /></div>
              <h3>{t('aboutPage.secureAccessTitle')}</h3>
              <p>{t('aboutPage.secureAccessDesc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="about-mission-section">
        <div className="about-container about-mission-grid">
          <div className="about-mission-card">
            <div className="about-icon-header">
              <FaGlobe size={28} color="var(--cyan)" />
              <h2>{t('aboutPage.ourMission')}</h2>
            </div>
            <p>
              {t('aboutPage.missionDesc')}
            </p>
          </div>
          <div className="about-mission-card">
            <div className="about-icon-header">
              <FaEye size={28} color="var(--cyan)" />
              <h2>{t('aboutPage.ourVision')}</h2>
            </div>
            <p>
              {t('aboutPage.visionDesc')}
            </p>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="about-why-section">
        <div className="about-container">
          <h2 className="about-section-title">{t('aboutPage.whyChooseUs')}</h2>
          <div className="about-why-list">
            <div className="about-why-item">
              <span className="about-check-bullet">✓</span>
              <span>{t('aboutPage.why1')}</span>
            </div>
            <div className="about-why-item">
              <span className="about-check-bullet">✓</span>
              <span>{t('aboutPage.why2')}</span>
            </div>
            <div className="about-why-item">
              <span className="about-check-bullet">✓</span>
              <span>{t('aboutPage.why3')}</span>
            </div>
            <div className="about-why-item">
              <span className="about-check-bullet">✓</span>
              <span>{t('aboutPage.why4')}</span>
            </div>
            <div className="about-why-item">
              <span className="about-check-bullet">✓</span>
              <span>{t('aboutPage.why5')}</span>
            </div>
            <div className="about-why-item">
              <span className="about-check-bullet">✓</span>
              <span>{t('aboutPage.why6')}</span>
            </div>
            <div className="about-why-item">
              <span className="about-check-bullet">✓</span>
              <span>{t('aboutPage.why7')}</span>
            </div>
          </div>
          <p className="about-closing-tagline">
            {t('aboutPage.closingTagline')}
          </p>
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
            <h4 className="landing-footer-title">{t('footer.platform')}</h4>
            <div className="landing-footer-links">
              <Link to="/features">{t('landing.features') || 'Features'}</Link>
              <Link to="/how-it-works">{t('landing.howItWorks') || 'How It Works'}</Link>
              <Link to="/#tracking-simulator">{t('landing.trackShipment')}</Link>
            </div>
          </div>

          <div>
            <h4 className="landing-footer-title">{t('footer.company')}</h4>
            <div className="landing-footer-links">
              <Link to="/about">{t('landing.aboutUs') || 'About Us'}</Link>
              <Link to="/contact">{t('landing.contactUs') || 'Contact Us'}</Link>
              <Link to="/careers">{t('landing.careers') || 'Careers'}</Link>
              <Link to="/faq">{t('landing.faq') || 'FAQ'}</Link>
            </div>
          </div>

          <div>
            <h4 className="landing-footer-title">{t('footer.secureAndReliable')}</h4>
            <div className="landing-footer-links" style={{ color: 'var(--muted)', fontSize: '0.875rem', gap: '0.65rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {t('footer.secureAuth')}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {t('footer.liveGpsTracking')}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {t('footer.smartTripManagement')}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {t('footer.expenseMonitoring')}
              </div>
            </div>
          </div>

          <div id="contact-details">
            <h4 className="landing-footer-title">{t('landing.contactUs') || 'Contact Us'}</h4>
            <div className="landing-footer-links" style={{ color: 'var(--muted)', fontSize: '0.875rem', gap: '0.6rem' }}>
              <div>
                <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--dim)', fontWeight: 700 }}>{t('footer.email')}</span>
                <a href="mailto:choudharysakshi828@gmail.com" style={{ color: 'var(--muted)' }}>choudharysakshi828@gmail.com</a>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--dim)', fontWeight: 700 }}>{t('footer.phone')}</span>
                <a href="tel:+919664372498" style={{ color: 'var(--muted)' }}>+91-9664372498</a>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--dim)', fontWeight: 700 }}>{t('footer.address')}</span>
                <span>{t('footer.addressValue')}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="landing-footer-bottom">
          <span>&copy; {new Date().getFullYear()} TMS Logistics Inc. {t('footer.allRightsReserved')}</span>
          <span style={{ display: 'flex', gap: '1rem' }}>
            <Link to="/privacy-policy">{t('footer.privacyPolicy')}</Link>
            <Link to="/terms-of-service">{t('footer.termsOfService')}</Link>
          </span>
        </div>
      </footer>
    </div>
  );
};

export default AboutUs;
