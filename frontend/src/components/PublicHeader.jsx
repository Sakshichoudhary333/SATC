import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import LanguageSelector from './LanguageSelector';
import { FaTruck, FaSun, FaMoon, FaBars, FaTimes } from 'react-icons/fa';
import { scrollToElementById } from '../utils/helpers';

const PublicHeader = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [theme, setTheme] = useState(
    localStorage.getItem('theme') || 'dark'
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleLogoClick = (e) => {
    setMobileMenuOpen(false);
    if (location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleGetStarted = () => {
    setMobileMenuOpen(false);
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

  const handleFeaturesClick = (e) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (location.pathname === '/') {
      scrollToElementById('features');
    } else {
      navigate('/features');
    }
  };

  const handleHowItWorksClick = (e) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (location.pathname === '/') {
      scrollToElementById('how-it-works');
    } else {
      navigate('/how-it-works');
    }
  };

  const handleTrackShipmentClick = (e) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (location.pathname === '/') {
      scrollToElementById('tracking-simulator');
    } else {
      navigate('/#tracking-simulator');
    }
  };

  return (
    <header className="landing-header">
      <Link to="/" className="landing-logo" onClick={handleLogoClick}>
        <FaTruck size={26} color="var(--cyan)" />
        TMS<span>Logistics</span>
      </Link>

      <div className="landing-nav-actions">
        <Link to="/features" className="landing-nav-link" onClick={handleFeaturesClick}>
          {t('landing.features') || 'Features'}
        </Link>

        <Link to="/how-it-works" className="landing-nav-link" onClick={handleHowItWorksClick}>
          {t('landing.howItWorks') || 'How It Works'}
        </Link>

        <Link to="/#tracking-simulator" className="landing-nav-link" onClick={handleTrackShipmentClick}>
          {t('landing.trackShipment') || 'Track Shipment'}
        </Link>

        <LanguageSelector />

        <button
          onClick={toggleTheme}
          className="theme-toggle-btn"
          aria-label="Toggle Theme"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          style={{
            background: 'transparent',
            border: '1.5px solid var(--border)',
            color: 'var(--text)',
            borderRadius: '8px',
            padding: '0.4rem 0.65rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          {theme === 'dark' ? (
            <FaSun size={14} color="#f59e0b" />
          ) : (
            <FaMoon size={14} color="#0891b2" />
          )}
        </button>

        {user ? (
          <button
            className="landing-btn-signup"
            onClick={handleGetStarted}
          >
            Dashboard
          </button>
        ) : (
          <>
            <Link to="/login" className="landing-btn-login">
              {t('landing.signIn') || 'Sign In'}
            </Link>

            <button
              className="landing-btn-signup"
              onClick={handleGetStarted}
            >
              {t('landing.getStarted') || 'Get Started'}
            </button>
          </>
        )}

        {/* Mobile Hamburger Button */}
        <button
          className="landing-mobile-toggle"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="landing-mobile-menu">
          <Link to="/features" className="landing-mobile-nav-link" onClick={handleFeaturesClick}>
            {t('landing.features') || 'Features'}
          </Link>

          <Link to="/how-it-works" className="landing-mobile-nav-link" onClick={handleHowItWorksClick}>
            {t('landing.howItWorks') || 'How It Works'}
          </Link>

          <Link to="/#tracking-simulator" className="landing-mobile-nav-link" onClick={handleTrackShipmentClick}>
            {t('landing.trackShipment') || 'Track Shipment'}
          </Link>

          <div className="landing-mobile-actions">
            {user ? (
              <button
                className="landing-btn-signup"
                onClick={handleGetStarted}
                style={{ width: '100%', textAlign: 'center' }}
              >
                Dashboard
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="landing-btn-login"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ textAlign: 'center' }}
                >
                  {t('landing.signIn') || 'Sign In'}
                </Link>

                <button
                  className="landing-btn-signup"
                  onClick={handleGetStarted}
                  style={{ width: '100%', textAlign: 'center' }}
                >
                  {t('landing.getStarted') || 'Get Started'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default PublicHeader;
