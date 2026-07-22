import { jest, afterEach, describe, expect, test } from '@jest/globals';
import { scrollToElementById } from '../src/utils/helpers.js';

describe('scrollToElementById', () => {
  const originalDocument = globalThis.document;

  afterEach(() => {
    globalThis.document = originalDocument;
  });

  test('returns false when the element is missing', () => {
    globalThis.document = {
      getElementById: () => null,
    };

    expect(scrollToElementById('missing-id')).toBe(false);
  });

  test('scrolls to the element when it exists', () => {
    const scrollIntoView = jest.fn();
    globalThis.document = {
      getElementById: () => ({ scrollIntoView }),
    };

    expect(scrollToElementById('tracking-simulator')).toBe(true);
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
  });
});
