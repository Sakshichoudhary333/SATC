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
          <Link to="/" className="landing-nav-link">Home</Link>
          <Link to="/about" className="landing-nav-link">About</Link>
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
      <section className="feat-hero-section">
        <div className="feat-hero-glow"></div>
        <div className="feat-container">
          <h1 className="feat-main-title">Our Features & Services</h1>
          <h2 className="feat-subtitle">Smart Logistics Management</h2>
          <p className="feat-intro-text">
            Our Logistics Management System provides a complete solution for managing transportation, deliveries, and fleet operations. Designed to improve efficiency and transparency, our platform helps businesses streamline their logistics processes from order placement to successful delivery.
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
              <h3>📦 Order Management</h3>
              <p>Create, manage, and monitor customer orders with an easy-to-use interface. Track every order throughout its delivery lifecycle.</p>
            </div>

            {/* Feature 2 */}
            <div className="feat-card">
              <div className="feat-card-icon"><FaRoute /></div>
              <h3>🚚 Trip Management</h3>
              <p>Plan, assign, and monitor delivery trips efficiently. Track trip progress from start to completion.</p>
            </div>

            {/* Feature 3 */}
            <div className="feat-card">
              <div className="feat-card-icon"><FaCogs /></div>
              <h3>👨💼 Driver Management</h3>
              <p>Manage driver profiles, assign trips, monitor availability, and review driver performance from a centralized dashboard.</p>
            </div>

            {/* Feature 4 */}
            <div className="feat-card">
              <div className="feat-card-icon"><FaTruck /></div>
              <h3>🚛 Fleet Management</h3>
              <p>Maintain truck information, monitor vehicle availability, and organize fleet operations efficiently.</p>
            </div>

            {/* Feature 5 */}
            <div className="feat-card">
              <div className="feat-card-icon"><MdSpeed /></div>
              <h3>📍 Live GPS Tracking</h3>
              <p>Track vehicle locations in real time, allowing administrators and customers to monitor shipment progress and improve delivery transparency.</p>
            </div>

            {/* Feature 6 */}
            <div className="feat-card">
              <div className="feat-card-icon"><FaFileInvoiceDollar /></div>
              <h3>💰 Expense Management</h3>
              <p>Drivers can submit fuel, toll, and maintenance expenses, while administrators can review and approve them for accurate expense tracking.</p>
            </div>

            {/* Feature 7 */}
            <div className="feat-card">
              <div className="feat-card-icon"><FaCheckCircle /></div>
              <h3>⭐ Customer Reviews & Feedback</h3>
              <p>Customers can rate completed deliveries and provide valuable feedback to help improve service quality.</p>
            </div>

            {/* Feature 8 */}
            <div className="feat-card">
              <div className="feat-card-icon"><FaUserLock /></div>
              <h3>🔐 Secure Authentication</h3>
              <p>Role-based access ensures secure login for administrators, drivers, and customers while protecting sensitive business data.</p>
            </div>

            {/* Feature 9 */}
            <div className="feat-card">
              <div className="feat-card-icon"><FaChartBar /></div>
              <h3>📊 Dashboard & Reports</h3>
              <p>Access key insights into orders, trips, expenses, deliveries, and operational performance through interactive dashboards.</p>
            </div>

            {/* Feature 10 */}
            <div className="feat-card">
              <div className="feat-card-icon"><FaMobileAlt /></div>
              <h3>📱 Responsive Design</h3>
              <p>Access the platform seamlessly from desktops, tablets, and mobile devices for convenient logistics management anytime, anywhere.</p>
            </div>

          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="feat-why-section">
        <div className="feat-container">
          <h2 className="feat-section-title">Why Choose Our Platform?</h2>
          <div className="feat-why-grid">
            <div className="feat-why-item">
              <span className="feat-bullet">✓</span>
              <span>Real-time shipment tracking</span>
            </div>
            <div className="feat-why-item">
              <span className="feat-bullet">✓</span>
              <span>Faster trip planning and management</span>
            </div>
            <div className="feat-why-item">
              <span className="feat-bullet">✓</span>
              <span>Centralized fleet and driver management</span>
            </div>
            <div className="feat-why-item">
              <span className="feat-bullet">✓</span>
              <span>Secure and role-based access</span>
            </div>
            <div className="feat-why-item">
              <span className="feat-bullet">✓</span>
              <span>Transparent expense approval process</span>
            </div>
            <div className="feat-why-item">
              <span className="feat-bullet">✓</span>
              <span>Improved customer satisfaction</span>
            </div>
            <div className="feat-why-item">
              <span className="feat-bullet">✓</span>
              <span>Easy-to-use and responsive interface</span>
            </div>
            <div className="feat-why-item">
              <span className="feat-bullet">✓</span>
              <span>Scalable solution for growing businesses</span>
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

export default FeaturesPage;
