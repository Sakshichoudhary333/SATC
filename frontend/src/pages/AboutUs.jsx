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
          <Link to="/" className="landing-nav-link">Home</Link>
          <Link to="/features" className="landing-nav-link">{t('landing.features') || 'Features'}</Link>
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

      {/* About Main Section */}
      <section className="about-hero-section">
        <div className="about-hero-glow"></div>
        <div className="about-container">
          <h1 className="about-main-title">About Us</h1>
          <p className="about-intro-text">
            Welcome to <strong>Logistics Management System</strong>, a smart platform designed to simplify and optimize transportation and logistics operations. Our mission is to help businesses efficiently manage orders, drivers, vehicles, trips, expenses, and deliveries from a single, user-friendly dashboard.
          </p>
          <p className="about-intro-text">
            We understand the challenges of modern logistics, including shipment tracking, fleet coordination, delivery delays, and operational costs. Our platform provides real-time visibility and intelligent management tools that enable organizations to streamline their logistics processes and improve overall productivity.
          </p>
        </div>
      </section>

      {/* Offerings Grid */}
      <section className="about-offer-section">
        <div className="about-container">
          <h2 className="about-section-title">What We Offer</h2>
          <div className="about-offer-grid">
            <div className="about-card">
              <div className="about-card-icon"><FaFileInvoiceDollar /></div>
              <h3>Order Management</h3>
              <p>Create, organize, and monitor customer orders with ease.</p>
            </div>
            <div className="about-card">
              <div className="about-card-icon"><FaRoute /></div>
              <h3>Trip Management</h3>
              <p>Plan, assign, and track delivery trips efficiently.</p>
            </div>
            <div className="about-card">
              <div className="about-card-icon"><FaCogs /></div>
              <h3>Driver Management</h3>
              <p>Manage driver information, assignments, and performance.</p>
            </div>
            <div className="about-card">
              <div className="about-card-icon"><FaTruck /></div>
              <h3>Fleet Management</h3>
              <p>Maintain records of trucks and vehicles used for transportation.</p>
            </div>
            <div className="about-card">
              <div className="about-card-icon"><MdSpeed /></div>
              <h3>Live GPS Tracking</h3>
              <p>Monitor vehicle locations in real time for improved transparency and faster decision-making.</p>
            </div>
            <div className="about-card">
              <div className="about-card-icon"><FaFileInvoiceDollar /></div>
              <h3>Expense Management</h3>
              <p>Record and manage trip-related expenses with approval workflows.</p>
            </div>
            <div className="about-card">
              <div className="about-card-icon"><FaCheckCircle /></div>
              <h3>Reviews & Feedback</h3>
              <p>Collect customer feedback to continuously improve service quality.</p>
            </div>
            <div className="about-card">
              <div className="about-card-icon"><FaShieldAlt /></div>
              <h3>Secure Role-Based Access</h3>
              <p>Separate dashboards and permissions for administrators and drivers to ensure secure system access.</p>
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
              <h2>Our Mission</h2>
            </div>
            <p>
              Our mission is to transform logistics operations through technology by providing a reliable, secure, and efficient management platform that reduces manual work, improves delivery performance, and enhances customer satisfaction.
            </p>
          </div>
          <div className="about-mission-card">
            <div className="about-icon-header">
              <FaEye size={28} color="var(--cyan)" />
              <h2>Our Vision</h2>
            </div>
            <p>
              To become a trusted digital logistics solution that empowers businesses with smarter fleet management, real-time tracking, and data-driven decision-making.
            </p>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="about-why-section">
        <div className="about-container">
          <h2 className="about-section-title">Why Choose Us?</h2>
          <div className="about-why-list">
            <div className="about-why-item">
              <span className="about-check-bullet">✓</span>
              <span>Easy-to-use and responsive interface</span>
            </div>
            <div className="about-why-item">
              <span className="about-check-bullet">✓</span>
              <span>Real-time shipment and vehicle tracking</span>
            </div>
            <div className="about-why-item">
              <span className="about-check-bullet">✓</span>
              <span>Secure authentication and role-based access</span>
            </div>
            <div className="about-why-item">
              <span className="about-check-bullet">✓</span>
              <span>Faster order and trip management</span>
            </div>
            <div className="about-why-item">
              <span className="about-check-bullet">✓</span>
              <span>Transparent expense monitoring</span>
            </div>
            <div className="about-why-item">
              <span className="about-check-bullet">✓</span>
              <span>Reliable and scalable architecture</span>
            </div>
            <div className="about-why-item">
              <span className="about-check-bullet">✓</span>
              <span>Improved operational efficiency</span>
            </div>
          </div>
          <p className="about-closing-tagline">
            Whether you're managing a small fleet or a growing logistics business, our platform is designed to make transportation management simpler, faster, and more efficient.
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

export default AboutUs;
