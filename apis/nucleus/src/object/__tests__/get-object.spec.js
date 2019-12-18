describe('get-object', () => {
  const optional = 'optional';
  let context = {};
  let create;
  let sandbox;
  let init;
  let objectModel;
  let model;
  before(() => {
    sandbox = sinon.createSandbox();
    init = sandbox.stub();
    [{ default: create }] = aw.mock([['**/initiate.js', () => init]], ['../get-object.js']);
    model = {
      id: 'model-x',
      on: sandbox.spy(),
    };
  });

  beforeEach(() => {
    objectModel = sandbox.stub();
    init.returns('api');
    context = { app: { id: 'appid', getObject: async id => Promise.resolve(objectModel(id)) } };
  });

  afterEach(() => {
    sandbox.reset();
  });

  it('should get object from app only once', async () => {
    objectModel.withArgs('x').returns(model);
    const spy = sandbox.spy(context.app, 'getObject');
    await create({ id: 'x' }, optional, context);
    await create({ id: 'x' }, optional, context);
    await create({ id: 'x' }, optional, context);
    expect(spy.callCount).to.equal(1);
    expect(spy).to.have.been.calledWithExactly('x');
  });

  it('should call init', async () => {
    objectModel.withArgs('x').returns(model);
    const ret = await create({ id: 'x' }, optional, context);
    expect(ret).to.equal('api');
    expect(init).to.have.been.calledWithExactly(model, optional, context);
  });
});
