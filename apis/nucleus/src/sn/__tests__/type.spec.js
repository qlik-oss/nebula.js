const mock = ({ SNFactory = () => ({}), satisfies = () => false, load = () => null } = {}) =>
  aw.mock(
    [
      ['**/dist/supernova.js', () => SNFactory],
      ['**/semver.js', () => ({ satisfies })],
      ['**/load.js', () => ({ load })],
    ],
    ['../type']
  );

describe('type', () => {
  let c;
  let SNFactory;
  let load;
  let satisfies;
  let create;
  let sb;
  before(() => {
    sb = sinon.createSandbox();
    SNFactory = sb.stub();
    load = sb.stub();
    satisfies = sb.stub();
    [{ default: create }] = mock({ SNFactory, load, satisfies });
  });
  beforeEach(() => {
    c = create({ name: 'pie', version: '1.1.0' }, 'c', { load: 'customLoader' });
  });
  afterEach(() => {
    sb.reset();
  });

  describe('create', () => {
    it('should instantiate a type', () => {
      expect(c.name).to.equal('pie');
      expect(c.version).to.equal('1.1.0');
    });
  });

  describe('supportsPropertiesVersion', () => {
    beforeEach(() => {
      satisfies.returns('a bool');
    });

    it('should return true when no meta is provided', () => {
      const cc = create({});
      expect(cc.supportsPropertiesVersion('1.2.0')).to.equal(true);
    });

    it('should return true when no version is provided', () => {
      const c3 = create({}, 'c', { meta: { deps: { properties: 'a' } } });
      expect(c3.supportsPropertiesVersion()).to.equal(true);
    });

    it('should return semver satisfaction when version and semver range is provided ', () => {
      const cc = create({}, 'c', { meta: { deps: { properties: '^1.0.0' } } });
      expect(cc.supportsPropertiesVersion('1.2.0')).to.equal('a bool');
    });
  });

  describe('supernova()', () => {
    it('should load a supernova definition and return a supernova', async () => {
      const def = Promise.resolve('def');
      const normalized = { qae: { properties: {} } };

      load.withArgs('pie', '1.1.0', 'c', 'customLoader').returns(def);
      SNFactory.withArgs('def').returns(normalized);

      const sn = await c.supernova();
      expect(sn).to.equal(normalized);
    });
  });

  describe('initialProperties()', () => {
    it('should return initial props', async () => {
      const def = Promise.resolve('def');
      const normalized = { qae: { properties: { initial: { a: 'a', b: 'b' } } } };

      load.withArgs('pie', '1.1.0', 'c', 'customLoader').returns(def);
      SNFactory.withArgs('def').returns(normalized);

      const props = await c.initialProperties({ c: 'c', b: 'override' });
      expect(props).to.eql({
        qInfo: { qType: 'pie' },
        visualization: 'pie',
        version: '1.1.0',
        a: 'a',
        b: 'override',
        c: 'c',
        showTitles: true,
      });
    });
  });
});
