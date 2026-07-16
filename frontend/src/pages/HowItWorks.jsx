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
      title: t('howItWorksPage.step1Title'),
      desc: t('howItWorksPage.step1Desc')
    },
    {
      num: "02",
      icon: <FaUserCheck />,
      title: t('howItWorksPage.step2Title'),
      desc: t('howItWorksPage.step2Desc')
    },
    {
      num: "03",
      icon: <FaRoute />,
      title: t('howItWorksPage.step3Title'),
      desc: t('howItWorksPage.step3Desc')
    },
    {
      num: "04",
      icon: <FaMapMarkerAlt />,
      title: t('howItWorksPage.step4Title'),
      desc: t('howItWorksPage.step4Desc')
    },
    {
      num: "05",
      icon: <FaCheckCircle />,
      title: t('howItWorksPage.step5Title'),
      desc: t('howItWorksPage.step5Desc')
    },
    {
      num: "06",
      icon: <FaChartLine />,
      title: t('howItWorksPage.step6Title'),
      desc: t('howItWorksPage.step6Desc')
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
      <section className="hiw-hero-section">
        <div className="hiw-hero-glow"></div>
        <div className="hiw-container">
          <h1 className="hiw-main-title">{t('howItWorksPage.title')}</h1>
          <p className="hiw-intro-text">
            {t('howItWorksPage.subtitle')}
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
            <h4 className="landing-footer-title">{t('footer.platform') || 'Platform'}</h4>
            <div className="landing-footer-links">
              <Link to="/features">{t('landing.features') || 'Features'}</Link>
              <Link to="/how-it-works">{t('landing.howItWorks') || 'How It Works'}</Link>
              <Link to="/#tracking-simulator">{t('landing.trackShipment')}</Link>
            </div>
          </div>

          <div>
            <h4 className="landing-footer-title">{t('footer.company') || 'Company'}</h4>
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
                <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--dim)', fontWeight: 700 }}>{t('footer.email') || 'Email'}</span>
                <a href="mailto:choudharysakshi828@gmail.com" style={{ color: 'var(--muted)' }}>choudharysakshi828@gmail.com</a>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--dim)', fontWeight: 700 }}>{t('footer.phone') || 'Phone'}</span>
                <a href="tel:+919664372498" style={{ color: 'var(--muted)' }}>+91-9664372498</a>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--dim)', fontWeight: 700 }}>{t('footer.address') || 'Address'}</span>
                <span>{t('footer.addressValue') || 'Mansarovar, Jaipur'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="landing-footer-bottom">
          <span>&copy; {new Date().getFullYear()} TMS Logistics Inc. {t('footer.allRightsReserved') || 'All rights reserved.'}</span>
          <span style={{ display: 'flex', gap: '1rem' }}>
            <Link to="/privacy-policy">{t('footer.privacyPolicy') || 'Privacy Policy'}</Link>
            <Link to="/terms-of-service">{t('footer.termsOfService') || 'Terms of Service'}</Link>
          </span>
        </div>
      </footer>
    </div>
  );
};

export default HowItWorks;
