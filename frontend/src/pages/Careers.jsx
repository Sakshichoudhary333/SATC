import React, { useState } from 'react';
import { FaTruck, FaShieldAlt, FaEnvelope, FaPhoneAlt, FaCheckCircle, FaUserTie, FaMapMarkerAlt } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';
import PublicHeader from '../components/PublicHeader';
import PublicFooter from '../components/PublicFooter';
import './LandingPage.css'; // Reuse landing theme layouts
import './Careers.css';

const Careers = () => {
  const { t } = useLanguage();


  // Application form states
  const [selectedJob, setSelectedJob] = useState('');
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [applicantName, setApplicantName] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [applicantNotes, setApplicantNotes] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [appSubmitted, setAppSubmitted] = useState(false);



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
    setResumeFile(null);
    setFileError('');
    setAppSubmitted(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFileError('');
    
    if (!file) {
      setResumeFile(null);
      return;
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      setFileError('Please upload a PDF, DOC, or DOCX file only.');
      setResumeFile(null);
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      setFileError('File size must be less than 5MB.');
      setResumeFile(null);
      return;
    }

    setResumeFile(file);
  };

  const handleApplySubmit = (e) => {
    e.preventDefault();
    if (!applicantName || !applicantEmail || !applicantPhone) {
      alert("Please fill in all required fields.");
      return;
    }
    if (!resumeFile) {
      setFileError('Please upload your resume.');
      return;
    }
    setAppSubmitted(true);
  };

  return (
    <div className="landing-container">
      {/* Navigation Header */}
      <PublicHeader />

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
      <PublicFooter />

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
                    <div className="landing-modal-group">
                      <label className="landing-modal-label">Resume/CV *</label>
                      <input 
                        type="file" 
                        className="landing-modal-input" 
                        required 
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                      />
                      <small style={{ color: 'var(--muted)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                        Accepted formats: PDF, DOC, DOCX (Max 5MB)
                      </small>
                      {fileError && (
                        <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                          {fileError}
                        </div>
                      )}
                      {resumeFile && (
                        <div style={{ color: '#10b981', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                          ✓ Selected: {resumeFile.name} ({(resumeFile.size / 1024).toFixed(1)} KB)
                        </div>
                      )}
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
