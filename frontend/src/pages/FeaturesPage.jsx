import React from 'react';
import { FaTruck, FaShieldAlt, FaCogs, FaRoute, FaFileInvoiceDollar, FaCheckCircle, FaUserLock, FaChartBar, FaMobileAlt, FaClipboardList } from 'react-icons/fa';
import { MdSpeed } from 'react-icons/md';
import { useLanguage } from '../context/LanguageContext';
import PublicHeader from '../components/PublicHeader';
import PublicFooter from '../components/PublicFooter';
import './LandingPage.css'; // Reuse landing layout
import './FeaturesPage.css';

const FeaturesPage = () => {
  const { t } = useLanguage();


  return (
    <div className="landing-container">
      <PublicHeader />

      {/* Hero Section */}
      <section className="feat-hero-section">
        <div className="feat-hero-glow"></div>
        <div className="feat-container">
          <h1 className="feat-main-title">{t('featuresPage.title')}</h1>
          <h2 className="feat-subtitle">{t('featuresPage.subtitle')}</h2>
          <p className="feat-intro-text">
            {t('featuresPage.desc')}
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
              <h3>{t('featuresPage.feat1')}</h3>
              <p>{t('featuresPage.feat1Desc')}</p>
            </div>

            {/* Feature 2 */}
            <div className="feat-card">
              <div className="feat-card-icon"><FaRoute /></div>
              <h3>{t('featuresPage.feat2')}</h3>
              <p>{t('featuresPage.feat2Desc')}</p>
            </div>

            {/* Feature 3 */}
            <div className="feat-card">
              <div className="feat-card-icon"><FaCogs /></div>
              <h3>{t('featuresPage.feat3')}</h3>
              <p>{t('featuresPage.feat3Desc')}</p>
            </div>

            {/* Feature 4 */}
            <div className="feat-card">
              <div className="feat-card-icon"><FaTruck /></div>
              <h3>{t('featuresPage.feat4')}</h3>
              <p>{t('featuresPage.feat4Desc')}</p>
            </div>

            {/* Feature 5 */}
            <div className="feat-card">
              <div className="feat-card-icon"><MdSpeed /></div>
              <h3>{t('featuresPage.feat5')}</h3>
              <p>{t('featuresPage.feat5Desc')}</p>
            </div>

            {/* Feature 6 */}
            <div className="feat-card">
              <div className="feat-card-icon"><FaFileInvoiceDollar /></div>
              <h3>{t('featuresPage.feat6')}</h3>
              <p>{t('featuresPage.feat6Desc')}</p>
            </div>

            {/* Feature 7 */}
            <div className="feat-card">
              <div className="feat-card-icon"><FaCheckCircle /></div>
              <h3>{t('featuresPage.feat7')}</h3>
              <p>{t('featuresPage.feat7Desc')}</p>
            </div>

            {/* Feature 8 */}
            <div className="feat-card">
              <div className="feat-card-icon"><FaUserLock /></div>
              <h3>{t('featuresPage.feat8')}</h3>
              <p>{t('featuresPage.feat8Desc')}</p>
            </div>

            {/* Feature 9 */}
            <div className="feat-card">
              <div className="feat-card-icon"><FaChartBar /></div>
              <h3>{t('featuresPage.feat9')}</h3>
              <p>{t('featuresPage.feat9Desc')}</p>
            </div>

            {/* Feature 10 */}
            <div className="feat-card">
              <div className="feat-card-icon"><FaMobileAlt /></div>
              <h3>{t('featuresPage.feat10')}</h3>
              <p>{t('featuresPage.feat10Desc')}</p>
            </div>

          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="feat-why-section">
        <div className="feat-container">
          <h2 className="feat-section-title">{t('featuresPage.whyTitle')}</h2>
          <div className="feat-why-grid">
            <div className="feat-why-item">
              <span className="feat-bullet">✓</span>
              <span>{t('featuresPage.why1')}</span>
            </div>
            <div className="feat-why-item">
              <span className="feat-bullet">✓</span>
              <span>{t('featuresPage.why2')}</span>
            </div>
            <div className="feat-why-item">
              <span className="feat-bullet">✓</span>
              <span>{t('featuresPage.why3')}</span>
            </div>
            <div className="feat-why-item">
              <span className="feat-bullet">✓</span>
              <span>{t('featuresPage.why4')}</span>
            </div>
            <div className="feat-why-item">
              <span className="feat-bullet">✓</span>
              <span>{t('featuresPage.why5')}</span>
            </div>
            <div className="feat-why-item">
              <span className="feat-bullet">✓</span>
              <span>{t('featuresPage.why6')}</span>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};

export default FeaturesPage;
