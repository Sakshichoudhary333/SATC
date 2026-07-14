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
          <Link to="/" className="landing-nav-link">Home</Link>
          <Link to="/about" className="landing-nav-link">About</Link>
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
      <section className="careers-hero-section">
        <div className="careers-hero-glow"></div>
        <div className="careers-container">
          <h1 className="careers-main-title">Careers</h1>
          <h2 className="careers-subtitle">Join Our Team</h2>
          <p className="careers-intro-text">
            At <strong>Logistics Management System</strong>, we believe that great people drive great logistics. We are looking for dedicated professionals who are passionate about delivering exceptional service and ensuring smooth transportation operations. If you're ready to build your career in the logistics industry, we'd love to hear from you.
          </p>
        </div>
      </section>

      {/* Openings Section */}
      <section className="careers-openings-section">
        <div className="careers-container">
          <h2 className="careers-section-title">Current Openings</h2>
          <div className="careers-openings-list">
            
            {/* Opening 1 */}
            <div className="careers-job-card">
              <div className="careers-job-header">
                <div>
                  <span className="careers-job-badge">Full-Time</span>
                  <h3 className="careers-job-title">🚚 Truck Driver</h3>
                  <div className="careers-job-meta">
                    <span><FaMapMarkerAlt /> Remote / On-Road</span>
                    <span>• Experience: 1+ Years</span>
                  </div>
                </div>
                <button className="careers-apply-btn" onClick={() => openApplyModal('Truck Driver')}>Apply Now</button>
              </div>
              <div className="careers-job-body">
                <div className="careers-job-col">
                  <h4>Responsibilities</h4>
                  <ul>
                    <li>Deliver goods safely and on time.</li>
                    <li>Follow assigned routes and delivery schedules.</li>
                    <li>Update trip status through the Logistics Management System.</li>
                    <li>Share live GPS location during deliveries.</li>
                    <li>Record trip-related expenses such as fuel and tolls.</li>
                    <li>Perform basic vehicle inspections before and after each trip.</li>
                  </ul>
                </div>
                <div className="careers-job-col">
                  <h4>Requirements</h4>
                  <ul>
                    <li>Valid commercial driving license.</li>
                    <li>Good knowledge of road safety and traffic regulations.</li>
                    <li>Responsible, punctual, and customer-focused.</li>
                    <li>Ability to use a smartphone for trip updates.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Opening 2 */}
            <div className="careers-job-card">
              <div className="careers-job-header">
                <div>
                  <span className="careers-job-badge">Office / Remote</span>
                  <h3 className="careers-job-title">🎧 Customer Support Executive</h3>
                  <div className="careers-job-meta">
                    <span><FaMapMarkerAlt /> Jaipur Hub</span>
                    <span>• Experience: Freshers / Experienced</span>
                  </div>
                </div>
                <button className="careers-apply-btn" onClick={() => openApplyModal('Customer Support Executive')}>Apply Now</button>
              </div>
              <div className="careers-job-body">
                <div className="careers-job-col">
                  <h4>Responsibilities</h4>
                  <ul>
                    <li>Assist customers with shipment bookings and delivery updates.</li>
                    <li>Respond to customer inquiries via phone, email, or chat.</li>
                    <li>Resolve customer concerns in a professional manner.</li>
                    <li>Coordinate with drivers and the operations team.</li>
                    <li>Ensure a smooth and satisfying customer experience.</li>
                  </ul>
                </div>
                <div className="careers-job-col">
                  <h4>Requirements</h4>
                  <ul>
                    <li>Excellent communication and interpersonal skills.</li>
                    <li>Basic computer knowledge.</li>
                    <li>Strong problem-solving abilities.</li>
                    <li>Ability to work in a fast-paced environment.</li>
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
          <h2 className="careers-section-title">Why Join Us?</h2>
          <div className="careers-why-grid">
            <div className="careers-why-card">
              <div className="careers-why-check">✓</div>
              <p>Professional and supportive work environment.</p>
            </div>
            <div className="careers-why-card">
              <div className="careers-why-check">✓</div>
              <p>Opportunities for career growth and skill development.</p>
            </div>
            <div className="careers-why-card">
              <div className="careers-why-check">✓</div>
              <p>Modern technology-driven logistics operations.</p>
            </div>
            <div className="careers-why-card">
              <div className="careers-why-check">✓</div>
              <p>Performance-based rewards and recognition.</p>
            </div>
            <div className="careers-why-card">
              <div className="careers-why-check">✓</div>
              <p>Safe and collaborative workplace.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Apply Section */}
      <section className="careers-apply-section">
        <div className="careers-container careers-apply-box">
          <h2 className="careers-apply-box-title">Apply Now</h2>
          <p className="careers-apply-text">
            Interested candidates are welcome to apply by submitting their resume through our recruitment portal or contacting our HR team. We look forward to welcoming passionate individuals who want to grow with us and contribute to delivering reliable logistics services.
          </p>
          <div className="careers-contact-info-row">
            <div className="careers-info-badge">
              <FaEnvelope /> recruitment@tmslogistics.com
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

      {/* Quick Apply Modal */}
      {isApplyModalOpen && (
        <div className="landing-modal-overlay" onClick={closeApplyModal}>
          <div className="landing-modal-container" onClick={(e) => e.stopPropagation()}>
            <button className="landing-modal-close" onClick={closeApplyModal}>&times;</button>
            <div className="landing-modal-content">
              {appSubmitted ? (
                <div className="landing-modal-success">
                  <div className="landing-modal-success-icon">✓</div>
                  <h3 className="landing-modal-title">Application Submitted!</h3>
                  <p className="landing-modal-subtitle">Thank you for applying, {applicantName}.</p>
                  <p className="landing-modal-text" style={{ marginTop: '0.5rem' }}>
                    We have received your application for the <strong>{selectedJob}</strong> position. Our HR team will review your profile and contact you soon.
                  </p>
                  <button 
                    className="landing-search-btn" 
                    style={{ marginTop: '1.5rem', padding: '0.65rem 2rem' }}
                    onClick={closeApplyModal}
                  >
                    Close
                  </button>
                </div>
              ) : (
                <>
                  <div className="landing-modal-header">
                    <h3 className="landing-modal-title">Quick Apply</h3>
                    <p className="landing-modal-subtitle">Applying for: {selectedJob}</p>
                    <p className="landing-modal-text">
                      Share your details and HR will reach out for the next steps.
                    </p>
                  </div>
                  <form className="landing-modal-form" onSubmit={handleApplySubmit}>
                    <div className="landing-modal-group">
                      <label className="landing-modal-label">Name</label>
                      <input 
                        type="text" 
                        className="landing-modal-input" 
                        required 
                        placeholder="Enter your name"
                        value={applicantName}
                        onChange={(e) => setApplicantName(e.target.value)}
                      />
                    </div>
                    <div className="landing-modal-group">
                      <label className="landing-modal-label">Email Address</label>
                      <input 
                        type="email" 
                        className="landing-modal-input" 
                        required 
                        placeholder="Enter your email"
                        value={applicantEmail}
                        onChange={(e) => setApplicantEmail(e.target.value)}
                      />
                    </div>
                    <div className="landing-modal-group">
                      <label className="landing-modal-label">Phone Number</label>
                      <input 
                        type="tel" 
                        className="landing-modal-input" 
                        required 
                        placeholder="Enter your phone number"
                        value={applicantPhone}
                        onChange={(e) => setApplicantPhone(e.target.value)}
                      />
                    </div>
                    <div className="landing-modal-group">
                      <label className="landing-modal-label">Cover Letter / Notes</label>
                      <textarea 
                        className="landing-modal-textarea" 
                        placeholder="Tell us why you are a good fit..."
                        value={applicantNotes}
                        onChange={(e) => setApplicantNotes(e.target.value)}
                      />
                    </div>
                    <button type="submit" className="landing-search-btn" style={{ marginTop: '0.5rem' }}>
                      Submit Application
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
