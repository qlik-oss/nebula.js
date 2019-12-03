import { load, clearFromCache } from '../load';

describe('load', () => {
  let config = {};
  beforeEach(() => {
    config = {
      logger: {
        warn: sinon.stub(),
      },
      env: 'env',
      load: sinon.stub(),
    };
  });
  afterEach(() => {
    clearFromCache('pie');
  });

  it('should throw when resolving to a falsy value', async () => {
    const loader = () => false;
    try {
      await load('pie', '1.0.0', config, loader);
      expect(0).to.equal(1);
    } catch (e) {
      expect(e.message).to.equal("Failed to load supernova: 'pie v1.0.0'");
    }
  });

  it('should call load() with name and version', async () => {
    const loader = sinon.stub();
    load('pie', '1.0.0', config, loader);
    expect(loader).to.have.been.calledWithExactly({ name: 'pie', version: '1.0.0' }, 'env');
  });

  it('should load valid sn', async () => {
    const sn = { component: {} };
    const loader = () => sn;
    const s = await load('pie', '1.0.0', config, loader);
    expect(s).to.eql(sn);
  });

  it('should load only once', async () => {
    const sn = { component: {} };
    const loader = () => sn;
    const spy = sinon.spy(loader);
    load('pie', '1.0.0', config, spy);
    load('pie', '1.0.0', config, spy);
    load('pie', '1.0.0', config, spy);
    expect(spy.callCount).to.equal(1);
  });

  it('should fallback to global load() when custom loader is not provided', async () => {
    const sn = { component: {} };
    config.load.returns(sn);
    const s = await load('pie', '1.0.0', config);
    expect(s).to.eql(sn);
  });
});
