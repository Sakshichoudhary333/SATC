import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { FaChevronDown } from 'react-icons/fa';
import PublicHeader from '../components/PublicHeader';
import PublicFooter from '../components/PublicFooter';
import './LandingPage.css'; // Reuse landing layout
import './Faq.css';

const Faq = () => {
  const { t } = useLanguage();

  // Accordion state
  const [expandedIndex, setExpandedIndex] = useState(null);

  const toggleAccordion = (index) => {
    if (expandedIndex === index) {
      setExpandedIndex(null);
    } else {
      setExpandedIndex(index);
    }
  };

  const faqData = [
    {
      q: t('faqPage.q1'),
      a: t('faqPage.a1')
    },
    {
      q: t('faqPage.q2'),
      a: t('faqPage.a2')
    },
    {
      q: t('faqPage.q3'),
      a: t('faqPage.a3')
    },
    {
      q: t('faqPage.q4'),
      a: t('faqPage.a4')
    },
    {
      q: t('faqPage.q5'),
      a: t('faqPage.a5')
    },
    {
      q: t('faqPage.q6'),
      a: t('faqPage.a6')
    },
    {
      q: t('faqPage.q7'),
      a: t('faqPage.a7')
    },
    {
      q: t('faqPage.q8'),
      a: t('faqPage.a8')
    },
    {
      q: t('faqPage.q9'),
      a: t('faqPage.a9')
    },
    {
      q: t('faqPage.q10'),
      a: t('faqPage.a10')
    }
  ];

  return (
    <div className="landing-container">
      <PublicHeader />

      {/* Hero Section */}
      <section className="faq-hero-section">
        <div className="faq-hero-glow"></div>
        <div className="faq-container">
          <h1 className="faq-main-title">{t('faqPage.title')}</h1>
          <p className="faq-intro-text">
            {t('faqPage.subtitle')}
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
                    <button type="button" className="faq-question-btn" onClick={() => toggleAccordion(index)}>
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

      <PublicFooter />
    </div>
  );
};

export default Faq;
