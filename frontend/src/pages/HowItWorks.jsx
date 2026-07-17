import React from 'react';
import { FaTruck, FaPlusCircle, FaUserCheck, FaMapMarkerAlt, FaRoute, FaCheckCircle, FaChartLine } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';
import PublicHeader from '../components/PublicHeader';
import PublicFooter from '../components/PublicFooter';
import './LandingPage.css'; // Reuse landing layout
import './HowItWorks.css';

const HowItWorks = () => {
  const { t } = useLanguage();


  const stepsData = [
    {
      num: "01",
      icon: <FaPlusCircle />,
      title: t('howItWorksPage.step1Title'),
      desc: t('howItWorksPage.step1Desc')
    },
    {
      num: "02",
      icon: <FaUserCheck />,
      title: t('howItWorksPage.step2Title'),
      desc: t('howItWorksPage.step2Desc')
    },
    {
      num: "03",
      icon: <FaRoute />,
      title: t('howItWorksPage.step3Title'),
      desc: t('howItWorksPage.step3Desc')
    },
    {
      num: "04",
      icon: <FaMapMarkerAlt />,
      title: t('howItWorksPage.step4Title'),
      desc: t('howItWorksPage.step4Desc')
    },
    {
      num: "05",
      icon: <FaCheckCircle />,
      title: t('howItWorksPage.step5Title'),
      desc: t('howItWorksPage.step5Desc')
    },
    {
      num: "06",
      icon: <FaChartLine />,
      title: t('howItWorksPage.step6Title'),
      desc: t('howItWorksPage.step6Desc')
    }
  ];

  return (
    <div className="landing-container">
      {/* Navigation Header */}
      <PublicHeader />

      {/* Hero Section */}
      <section className="hiw-hero-section">
        <div className="hiw-hero-glow"></div>
        <div className="hiw-container">
          <h1 className="hiw-main-title">{t('howItWorksPage.title')}</h1>
          <p className="hiw-intro-text">
            {t('howItWorksPage.subtitle')}
          </p>
        </div>
      </section>

      {/* Steps Lifecycle Section */}
      <section className="hiw-steps-section">
        <div className="hiw-container">
          <div className="hiw-timeline">
            
            {stepsData.map((step, idx) => (
              <div key={idx} className="hiw-timeline-item">
                <div className="hiw-timeline-num-col">
                  <div className="hiw-timeline-circle">
                    <span className="hiw-step-num">{step.num}</span>
                  </div>
                  {idx !== stepsData.length - 1 && <div className="hiw-timeline-line"></div>}
                </div>
                
                <div className="hiw-timeline-content-col">
                  <div className="hiw-step-card">
                    <div className="hiw-step-header">
                      <div className="hiw-step-icon">{step.icon}</div>
                      <h3 className="hiw-step-title">{step.title}</h3>
                    </div>
                    <p className="hiw-step-desc">{step.desc}</p>
                  </div>
                </div>
              </div>
            ))}

          </div>
        </div>
      </section>

      {/* Footer */}
      <PublicFooter />
    </div>
  );
};

export default HowItWorks;
