describe('set theme', () => {
  let sandbox;
  let create;
  let extend;
  let base;
  let light;
  let dark;
  let resolve;
  before(() => {
    sandbox = sinon.createSandbox();
    extend = sandbox.stub();
    resolve = sandbox.stub();
    base = { font: 'Arial' };
    light = { background: 'white' };
    dark = { background: 'black' };
    [{ default: create }] = aw.mock(
      [
        [require.resolve('extend'), () => extend],
        ['**/base.json', () => base],
        ['**/light.json', () => light],
        ['**/dark.json', () => dark],
      ],
      ['../set-theme.js']
    );
  });

  afterEach(() => {
    sandbox.reset();
  });

  it('should extend from light theme by default', () => {
    extend.returns({
      palettes: {},
    });
    create({}, resolve);
    expect(extend.firstCall).to.have.been.calledWithExactly(true, {}, base, light);
  });

  it('should extend from dark theme when type is dark', () => {
    extend.returns({
      palettes: {},
    });
    create(
      {
        type: 'dark',
      },
      resolve
    );
    expect(extend.firstCall).to.have.been.calledWithExactly(true, {}, base, dark);
  });

  it('should not extend scales and palette arrays', () => {
    const root = { color: 'pink', palettes: {} };
    const merged = { palettes: { data: [], ui: [] }, scales: [] };
    extend.onFirstCall().returns(root);
    extend.onSecondCall().returns(merged);
    const t = { color: 'red' };
    const prevent = { scales: null, palettes: { data: null, ui: null } };
    create(t, resolve);
    expect(extend.secondCall).to.have.been.calledWithExactly(true, {}, root, prevent, t);
    expect(resolve).to.have.been.calledWithExactly(merged);
  });

  it('should add defaults if custom scales and palettes are not provided', () => {
    const root = { color: 'pink', palettes: { data: 'data', ui: 'ui' }, scales: 'scales' };
    const merged = { palettes: {} };
    extend.onFirstCall().returns(root);
    extend.onSecondCall().returns(merged);
    const custom = { color: 'red' };
    create(custom, resolve);
    expect(resolve).to.have.been.calledWithExactly({
      palettes: { data: 'data', ui: 'ui' },
      scales: 'scales',
    });
  });

  it('should add defaults if custom scales and palettes are empty', () => {
    const root = { color: 'pink', palettes: { data: 'data', ui: 'ui' }, scales: 'scales' };
    const merged = { palettes: { data: [], ui: [] } };
    extend.onFirstCall().returns(root);
    extend.onSecondCall().returns(merged);
    const custom = { color: 'red' };
    create(custom, resolve);
    expect(resolve).to.have.been.calledWithExactly({
      palettes: { data: 'data', ui: 'ui' },
      scales: 'scales',
    });
  });

  it('should return resolved theme', () => {
    extend.onFirstCall().returns({ palettes: { data: 'data', ui: 'ui' }, scales: [] });
    extend.onSecondCall().returns({ palettes: { data: [], ui: [] }, scales: [] });
    resolve.returns('resolved');
    expect(create({}, resolve)).to.equal('resolved');
  });
});
