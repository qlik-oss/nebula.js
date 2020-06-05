/* eslint no-underscore-dangle:0 */
describe('initiate api', () => {
  const optional = 'optional';
  const halo = 'halo';
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
      __DO_NOT_USE__: {
        mount: sandbox.stub(),
        options: sandbox.stub(),
      },
    };
    viz.returns(api);
  });

  afterEach(() => {
    sandbox.reset();
  });

  it('should call viz api', async () => {
    const initialError = 'err';
    const onDestroy = () => {};
    const ret = await create(model, optional, halo, initialError, onDestroy);
    expect(viz).to.have.been.calledWithExactly({ model, halo, initialError, onDestroy });
    expect(ret).to.equal(api);
  });

  it('should call mount when element is provided ', async () => {
    await create(model, { element: 'el' }, halo);
    expect(api.__DO_NOT_USE__.mount).to.have.been.calledWithExactly('el');
  });

  it('should call options when provided ', async () => {
    await create(model, { options: 'opts' }, halo);
    expect(api.__DO_NOT_USE__.options).to.have.been.calledWithExactly('opts');
  });
});
