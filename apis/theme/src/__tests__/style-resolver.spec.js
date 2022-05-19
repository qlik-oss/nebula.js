describe('style-resolver', () => {
  let sandbox;
  let create;
  let extend;
  before(() => {
    sandbox = sinon.createSandbox();
    extend = sandbox.stub();
    [{ default: create }] = aw.mock([[require.resolve('extend'), () => extend]], ['../style-resolver.js']);
  });

  afterEach(() => {
    sandbox.reset();
  });

  it('getStyle from root', () => {
    const t = {
      fontSize: '16px',
    };
    const s = create('base.path', t);

    expect(s.getStyle('', 'fontSize')).to.equal('16px');
  });

  it('getStyle from object', () => {
    const t = {
      object: {
        bar: {
          legend: {
            title: {
              fontSize: '13px',
            },
          },
        },
      },
      fontSize: '16px',
    };
    const s = create('object.bar', t);

    expect(s.getStyle('', 'fontSize')).to.equal('16px');
    expect(s.getStyle('legend', 'fontSize')).to.equal('16px');
    expect(s.getStyle('legend.content', 'fontSize')).to.equal('16px');
    expect(s.getStyle('title', 'fontSize')).to.equal('16px');

    expect(s.getStyle('legend.title', 'fontSize')).to.equal('13px');
    expect(s.getStyle('legend.content', 'color')).to.equal(undefined);

    expect(s.getStyle('.', 'legend.title.fontSize')).to.equal('13px');
    expect(s.getStyle('legend.', 'title.fontSize')).to.equal('13px');
    expect(s.getStyle('legend.', 'content.fontSize')).to.equal(undefined);
    expect(s.getStyle('legend.', 'content.color')).to.equal(undefined);

    expect(s.getStyle('table', 'fontSize')).to.equal('16px');
    expect(s.getStyle('table', 'content.fontSize')).to.equal(undefined);
  });

  it('resolveRawTheme', () => {
    const variables = {
      '@text': 'pink',
      '@size': 'mini',
    };
    const raw = {
      chart: {
        bg: 'red',
        color: '@text',
      },
      responsive: '@size',
      _variables: variables,
    };
    extend.returns(raw);
    expect(create.resolveRawTheme(raw)).to.eql({
      chart: {
        bg: 'red',
        color: 'pink',
      },
      responsive: 'mini',
      _variables: variables,
    });
  });
});
