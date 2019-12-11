describe('get-object', () => {
  const optional = 'optional';
  let context = {};
  let create;
  let sandbox;
  let init;
  let objectModel;
  before(() => {
    sandbox = sinon.createSandbox();
    init = sandbox.stub();
    [{ default: create }] = aw.mock([['**/initiate.js', () => init]], ['../get-object.js']);
  });

  beforeEach(() => {
    objectModel = sandbox.stub();
    init.returns('api');
    context = { app: { id: 'appid', getObject: id => Promise.resolve(objectModel(id)) } };
  });

  afterEach(() => {
    sandbox.reset();
  });

  it('should get object from app only once', async () => {
    const model = 'model-x';
    objectModel.withArgs('x').returns(model);
    const spy = sandbox.spy(context.app, 'getObject');
    await create({ id: 'x' }, optional, context);
    await create({ id: 'x' }, optional, context);
    await create({ id: 'x' }, optional, context);
    expect(spy.callCount).to.equal(1);
    expect(spy).to.have.been.calledWithExactly('x');
  });

  it('should call init', async () => {
    const model = 'model-x';
    objectModel.withArgs('x').returns(model);
    const ret = await create({ id: 'x' }, optional, context);
    expect(ret).to.equal('api');
    expect(init).to.have.been.calledWithExactly(model, optional, context);
  });
});
