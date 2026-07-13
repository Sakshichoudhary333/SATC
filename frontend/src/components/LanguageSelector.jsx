import { useEffect, useRef, useState } from 'react';
import { LANGUAGES } from '../i18n/translations';
import { useLanguage } from '../context/LanguageContext';

const LanguageSelector = () => {
  const { language, changeLanguage, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const current = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (code) => {
    changeLanguage(code);
    setOpen(false);
  };

  return (
    <div className="lang-selector" ref={ref}>
      <button
        type="button"
        className="lang-selector-btn"
        onClick={() => setOpen((v) => !v)}
        title={t('common.chooseLanguage')}
        aria-label={t('common.chooseLanguage')}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="lang-selector-icon" aria-hidden>🌐</span>
        <span className="lang-selector-label">{current.short}</span>
        <span className={`lang-selector-chevron${open ? ' open' : ''}`} aria-hidden>▾</span>
      </button>

      {open && (
        <ul className="lang-selector-menu" role="listbox" aria-label={t('common.chooseLanguage')}>
          {LANGUAGES.map((lang) => (
            <li key={lang.code} role="option" aria-selected={language === lang.code}>
              <button
                type="button"
                className={`lang-selector-option${language === lang.code ? ' active' : ''}`}
                onClick={() => handleSelect(lang.code)}
              >
                <span className="lang-option-code">{lang.short}</span>
                <span className="lang-option-name">{lang.label}</span>
                {language === lang.code && <span className="lang-option-check" aria-hidden>✓</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LanguageSelector;
