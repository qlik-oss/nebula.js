describe('nucleus', () => {
  let appThemeFn;
  let create;
  let createObject;
  let getObject;
  let sandbox;
  let rootApp;
  let translator;
  before(() => {
    sandbox = sinon.createSandbox({ useFakeTimers: true });
    createObject = sandbox.stub();
    getObject = sandbox.stub();
    appThemeFn = sandbox.stub();
    rootApp = sandbox.stub();
    translator = { add: sandbox.stub(), language: sandbox.stub() };
    [{ default: create }] = aw.mock(
      [
        ['**/locale/app-locale.js', () => () => ({ translator })],
        ['**/selections/index.js', () => ({ createAppSelectionAPI: () => ({}) })],
        ['**/components/NebulaApp.jsx', () => rootApp],
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
    appThemeFn.returns({ externalAPI: 'internal', setTheme: sandbox.stub() });
    rootApp.returns([{}]);
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

  it('should initite root app with context', () => {
    create('app');
    expect(rootApp).to.have.been.calledWithExactly({
      app: 'app',
      context: {
        language: 'en-US',
        theme: 'light',
        permissions: ['idle', 'interact', 'select', 'fetch'],
        translator,
      },
    });
  });

  it('should only update context when property is known and changed', async () => {
    const root = { context: sandbox.stub() };
    const theme = { setTheme: sandbox.stub() };

    rootApp.returns([root]);
    appThemeFn.returns(theme);

    const nuked = create('app');
    expect(root.context.callCount).to.equal(0);

    nuked.context({ foo: 'a' });
    expect(root.context.callCount).to.equal(0);

    nuked.context({ permissions: 'a' });
    expect(root.context.callCount).to.equal(1);

    nuked.context({ language: 'sv-SE' });
    expect(root.context.callCount).to.equal(2);
    expect(translator.language).to.have.been.calledWithExactly('sv-SE');

    await nuked.context({ theme: 'sv-SE' });
    expect(root.context.callCount).to.equal(3);
    expect(theme.setTheme).to.have.been.calledWithExactly('sv-SE');
  });
});
