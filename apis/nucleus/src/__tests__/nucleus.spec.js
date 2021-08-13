describe('nucleus', () => {
  let appThemeFn;
  let create;
  let createObject;
  let deviceTypeFn;
  let getObject;
  let rootApp;
  let sandbox;
  let translator;
  let typesFn;

  before(() => {
    sandbox = sinon.createSandbox({ useFakeTimers: true });
    createObject = sandbox.stub();
    getObject = sandbox.stub();
    appThemeFn = sandbox.stub();
    deviceTypeFn = sandbox.stub();
    rootApp = sandbox.stub();
    translator = { add: sandbox.stub(), language: sandbox.stub() };
    typesFn = sandbox.stub();
    [{ default: create }] = aw.mock(
      [
        [require.resolve('../locale/app-locale.js'), () => () => ({ translator })],
        [require.resolve('../components/NebulaApp.jsx'), () => rootApp],
        [require.resolve('../components/selections/AppSelections.jsx'), () => () => ({})],
        [require.resolve('../object/create-session-object.js'), () => createObject],
        [require.resolve('../object/get-object.js'), () => getObject],
        [require.resolve('../sn/types.js'), () => ({ create: typesFn })],
        [require.resolve('../flags/flags.js'), () => () => 'flags'],
        [require.resolve('../app-theme.js'), () => appThemeFn],
        [require.resolve('../device-type.js'), () => deviceTypeFn],
      ],
      ['../index.js']
    );
  });

  beforeEach(() => {
    createObject.returns('created object');
    getObject.returns('got object');
    appThemeFn.returns({ externalAPI: 'internal', setTheme: sandbox.stub() });
    deviceTypeFn.returns('desktop');
    typesFn.returns({});
    rootApp.returns([{}]);
  });

  afterEach(() => {
    sandbox.reset();
    sandbox.restore();
  });

  it('should initiate types with a public galaxy interface', () => {
    create('app', {
      anything: {
        some: 'thing',
      },
    });
    const { galaxy } = typesFn.getCall(0).args[0].halo.public;
    expect(galaxy.nebbie).to.be.ok;
    delete galaxy.nebbie;
    expect(galaxy).to.eql({
      anything: {
        some: 'thing',
      },
      flags: 'flags',
      deviceType: 'desktop',
      translator,
    });
  });

  it('should wait for theme before rendering object', async () => {
    let waited = false;
    const delay = 1000;
    appThemeFn.returns({
      setTheme: () =>
        new Promise((resolve) => {
          setTimeout(() => {
            waited = true;
            resolve();
          }, delay);
        }),
    });

    const nuked = create();
    const prom = nuked.render({});
    sandbox.clock.tick(delay + 100);
    const c = await prom;
    expect(waited).to.equal(true);
    expect(c).to.equal('created object');
  });

  it('should initite root app with context', () => {
    create('app');
    expect(rootApp).to.have.been.calledWithExactly({
      app: 'app',
      context: {
        constraints: {},
        deviceType: 'auto',
        language: 'en-US',
        theme: 'light',
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

    nuked.context({ constraints: 'a' });
    expect(root.context.callCount).to.equal(1);

    nuked.context({ language: 'sv-SE' });
    expect(root.context.callCount).to.equal(2);
    expect(translator.language).to.have.been.calledWithExactly('sv-SE');

    await nuked.context({ theme: 'sv-SE' });
    expect(root.context.callCount).to.equal(3);
    expect(theme.setTheme).to.have.been.calledWithExactly('sv-SE');
  });

  it('should avoid type duplication', () => {
    const nuked = create.createConfiguration({ types: ['foo', 'bar', 'foo', 'foo', 'baz'] });
    expect(nuked.config.types).to.eql(['foo', 'bar', 'baz']);
  });
});
