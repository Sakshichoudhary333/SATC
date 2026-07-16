import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTruck, FaShieldAlt, FaEnvelope, FaPhoneAlt, FaCheckCircle, FaUserTie, FaMapMarkerAlt } from 'react-icons/fa';
import { MdSpeed, MdOutlineSupportAgent } from 'react-icons/md';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import LanguageSelector from '../components/LanguageSelector';
import './LandingPage.css'; // Reuse landing theme layouts
import './Careers.css';

const Careers = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Application form states
  const [selectedJob, setSelectedJob] = useState('');
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [applicantName, setApplicantName] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [applicantNotes, setApplicantNotes] = useState('');
  const [appSubmitted, setAppSubmitted] = useState(false);

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

  const openApplyModal = (jobTitle) => {
    setSelectedJob(jobTitle);
    setIsApplyModalOpen(true);
  };

  const closeApplyModal = () => {
    setIsApplyModalOpen(false);
    setApplicantName('');
    setApplicantEmail('');
    setApplicantPhone('');
    setApplicantNotes('');
    setAppSubmitted(false);
  };

  const handleApplySubmit = (e) => {
    e.preventDefault();
    if (!applicantName || !applicantEmail || !applicantPhone) {
      alert("Please fill in all required fields.");
      return;
    }
    setAppSubmitted(true);
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
      <section className="careers-hero-section">
        <div className="careers-hero-glow"></div>
        <div className="careers-container">
          <h1 className="careers-main-title">{t('careersPage.title')}</h1>
          <h2 className="careers-subtitle">{t('careersPage.subtitle')}</h2>
          <p className="careers-intro-text">
            {t('careersPage.intro')}
          </p>
        </div>
      </section>

      {/* Openings Section */}
      <section className="careers-openings-section">
        <div className="careers-container">
          <h2 className="careers-section-title">{t('careersPage.openingsTitle')}</h2>
          <div className="careers-openings-list">
            
            {/* Opening 1 */}
            <div className="careers-job-card">
              <div className="careers-job-header">
                <div>
                  <span className="careers-job-badge">{t('careersPage.fullTime')}</span>
                  <h3 className="careers-job-title">{t('careersPage.truckDriver')}</h3>
                  <div className="careers-job-meta">
                    <span><FaMapMarkerAlt /> {t('careersPage.remoteOnRoad')}</span>
                    <span>• {t('careersPage.experience1Year')}</span>
                  </div>
                </div>
                <button className="careers-apply-btn" onClick={() => openApplyModal(t('careersPage.truckDriver'))}>{t('careersPage.applyNow')}</button>
              </div>
              <div className="careers-job-body">
                <div className="careers-job-col">
                  <h4>{t('careersPage.responsibilities')}</h4>
                  <ul>
                    <li>{t('careersPage.driverResp1')}</li>
                    <li>{t('careersPage.driverResp2')}</li>
                    <li>{t('careersPage.driverResp3')}</li>
                    <li>{t('careersPage.driverResp4')}</li>
                    <li>{t('careersPage.driverResp5')}</li>
                    <li>{t('careersPage.driverResp6')}</li>
                  </ul>
                </div>
                <div className="careers-job-col">
                  <h4>{t('careersPage.requirements')}</h4>
                  <ul>
                    <li>{t('careersPage.driverReq1')}</li>
                    <li>{t('careersPage.driverReq2')}</li>
                    <li>{t('careersPage.driverReq3')}</li>
                    <li>{t('careersPage.driverReq4')}</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Opening 2 */}
            <div className="careers-job-card">
              <div className="careers-job-header">
                <div>
                  <span className="careers-job-badge">{t('careersPage.officeRemote')}</span>
                  <h3 className="careers-job-title">{t('careersPage.customerSupportExecutive')}</h3>
                  <div className="careers-job-meta">
                    <span><FaMapMarkerAlt /> {t('careersPage.jaipurHub')}</span>
                    <span>• {t('careersPage.experienceFreshers')}</span>
                  </div>
                </div>
                <button className="careers-apply-btn" onClick={() => openApplyModal(t('careersPage.customerSupportExecutive'))}>{t('careersPage.applyNow')}</button>
              </div>
              <div className="careers-job-body">
                <div className="careers-job-col">
                  <h4>{t('careersPage.responsibilities')}</h4>
                  <ul>
                    <li>{t('careersPage.supportResp1')}</li>
                    <li>{t('careersPage.supportResp2')}</li>
                    <li>{t('careersPage.supportResp3')}</li>
                    <li>{t('careersPage.supportResp4')}</li>
                    <li>{t('careersPage.supportResp5')}</li>
                  </ul>
                </div>
                <div className="careers-job-col">
                  <h4>{t('careersPage.requirements')}</h4>
                  <ul>
                    <li>{t('careersPage.supportReq1')}</li>
                    <li>{t('careersPage.supportReq2')}</li>
                    <li>{t('careersPage.supportReq3')}</li>
                    <li>{t('careersPage.supportReq4')}</li>
                  </ul>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Why Join Us */}
      <section className="careers-why-section">
        <div className="careers-container">
          <h2 className="careers-section-title">{t('careersPage.whyTitle')}</h2>
          <div className="careers-why-grid">
            <div className="careers-why-card">
              <div className="careers-why-check">✓</div>
              <p>{t('careersPage.why1')}</p>
            </div>
            <div className="careers-why-card">
              <div className="careers-why-check">✓</div>
              <p>{t('careersPage.why2')}</p>
            </div>
            <div className="careers-why-card">
              <div className="careers-why-check">✓</div>
              <p>{t('careersPage.why3')}</p>
            </div>
            <div className="careers-why-card">
              <div className="careers-why-check">✓</div>
              <p>{t('careersPage.why4')}</p>
            </div>
            <div className="careers-why-card">
              <div className="careers-why-check">✓</div>
              <p>{t('careersPage.why5')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Apply Section */}
      <section className="careers-apply-section">
        <div className="careers-container careers-apply-box">
          <h2 className="careers-apply-box-title">{t('careersPage.applyTitle')}</h2>
          <p className="careers-apply-text">
            {t('careersPage.applyText')}
          </p>
          <div className="careers-contact-info-row">
            <div className="careers-info-badge">
              <FaEnvelope /> {t('careersPage.recruitmentEmail')}
            </div>
            <div className="careers-info-badge">
              <FaPhoneAlt /> +91-9664372498
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

      {/* Quick Apply Modal */}
      {isApplyModalOpen && (
        <div className="landing-modal-overlay" onClick={closeApplyModal}>
          <div className="landing-modal-container" onClick={(e) => e.stopPropagation()}>
            <button className="landing-modal-close" onClick={closeApplyModal}>&times;</button>
            <div className="landing-modal-content">
              {appSubmitted ? (
                <div className="landing-modal-success">
                  <div className="landing-modal-success-icon">✓</div>
                  <h3 className="landing-modal-title">{t('careersPage.applyModalTitleSubmit')}</h3>
                  <p className="landing-modal-subtitle">{t('careersPage.applyModalSubtitleSubmit')}{applicantName}.</p>
                  <p className="landing-modal-text" style={{ marginTop: '0.5rem' }}>
                    {t('careersPage.applyModalTextSubmit1')}<strong>{selectedJob}</strong>{t('careersPage.applyModalTextSubmit2')}
                  </p>
                  <button 
                    className="landing-search-btn" 
                    style={{ marginTop: '1.5rem', padding: '0.65rem 2rem' }}
                    onClick={closeApplyModal}
                  >
                    {t('careersPage.applyModalClose')}
                  </button>
                </div>
              ) : (
                <>
                  <div className="landing-modal-header">
                    <h3 className="landing-modal-title">{t('careersPage.applyModalTitleQuick')}</h3>
                    <p className="landing-modal-subtitle">{t('careersPage.applyModalSubtitleQuick')}{selectedJob}</p>
                    <p className="landing-modal-text">
                      {t('careersPage.applyModalTextQuick')}
                    </p>
                  </div>
                  <form className="landing-modal-form" onSubmit={handleApplySubmit}>
                    <div className="landing-modal-group">
                      <label className="landing-modal-label">{t('careersPage.applyModalNameLabel')}</label>
                      <input 
                        type="text" 
                        className="landing-modal-input" 
                        required 
                        placeholder={t('careersPage.applyModalNamePlaceholder')}
                        value={applicantName}
                        onChange={(e) => setApplicantName(e.target.value)}
                      />
                    </div>
                    <div className="landing-modal-group">
                      <label className="landing-modal-label">{t('careersPage.applyModalEmailLabel')}</label>
                      <input 
                        type="email" 
                        className="landing-modal-input" 
                        required 
                        placeholder={t('careersPage.applyModalEmailPlaceholder')}
                        value={applicantEmail}
                        onChange={(e) => setApplicantEmail(e.target.value)}
                      />
                    </div>
                    <div className="landing-modal-group">
                      <label className="landing-modal-label">{t('careersPage.applyModalPhoneLabel')}</label>
                      <input 
                        type="tel" 
                        className="landing-modal-input" 
                        required 
                        placeholder={t('careersPage.applyModalPhonePlaceholder')}
                        value={applicantPhone}
                        onChange={(e) => setApplicantPhone(e.target.value)}
                      />
                    </div>
                    <div className="landing-modal-group">
                      <label className="landing-modal-label">{t('careersPage.applyModalNotesLabel')}</label>
                      <textarea 
                        className="landing-modal-textarea" 
                        placeholder={t('careersPage.applyModalNotesPlaceholder')}
                        value={applicantNotes}
                        onChange={(e) => setApplicantNotes(e.target.value)}
                      />
                    </div>
                    <button type="submit" className="landing-search-btn" style={{ marginTop: '0.5rem' }}>
                      {t('careersPage.applyModalSubmit')}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Careers;
