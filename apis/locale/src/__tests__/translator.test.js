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

  describe('short language codes', () => {
    test('should expand short initial language', () => {
      const t = translatorFn({ initial: 'sv' });
      t.add({ id: 'x', locale: { 'sv-SE': 'sv', 'en-US': 'us' } });

      expect(t.language()).toBe('sv-SE');
      expect(t.get('x')).toBe('sv');
    });

    test('should expand short language when set', () => {
      const t = translatorFn();
      t.add({ id: 'x', locale: { 'pt-BR': 'pt', 'en-US': 'us' } });

      expect(t.language('pt')).toBe('pt-BR');
      expect(t.get('x')).toBe('pt');
    });

    test('should leave full, region-specific and unknown languages untouched', () => {
      const t = translatorFn();

      expect(t.language('zh-TW')).toBe('zh-TW');
      expect(t.language('de-DE')).toBe('de-DE');
      expect(t.language('zz')).toBe('zz');
      expect(t.language('toString')).toBe('toString');
    });
  });
});
