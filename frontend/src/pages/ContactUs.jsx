import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import PublicHeader from '../components/PublicHeader';
import PublicFooter from '../components/PublicFooter';
import './LandingPage.css'; // Reuse landing layout
import './ContactUs.css';

const ContactUs = () => {
  const { t } = useLanguage();


  // Contact form states
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);



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
      <PublicHeader />

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
      <PublicFooter />
    </div>
  );
};

export default ContactUs;
