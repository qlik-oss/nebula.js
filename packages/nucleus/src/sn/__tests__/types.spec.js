import { semverSort } from '../types';

describe('types', () => {
  describe('semverSort', () => {
    it('should sort versions', () => {
      const arr = semverSort(['1.41.0', '0.0.1', '10.4.0', '0.4.0', '1.4.0']);
      expect(arr).to.eql(['0.0.1', '0.4.0', '1.4.0', '1.41.0', '10.4.0']);
    });
  });

  describe('factory', () => {
    const mock = ({
      createType = () => ({}),
      clearFromCache = () => {},
    } = {}) => aw.mock([
      ['**/sn/type.js', () => createType],
      ['**/sn/load.js', () => ({
        clearFromCache,
      })],
    ], ['../types']);

    let c;
    let type;
    beforeEach(() => {
      type = sinon.stub();
      type.returns({});

      const [{ create }] = mock({
        createType: type,
      });
      c = create({ config: 'config' });
    });

    it('should instantiate a type when registering', () => {
      c.register({ name: 'pie', version: '1.0.3' }, 'opts');
      expect(type).to.have.been.calledWithExactly({
        name: 'pie',
        version: '1.0.3',
      }, 'config', 'opts');
    });

    it('should throw when registering an already registered version', () => {
      c.register({ name: 'pie', version: '1.0.3' }, 'opts');
      const fn = () => c.register({ name: 'pie', version: '1.0.3' }, 'opts');

      expect(fn).to.throw('Supernova \'pie@1.0.3\' already registered.');
    });

    it('should find 1.5.1 as matching version from properties', () => {
      const supportsPropertiesVersion = sinon.stub();
      supportsPropertiesVersion.withArgs('1.2.0').returns(true);

      type = ({ version }) => ({
        supportsPropertiesVersion: version === '1.5.1' ? supportsPropertiesVersion : () => false,
      });
      const [{ create }] = mock({
        createType: type,
      });
      c = create({ config: 'config' });

      c.register({ name: 'pie', version: '1.5.0' });
      c.register({ name: 'pie', version: '1.6.0' });
      c.register({ name: 'pie', version: '1.5.1' });
      c.register({ name: 'pie', version: '1.0.0' });

      const v = c.getSupportedVersion('pie', '1.2.0');
      expect(v).to.equal('1.5.1');
    });

    it('should return null when no fit is found', () => {
      const v = c.getSupportedVersion('pie', '1.2.0');
      expect(v).to.equal(null);
    });

    it('should return the requested type and version', () => {
      const [{ create }] = mock({
        createType: ({ name, version }) => ({ name, version }),
      });
      c = create({ config: 'config' });
      expect(c.get({ name: 'bar', version: '1.7.0' })).to.eql({ name: 'bar', version: '1.7.0' });
    });
  });
});
