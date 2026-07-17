import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { FaTruck } from 'react-icons/fa';

const PublicFooter = () => {
  const { t } = useLanguage();

  return (
    <footer className="landing-footer">
      <div className="landing-footer-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <div className="landing-footer-brand">
          <Link to="/" className="landing-logo">
            <FaTruck size={22} color="var(--cyan)" />
            TMS<span>Logistics</span>
          </Link>
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
  );
};

export default PublicFooter;
