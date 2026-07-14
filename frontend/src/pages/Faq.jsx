import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTruck, FaShieldAlt, FaChevronDown, FaSearch } from 'react-icons/fa';
import { MdSpeed, MdOutlineSupportAgent } from 'react-icons/md';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import LanguageSelector from '../components/LanguageSelector';
import './LandingPage.css'; // Reuse landing layout
import './Faq.css';

const Faq = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Accordion state
  const [expandedIndex, setExpandedIndex] = useState(null);

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

  const toggleAccordion = (index) => {
    if (expandedIndex === index) {
      setExpandedIndex(null);
    } else {
      setExpandedIndex(index);
    }
  };

  const faqData = [
    {
      q: "What is the Logistics Management System?",
      a: "Our Logistics Management System is a digital platform that helps businesses manage shipments, trucks, drivers, trips, expenses, and deliveries efficiently from one place."
    },
    {
      q: "How can I track my shipment?",
      a: "Customers can log in to their account and view the real-time status of their shipment, including its current location and delivery progress."
    },
    {
      q: "How are drivers assigned to trips?",
      a: "Trips are assigned by the administrator based on driver availability, vehicle status, and delivery requirements."
    },
    {
      q: "Can drivers update their trip status?",
      a: "Yes. Drivers can update their trip status, such as Started, In Transit, and Completed, through the system."
    },
    {
      q: "Can drivers record trip expenses?",
      a: "Yes. Drivers can submit expenses such as fuel, toll, and maintenance costs for review and approval by the administrator."
    },
    {
      q: "How is my data protected?",
      a: "We use secure authentication and role-based access control to ensure that only authorized users can access system data."
    },
    {
      q: "What should I do if I forget my password?",
      a: "Click on the Forgot Password option on the login page and follow the instructions to reset your password."
    },
    {
      q: "Can I access the system from my mobile phone?",
      a: "Yes. The Logistics Management System is fully responsive and can be accessed from desktops, tablets, and smartphones."
    },
    {
      q: "Who can use this system?",
      a: "The system is designed for administrators, drivers, and customers, each with role-specific features and permissions."
    },
    {
      q: "How can I contact customer support?",
      a: "You can reach our support team through the Contact Us page, email, or phone during business hours."
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
          <Link to="/careers" className="landing-nav-link">Careers</Link>
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

      {/* Hero Section */}
      <section className="faq-hero-section">
        <div className="faq-hero-glow"></div>
        <div className="faq-container">
          <h1 className="faq-main-title">Frequently Asked Questions (FAQ)</h1>
          <p className="faq-intro-text">
            Find answers to common questions about the Logistics Management System, trip tracking, expense audits, and customer dashboards.
          </p>
          

        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="faq-list-section">
        <div className="faq-container">
            <div className="faq-accordion">
              {faqData.map((faq, index) => {
                const isExpanded = expandedIndex === index;
                return (
                  <div key={index} className={`faq-item ${isExpanded ? 'active' : ''}`}>
                    <button className="faq-question-btn" onClick={() => toggleAccordion(index)}>
                      <span className="faq-question-num">{index + 1}.</span>
                      <span className="faq-question-text">{faq.q}</span>
                      <FaChevronDown className="faq-chevron-icon" />
                    </button>
                    <div className="faq-answer-panel">
                      <div className="faq-answer-content">
                        <p>{faq.a}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
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

export default Faq;
