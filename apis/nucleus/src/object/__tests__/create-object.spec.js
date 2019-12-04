describe('create-object', () => {
  let context = {};
  let types;
  let sn;
  let merged;
  let create;
  let populator;
  let sandbox;
  before(() => {
    sandbox = sinon.createSandbox();
    populator = sandbox.stub();
    [{ default: create }] = aw.mock([['**/populator.js', () => populator]], ['../create-object.js']);
  });

  beforeEach(() => {
    types = {
      get: sandbox.stub(),
    };
    context = {
      app: {
        createSessionObject: sandbox.stub().returns(Promise.resolve({ id: 'id' })),
      },
      nebbie: {
        get: sandbox.stub().returns('got it'),
        types,
      },
    };

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
    create({ type: 't', version: 'v', fields: 'f' }, {}, context);
    expect(types.get).to.have.been.calledWithExactly({ name: 't', version: 'v' });
  });

  it('should call initialProperties on returned type', () => {
    const t = { initialProperties: sinon.stub() };
    t.initialProperties.returns({ then: () => {} });
    types.get.returns(t);
    create({ type: 't', version: 'v', fields: 'f' }, { properties: 'props' }, context);
    expect(t.initialProperties).to.have.been.calledWithExactly('props');
  });

  it('should populate fields', async () => {
    await create({ type: 't', version: 'v', fields: 'f' }, { properties: 'props' }, context);
    expect(populator).to.have.been.calledWithExactly({ sn, properties: merged, fields: 'f' }, context);
  });

  it('should call properties onChange handler when optional props are provided', async () => {
    await create({ type: 't', version: 'v', fields: 'f' }, { properties: 'props' }, context);
    expect(sn.qae.properties.onChange).to.have.been.calledWithExactly(merged);
  });

  it('should not call onChange handler when optional props are not provided', async () => {
    await create({ type: 't', version: 'v', fields: 'f' }, {}, context);
    expect(sn.qae.properties.onChange.callCount).to.equal(0);
  });

  it('should create a session object with merged props', async () => {
    await create({ type: 't', version: 'v', fields: 'f' }, { properties: 'props' }, context);
    expect(context.app.createSessionObject).to.have.been.calledWithExactly(merged);
  });

  it('should call nebbie get', async () => {
    const ret = await create({ type: 't', version: 'v', fields: 'f' }, { properties: 'props', x: 'a' }, context);
    expect(ret).to.equal('got it');
    expect(context.nebbie.get).to.have.been.calledWithExactly(
      {
        id: 'id',
      },
      {
        x: 'a',
        properties: {},
      }
    );
  });
});
