import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import LanguageSelector from './LanguageSelector';
import { FaTruck, FaSun, FaMoon } from 'react-icons/fa';

const PublicHeader = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

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
    <header className="landing-header">
      <Link to="/" className="landing-logo">
        <FaTruck size={26} color="var(--cyan)" />
        TMS<span>Logistics</span>
      </Link>

      <div className="landing-nav-actions">
        <Link to="/features" className="landing-nav-link">
          {t('landing.features') || 'Features'}
        </Link>

        <Link to="/how-it-works" className="landing-nav-link">
          {t('landing.howItWorks') || 'How It Works'}
        </Link>

        <Link to="/#tracking-simulator" className="landing-nav-link">
          {t('landing.trackShipment') || 'Track Shipment'}
        </Link>

        <LanguageSelector />

        <button
          onClick={toggleTheme}
          className="theme-toggle-btn"
          aria-label="Toggle Theme"
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
      </div>
    </header>
  );
};

export default PublicHeader;