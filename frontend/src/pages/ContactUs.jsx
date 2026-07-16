import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTruck, FaShieldAlt } from 'react-icons/fa';
import { MdSpeed, MdOutlineSupportAgent } from 'react-icons/md';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import LanguageSelector from '../components/LanguageSelector';
import './LandingPage.css'; // Reuse landing layout
import './ContactUs.css';

const ContactUs = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Contact form states
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);

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

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactPhone) {
      alert("Please fill in all fields.");
      return;
    }
    setContactSubmitted(true);
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

      {/* Main Form Section */}
      <section className="contact-main-section">
        <div className="contact-glow"></div>
        <div className="contact-box-container">
          
          {contactSubmitted ? (
            <div className="contact-success-card">
              <div className="contact-success-icon">✓</div>
              <h2 className="contact-success-title">{t('contactPage.thankYou')}</h2>
              <p className="contact-success-subtitle">{t('contactPage.sharedSuccessfully')}</p>
              <p className="contact-success-text">
                {t('contactPage.contactSoon')}
              </p>
              <Link to="/" className="landing-search-btn" style={{ display: 'inline-block', marginTop: '2rem', textDecoration: 'none', textAlign: 'center' }}>
                {t('contactPage.returnHome')}
              </Link>
            </div>
          ) : (
            <div className="contact-form-card">
              <div className="contact-header">
                <h1 className="contact-title">{t('contactPage.connect')}</h1>
                <h2 className="contact-subtitle">{t('contactPage.wantToKnow')}</h2>
                <p className="contact-text">
                  {t('contactPage.shareDetails')}
                </p>
              </div>

              <form className="contact-form" onSubmit={handleContactSubmit}>
                <div className="contact-form-group">
                  <label className="contact-form-label">{t('contactPage.nameLabel')}</label>
                  <input 
                    type="text" 
                    className="contact-form-input" 
                    required 
                    placeholder={t('contactPage.namePlaceholder')}
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                  />
                </div>

                <div className="contact-form-group">
                  <label className="contact-form-label">{t('contactPage.emailLabel')}</label>
                  <input 
                    type="email" 
                    className="contact-form-input" 
                    required 
                    placeholder={t('contactPage.emailPlaceholder')}
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                  />
                </div>

                <div className="contact-form-group">
                  <label className="contact-form-label">{t('contactPage.phoneLabel')}</label>
                  <input 
                    type="tel" 
                    className="contact-form-input" 
                    required 
                    placeholder={t('contactPage.phonePlaceholder')}
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                  />
                </div>

                <div className="contact-form-group">
                  <label className="contact-form-label">{t('contactPage.messageLabel')}</label>
                  <textarea 
                    className="contact-form-textarea" 
                    placeholder={t('contactPage.messagePlaceholder')}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                  />
                </div>

                <button type="submit" className="landing-search-btn" style={{ marginTop: '0.75rem', width: '100%' }}>
                  {t('contactPage.submitBtn')}
                </button>
              </form>
            </div>
          )}

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

export default ContactUs;
