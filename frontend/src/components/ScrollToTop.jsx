import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const elementId = hash.replace(/^#\/?/, '');
      const scrollToElement = () => {
        const element = document.getElementById(elementId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
          return true;
        }
        return false;
      };

      // Try immediately
      if (!scrollToElement()) {
        // Poll for element in case it hasn't mounted yet
        let count = 0;
        const interval = setInterval(() => {
          if (scrollToElement() || count > 50) {
            clearInterval(interval);
          }
          count++;
        }, 100);
        return () => clearInterval(interval);
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;
