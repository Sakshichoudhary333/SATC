import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTruck, FaShieldAlt, FaCogs, FaRoute, FaFileInvoiceDollar, FaCheckCircle, FaUserLock, FaChartBar, FaMobileAlt, FaClipboardList } from 'react-icons/fa';
import { MdSpeed, MdOutlineSupportAgent } from 'react-icons/md';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import LanguageSelector from '../components/LanguageSelector';
import './LandingPage.css'; // Reuse landing layout
import './FeaturesPage.css';

const FeaturesPage = () => {
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

      {/* Hero Section */}
      <section className="feat-hero-section">
        <div className="feat-hero-glow"></div>
        <div className="feat-container">
          <h1 className="feat-main-title">{t('featuresPage.title')}</h1>
          <h2 className="feat-subtitle">{t('featuresPage.subtitle')}</h2>
          <p className="feat-intro-text">
            {t('featuresPage.desc')}
          </p>
        </div>
      </section>

      {/* Core Services Grid */}
      <section className="feat-services-section">
        <div className="feat-container">
          <div className="feat-services-grid">
            
            {/* Feature 1 */}
            <div className="feat-card">
              <div className="feat-card-icon"><FaClipboardList /></div>
              <h3>{t('featuresPage.feat1')}</h3>
              <p>{t('featuresPage.feat1Desc')}</p>
            </div>

            {/* Feature 2 */}
            <div className="feat-card">
              <div className="feat-card-icon"><FaRoute /></div>
              <h3>{t('featuresPage.feat2')}</h3>
              <p>{t('featuresPage.feat2Desc')}</p>
            </div>

            {/* Feature 3 */}
            <div className="feat-card">
              <div className="feat-card-icon"><FaCogs /></div>
              <h3>{t('featuresPage.feat3')}</h3>
              <p>{t('featuresPage.feat3Desc')}</p>
            </div>

            {/* Feature 4 */}
            <div className="feat-card">
              <div className="feat-card-icon"><FaTruck /></div>
              <h3>{t('featuresPage.feat4')}</h3>
              <p>{t('featuresPage.feat4Desc')}</p>
            </div>

            {/* Feature 5 */}
            <div className="feat-card">
              <div className="feat-card-icon"><MdSpeed /></div>
              <h3>{t('featuresPage.feat5')}</h3>
              <p>{t('featuresPage.feat5Desc')}</p>
            </div>

            {/* Feature 6 */}
            <div className="feat-card">
              <div className="feat-card-icon"><FaFileInvoiceDollar /></div>
              <h3>{t('featuresPage.feat6')}</h3>
              <p>{t('featuresPage.feat6Desc')}</p>
            </div>

            {/* Feature 7 */}
            <div className="feat-card">
              <div className="feat-card-icon"><FaCheckCircle /></div>
              <h3>{t('featuresPage.feat7')}</h3>
              <p>{t('featuresPage.feat7Desc')}</p>
            </div>

            {/* Feature 8 */}
            <div className="feat-card">
              <div className="feat-card-icon"><FaUserLock /></div>
              <h3>{t('featuresPage.feat8')}</h3>
              <p>{t('featuresPage.feat8Desc')}</p>
            </div>

            {/* Feature 9 */}
            <div className="feat-card">
              <div className="feat-card-icon"><FaChartBar /></div>
              <h3>{t('featuresPage.feat9')}</h3>
              <p>{t('featuresPage.feat9Desc')}</p>
            </div>

            {/* Feature 10 */}
            <div className="feat-card">
              <div className="feat-card-icon"><FaMobileAlt /></div>
              <h3>{t('featuresPage.feat10')}</h3>
              <p>{t('featuresPage.feat10Desc')}</p>
            </div>

          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="feat-why-section">
        <div className="feat-container">
          <h2 className="feat-section-title">{t('featuresPage.whyTitle')}</h2>
          <div className="feat-why-grid">
            <div className="feat-why-item">
              <span className="feat-bullet">✓</span>
              <span>{t('featuresPage.why1')}</span>
            </div>
            <div className="feat-why-item">
              <span className="feat-bullet">✓</span>
              <span>{t('featuresPage.why2')}</span>
            </div>
            <div className="feat-why-item">
              <span className="feat-bullet">✓</span>
              <span>{t('featuresPage.why3')}</span>
            </div>
            <div className="feat-why-item">
              <span className="feat-bullet">✓</span>
              <span>{t('featuresPage.why4')}</span>
            </div>
            <div className="feat-why-item">
              <span className="feat-bullet">✓</span>
              <span>{t('featuresPage.why5')}</span>
            </div>
            <div className="feat-why-item">
              <span className="feat-bullet">✓</span>
              <span>{t('featuresPage.why6')}</span>
            </div>
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

export default FeaturesPage;
