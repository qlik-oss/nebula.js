describe('test-utils', () => {
  let sandbox;
  let create;
  let hook;
  let hooked;

  before(() => {
    sandbox = sinon.createSandbox();

    hooked = {
      __hooked: true,
      fn: sandbox.stub(),
      initiate: sandbox.stub(),
      run: sandbox.stub(),
      teardown: sandbox.stub(),
      runSnaps: sandbox.stub(),
      observeActions: sandbox.stub(),
      getImperativeHandle: sandbox.stub(),
      updateRectOnNextRun: sandbox.stub(),
    };
    hook = sandbox.stub().returns(hooked);
    [{ create }] = aw.mock([['@nebula.js/stardust', () => ({ __DO_NOT_USE__: { hook } })]], ['../index']);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should return api', () => {
    const c = create();
    expect(c.update).to.be.a('function');
    expect(c.unmount).to.be.a('function');
    expect(c.takeSnapshot).to.be.a('function');
    expect(c.actions).to.be.a('function');
  });

  it('should update', () => {
    const c = create();
    c.update();
    expect(hooked.run.callCount).to.equal(1);

    hooked.run.reset();
    const translator = {};
    const context = { translator };
    c.update(context);
    expect(hooked.run).to.have.been.calledWithExactly(
      sinon.match({
        context,
      })
    );
  });

  it('should update', () => {
    const c = create();
    c.unmount();
    expect(hooked.teardown.callCount).to.equal(1);
  });

  it('should take snapshot', () => {
    const c = create();
    c.takeSnapshot();
    expect(hooked.runSnaps.callCount).to.equal(1);
  });

  it('should do actions', () => {
    hooked.observeActions.callsArgWith(1, ['action']);
    const c = create();
    hooked.observeActions.reset();
    expect(c.actions()).to.deep.equals(['action']);
  });
});
