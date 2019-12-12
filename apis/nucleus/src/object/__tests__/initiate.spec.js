describe('initiate api', () => {
  const optional = 'optional';
  const corona = 'corona';
  const model = 'model';
  let create;
  let sandbox;
  let viz;
  let api;
  before(() => {
    sandbox = sinon.createSandbox();
    viz = sandbox.stub();
    [{ default: create }] = aw.mock([['**/viz.js', () => viz]], ['../initiate.js']);
  });

  beforeEach(() => {
    api = {
      mount: sandbox.stub(),
      options: sandbox.stub(),
      context: sandbox.stub(),
    };
    viz.returns(api);
  });

  afterEach(() => {
    sandbox.reset();
  });

  it('should call viz api', async () => {
    const initialError = 'err';
    const ret = await create(model, optional, corona, initialError);
    expect(viz).to.have.been.calledWithExactly({ model, corona, initialError });
    expect(ret).to.equal(api);
  });

  it('should call mount when element is provided ', async () => {
    await create(model, { element: 'el' }, corona);
    expect(api.mount).to.have.been.calledWithExactly('el');
  });

  it('should call options when provided ', async () => {
    await create(model, { options: 'opts' }, corona);
    expect(api.options).to.have.been.calledWithExactly('opts');
  });

  it('should call context when provided ', async () => {
    await create(model, { context: 'ctx' }, corona);
    expect(api.context).to.have.been.calledWithExactly('ctx');
  });
});
