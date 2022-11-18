import translatorFn from '../translator';

describe('translator', () => {
  test('should prefer en-US by default', () => {
    const t = translatorFn({
      fallback: 'b',
    });

    t.add({
      id: 'x',
      locale: {
        'en-US': 'us',
      },
    });

    expect(t.get('x')).toBe('us');
  });

  test('should prefer initial locale', () => {
    const t = translatorFn({ initial: 'sv-SE' });

    t.add({
      id: 'x',
      locale: {
        'sv-SE': 'sv',
      },
    });

    expect(t.get('x')).toBe('sv');
  });

  test('should fallback to en-US by default', () => {
    const t = translatorFn({ initial: 'sv-SE' });

    t.add({
      id: 'x',
      locale: {
        'en-US': 'us',
      },
    });

    expect(t.get('x')).toBe('us');
  });

  test('should fallback to sv-SE', () => {
    const t = translatorFn({
      fallback: 'sv-SE',
    });

    t.add({
      id: 'x',
      locale: {
        a: 'AA',
        'sv-SE': 'sv',
      },
    });

    expect(t.get('x')).toBe('sv');
  });

  test('should return string id when not registered', () => {
    const t = translatorFn();
    expect(t.get('x')).toBe('x');
  });

  test('should format strings with args', () => {
    const t = translatorFn();

    t.add({
      id: 'x',
      locale: {
        'en-US': 'hello {0} {1}',
      },
    });

    expect(t.get('x', ['a', 'b'])).toBe('hello a b');
  });
});
