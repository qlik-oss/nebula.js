describe('nucleus', () => {
  let appThemeFn;
  let create;
  let createObject;
  let getObject;
  let sandbox;
  before(() => {
    sandbox = sinon.createSandbox({ useFakeTimers: true });
    createObject = sandbox.stub();
    getObject = sandbox.stub();
    appThemeFn = sandbox.stub();
    [{ default: create }] = aw.mock(
      [
        ['**/locale/app-locale.js', () => () => ({ translator: () => ({ add: () => {} }) })],
        ['**/selections/index.js', () => ({ createAppSelectionAPI: () => ({}) })],
        ['**/components/NebulaApp.jsx', () => () => [{}]],
        ['**/components/selections/AppSelections.jsx', () => () => ({})],
        ['**/object/create-object.js', () => createObject],
        ['**/object/get-object.js', () => getObject],
        ['**/sn/types.js', () => ({ create: () => ({}) })],
        ['**/utils/logger.js', () => () => ({})],
        ['**/app-theme.js', () => appThemeFn],
      ],
      ['../index.js']
    );
  });

  beforeEach(() => {
    createObject.returns('created object');
    getObject.returns('got object');
  });

  afterEach(() => {
    sandbox.reset();
  });

  it('should wait for theme before creating object', async () => {
    let waited = false;
    const delay = 1000;
    appThemeFn.returns({
      setTheme: () =>
        new Promise(resolve => {
          setTimeout(() => {
            waited = true;
            resolve();
          }, delay);
        }),
    });

    const nuked = create();
    const prom = nuked.create();
    sandbox.clock.tick(delay + 100);
    const c = await prom;
    expect(waited).to.equal(true);
    expect(c).to.equal('created object');
  });

  it('should wait for theme before getting object', async () => {
    let waited = false;
    const delay = 2000;
    appThemeFn.returns({
      setTheme: () =>
        new Promise(resolve => {
          setTimeout(() => {
            waited = true;
            resolve();
          }, delay);
        }),
    });

    const nuked = create();
    const prom = nuked.get();
    sandbox.clock.tick(delay + 100);
    const c = await prom;
    sandbox.clock.restore();
    expect(waited).to.equal(true);
    expect(c).to.equal('got object');
  });
});
