import React from 'react';
import { FaTruck, FaShieldAlt, FaRoute, FaCogs, FaFileInvoiceDollar, FaCheckCircle, FaGlobe, FaEye } from 'react-icons/fa';
import { MdSpeed } from 'react-icons/md';
import { useLanguage } from '../context/LanguageContext';
import PublicHeader from '../components/PublicHeader';
import PublicFooter from '../components/PublicFooter';
import './LandingPage.css'; // Reuse landing styling for layout and themes
import './AboutUs.css';

const AboutUs = () => {
  const { t } = useLanguage();


  return (
    <div className="landing-container">
      <PublicHeader />

      {/* About Main Section */}
      <section className="about-hero-section">
        <div className="about-hero-glow"></div>
        <div className="about-container">
          <h1 className="about-main-title">{t('aboutPage.title')}</h1>
          <p className="about-intro-text">
            {t('aboutPage.intro1')}
          </p>
          <p className="about-intro-text">
            {t('aboutPage.intro2')}
          </p>
        </div>
      </section>

      {/* Offerings Grid */}
      <section className="about-offer-section">
        <div className="about-container">
          <h2 className="about-section-title">{t('aboutPage.whatWeOffer')}</h2>
          <div className="about-offer-grid">
            <div className="about-card">
              <div className="about-card-icon"><FaFileInvoiceDollar /></div>
              <h3>{t('aboutPage.orderManagementTitle')}</h3>
              <p>{t('aboutPage.orderManagementDesc')}</p>
            </div>
            <div className="about-card">
              <div className="about-card-icon"><FaRoute /></div>
              <h3>{t('aboutPage.tripManagementTitle')}</h3>
              <p>{t('aboutPage.tripManagementDesc')}</p>
            </div>
            <div className="about-card">
              <div className="about-card-icon"><FaCogs /></div>
              <h3>{t('aboutPage.driverManagementTitle')}</h3>
              <p>{t('aboutPage.driverManagementDesc')}</p>
            </div>
            <div className="about-card">
              <div className="about-card-icon"><FaTruck /></div>
              <h3>{t('aboutPage.fleetManagementTitle')}</h3>
              <p>{t('aboutPage.fleetManagementDesc')}</p>
            </div>
            <div className="about-card">
              <div className="about-card-icon"><MdSpeed /></div>
              <h3>{t('aboutPage.liveGpsTitle')}</h3>
              <p>{t('aboutPage.liveGpsDesc')}</p>
            </div>
            <div className="about-card">
              <div className="about-card-icon"><FaFileInvoiceDollar /></div>
              <h3>{t('aboutPage.expenseManagementTitle')}</h3>
              <p>{t('aboutPage.expenseManagementDesc')}</p>
            </div>
            <div className="about-card">
              <div className="about-card-icon"><FaCheckCircle /></div>
              <h3>{t('aboutPage.reviewsFeedbackTitle')}</h3>
              <p>{t('aboutPage.reviewsFeedbackDesc')}</p>
            </div>
            <div className="about-card">
              <div className="about-card-icon"><FaShieldAlt /></div>
              <h3>{t('aboutPage.secureAccessTitle')}</h3>
              <p>{t('aboutPage.secureAccessDesc')}</p>
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
              <h2>{t('aboutPage.ourMission')}</h2>
            </div>
            <p>
              {t('aboutPage.missionDesc')}
            </p>
          </div>
          <div className="about-mission-card">
            <div className="about-icon-header">
              <FaEye size={28} color="var(--cyan)" />
              <h2>{t('aboutPage.ourVision')}</h2>
            </div>
            <p>
              {t('aboutPage.visionDesc')}
            </p>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="about-why-section">
        <div className="about-container">
          <h2 className="about-section-title">{t('aboutPage.whyChooseUs')}</h2>
          <div className="about-why-list">
            <div className="about-why-item">
              <span className="about-check-bullet">✓</span>
              <span>{t('aboutPage.why1')}</span>
            </div>
            <div className="about-why-item">
              <span className="about-check-bullet">✓</span>
              <span>{t('aboutPage.why2')}</span>
            </div>
            <div className="about-why-item">
              <span className="about-check-bullet">✓</span>
              <span>{t('aboutPage.why3')}</span>
            </div>
            <div className="about-why-item">
              <span className="about-check-bullet">✓</span>
              <span>{t('aboutPage.why4')}</span>
            </div>
            <div className="about-why-item">
              <span className="about-check-bullet">✓</span>
              <span>{t('aboutPage.why5')}</span>
            </div>
            <div className="about-why-item">
              <span className="about-check-bullet">✓</span>
              <span>{t('aboutPage.why6')}</span>
            </div>
            <div className="about-why-item">
              <span className="about-check-bullet">✓</span>
              <span>{t('aboutPage.why7')}</span>
            </div>
          </div>
          <p className="about-closing-tagline">
            {t('aboutPage.closingTagline')}
          </p>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};

export default AboutUs;
