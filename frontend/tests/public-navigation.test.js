import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { describe, expect, test } from '@jest/globals';

const cwd = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => fs.readFileSync(path.resolve(cwd, relativePath), 'utf8');

describe('public navigation wiring', () => {
  test('landing page exposes the key public actions', () => {
    const landing = read('src/pages/LandingPage.jsx');
    const header = read('src/components/PublicHeader.jsx');
    const footer = read('src/components/PublicFooter.jsx');
    const routes = read('src/routes/AppRoutes.jsx');

    expect(landing).toContain('id="tracking-simulator"');
    expect(landing).toContain('landing-hero-btn-secondary');
    expect(header).toContain('to="/how-it-works"');
    expect(header).toContain('trackShipment');
    expect(footer).toContain('to="/faq"');
    expect(routes).toContain('path="/faq"');
    expect(routes).toContain('path="/how-it-works"');
    expect(routes).toContain('path="/track"');
  });

  test('faq page keeps the accordion button explicit and accessible', () => {
    const faq = read('src/pages/Faq.jsx');

    expect(faq).toContain('type="button"');
    expect(faq).toContain('faq-question-btn');
    expect(faq).toContain('toggleAccordion(index)');
  });
});
