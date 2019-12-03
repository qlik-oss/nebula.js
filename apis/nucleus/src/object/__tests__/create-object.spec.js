describe('create-object', () => {
  const doMock = ({ populator = () => {} } = {}) =>
    aw.mock([['**/populator.js', () => populator]], ['../create-object.js']);

  let context = {};
  let types;
  let sn;
  let merged;

  beforeEach(() => {
    types = {
      get: sinon.stub(),
    };
    context = {
      app: {
        createSessionObject: sinon.stub().returns(Promise.resolve({ id: 'id' })),
      },
      nebbie: {
        get: sinon.stub().returns('got it'),
        types,
      },
    };

    sn = { qae: { properties: { onChange: sinon.stub() } } };
    merged = { m: 'true' };
    const t = {
      initialProperties: sinon.stub().returns(Promise.resolve(merged)),
      supernova: sinon.stub().returns(Promise.resolve(sn)),
    };
    types.get.returns(t);
  });

  it('should call types.get with name and version', () => {
    const [{ default: create }] = doMock();
    create({ type: 't', version: 'v', fields: 'f' }, {}, context);
    expect(types.get).to.have.been.calledWithExactly({ name: 't', version: 'v' });
  });

  it('should call initialProperties on returned type', () => {
    const [{ default: create }] = doMock();
    const t = { initialProperties: sinon.stub() };
    t.initialProperties.returns({ then: () => {} });
    types.get.returns(t);
    create({ type: 't', version: 'v', fields: 'f' }, { properties: 'props' }, context);
    expect(t.initialProperties).to.have.been.calledWithExactly('props');
  });

  it('should populate fields', async () => {
    const p = sinon.stub();
    const [{ default: create }] = doMock({ populator: p });
    await create({ type: 't', version: 'v', fields: 'f' }, { properties: 'props' }, context);
    expect(p).to.have.been.calledWithExactly({ sn, properties: merged, fields: 'f' }, context);
  });

  it('should call properties onChange handler when optional props are provided', async () => {
    const [{ default: create }] = doMock();
    await create({ type: 't', version: 'v', fields: 'f' }, { properties: 'props' }, context);
    expect(sn.qae.properties.onChange).to.have.been.calledWithExactly(merged);
  });

  it('should not call onChange handler when optional props are not provided', async () => {
    const [{ default: create }] = doMock();
    await create({ type: 't', version: 'v', fields: 'f' }, {}, context);
    expect(sn.qae.properties.onChange.callCount).to.equal(0);
  });

  it('should create a session object with merged props', async () => {
    const [{ default: create }] = doMock();
    await create({ type: 't', version: 'v', fields: 'f' }, { properties: 'props' }, context);
    expect(context.app.createSessionObject).to.have.been.calledWithExactly(merged);
  });

  it('should call nebbie get', async () => {
    const [{ default: create }] = doMock();
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
