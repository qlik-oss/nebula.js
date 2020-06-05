describe('create-session-object', () => {
  let halo = {};
  let types;
  let sn;
  let merged;
  let create;
  let populator;
  let sandbox;
  let init;
  let objectModel;
  before(() => {
    sandbox = sinon.createSandbox();
    populator = sandbox.stub();
    init = sandbox.stub();
    [{ default: create }] = aw.mock(
      [
        ['**/populator.js', () => populator],
        ['**/initiate.js', () => init],
      ],
      ['../create-session-object.js']
    );
  });

  beforeEach(() => {
    objectModel = { id: 'id' };
    types = {
      get: sandbox.stub(),
    };
    halo = {
      app: {
        createSessionObject: sandbox.stub().returns(Promise.resolve(objectModel)),
      },
      types,
    };

    init.returns('api');

    sn = { qae: { properties: { onChange: sandbox.stub() } } };
    merged = { m: 'true' };
    const t = {
      initialProperties: sandbox.stub().returns(Promise.resolve(merged)),
      supernova: sandbox.stub().returns(Promise.resolve(sn)),
    };
    types.get.returns(t);
  });

  afterEach(() => {
    sandbox.reset();
  });

  it('should call types.get with name and version', () => {
    create({ type: 't', version: 'v', fields: 'f' }, halo);
    expect(types.get).to.have.been.calledWithExactly({ name: 't', version: 'v' });
  });

  it('should call initialProperties on returned type', () => {
    const t = { initialProperties: sinon.stub() };
    t.initialProperties.returns({ then: () => {} });
    types.get.returns(t);
    create({ type: 't', version: 'v', fields: 'f', properties: 'props' }, halo);
    expect(t.initialProperties).to.have.been.calledWithExactly('props');
  });

  it('should populate fields', async () => {
    await create({ type: 't', version: 'v', fields: 'f', properties: 'props' }, halo);
    expect(populator).to.have.been.calledWithExactly({ sn, properties: merged, fields: 'f' }, halo);
  });

  it('should call properties onChange handler when optional props are provided', async () => {
    await create({ type: 't', version: 'v', fields: 'f', properties: 'props' }, halo);
    expect(sn.qae.properties.onChange).to.have.been.calledWithExactly(merged);
  });

  it('should not call onChange handler when optional props are not provided', async () => {
    await create({ type: 't', version: 'v', fields: 'f' }, halo);
    expect(sn.qae.properties.onChange.callCount).to.equal(0);
  });

  it('should create a session object with merged props', async () => {
    await create({ type: 't', version: 'v', fields: 'f', properties: 'props' }, halo);
    expect(halo.app.createSessionObject).to.have.been.calledWithExactly(merged);
  });

  it('should create a dummy session object when error is thrown', async () => {
    types.get.throws('oops');
    await create({ type: 't', version: 'v', fields: 'f', properties: 'props' }, halo);
    expect(halo.app.createSessionObject).to.have.been.calledWithExactly({
      qInfo: { qType: 't' },
      visualization: 't',
    });
  });

  it('should call init', async () => {
    const ret = await create({ type: 't', version: 'v', fields: 'f', properties: 'props', options: 'a' }, halo);
    expect(ret).to.equal('api');
    expect(init).to.have.been.calledWithExactly(
      objectModel,
      { options: 'a', element: undefined },
      halo,
      undefined,
      sinon.match.func
    );
  });

  it('should catch and pass error', async () => {
    const err = new Error('oops');
    types.get.throws(err);
    const optional = { properties: 'props', element: 'el', options: 'opts' };
    const ret = await create({ type: 't', ...optional }, halo);
    expect(ret).to.equal('api');
    expect(init).to.have.been.calledWithExactly(
      objectModel,
      { options: 'opts', element: 'el' },
      halo,
      err,
      sinon.match.func
    );
  });
});
