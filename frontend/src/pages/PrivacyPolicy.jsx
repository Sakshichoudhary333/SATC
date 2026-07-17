import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import PublicHeader from '../components/PublicHeader';
import PublicFooter from '../components/PublicFooter';
import './LandingPage.css';

const PrivacyPolicy = () => {
  const { t } = useLanguage();


  return (
    <div className="landing-container">
      {/* Navigation Header */}
      <PublicHeader />

      {/* Privacy Policy Content */}
      <section className="about-hero-section">
        <div className="about-hero-glow"></div>
        <div className="about-container" style={{ maxWidth: '800px' }}>
          <h1 className="about-main-title">{t('privacyPage.title')}</h1>
          
          <div className="about-intro-text" style={{ lineHeight: '1.8', fontSize: '1.05rem' }}>
            <p style={{ marginBottom: '1.5rem' }}>
              {t('privacyPage.p1')}
            </p>
            
            <p style={{ marginBottom: '1.5rem' }}>
              {t('privacyPage.p2')}
            </p>
            
            <p style={{ marginBottom: '1.5rem' }}>
              {t('privacyPage.p3')}
            </p>
            
            <p style={{ marginBottom: '1.5rem' }}>
              {t('privacyPage.p4')}
            </p>
            
            <p style={{ marginBottom: '1.5rem' }}>
              {t('privacyPage.p5')} <Link to="/contact" style={{ color: 'var(--cyan)' }}>{t('landing.contactUs') || 'Contact Us'}</Link>
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <PublicFooter />
    </div>
  );
};

export default PrivacyPolicy;
