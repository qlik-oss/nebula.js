import translatorFn from '../translator';

describe('translator', () => {
  beforeEach(() => {});

  it('should prefer en-US by default', () => {
    const t = translatorFn({
      fallback: 'b',
    });

    t.add({
      id: 'x',
      locale: {
        'en-US': 'us',
      },
    });

    expect(t.get('x')).to.equal('us');
  });

  it('should prefer initial locale', () => {
    const t = translatorFn({ initial: 'sv-SE' });

    t.add({
      id: 'x',
      locale: {
        'sv-SE': 'sv',
      },
    });

    expect(t.get('x')).to.equal('sv');
  });

  it('should fallback to en-US by default', () => {
    const t = translatorFn({ initial: 'sv-SE' });

    t.add({
      id: 'x',
      locale: {
        'en-US': 'us',
      },
    });

    expect(t.get('x')).to.equal('us');
  });

  it('should fallback to sv-SE', () => {
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

    expect(t.get('x')).to.equal('sv');
  });

  it('should return string id when not registered', () => {
    const t = translatorFn();
    expect(t.get('x')).to.equal('x');
  });

  it('should format strings with args', () => {
    const t = translatorFn();

    t.add({
      id: 'x',
      locale: {
        'en-US': 'hello {0} {1}',
      },
    });

    expect(t.get('x', ['a', 'b'])).to.equal('hello a b');
  });
});
