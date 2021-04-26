import validatePlugins from '../plugins';

describe('get-object', () => {
  it('should throw when plugins is not an array', () => {
    const plugins = {};
    const validateFn = () => validatePlugins(plugins);
    expect(validateFn).to.throw('Invalid plugin format: plugins should be an array!');
  });

  it('should throw when plugin is not an object', () => {
    const plugins = ['blabla'];
    const validateFn = () => validatePlugins(plugins);
    expect(validateFn).to.throw('Invalid plugin format: a plugin should be an object');
  });

  it('should throw when plugin has no info object or name', () => {
    const plugins1 = [{}];
    const plugins2 = [{ info: {} }];
    expect(() => validatePlugins(plugins1)).to.throw(
      'Invalid plugin format: a plugin should have an info object containing a name'
    );
    expect(() => validatePlugins(plugins2)).to.throw(
      'Invalid plugin format: a plugin should have an info object containing a name'
    );
  });

  it('should throw when plugin has no "fn" function', () => {
    const plugins = [{ info: { name: 'blabla' } }];
    const validateFn = () => validatePlugins(plugins);
    expect(validateFn).to.throw('Invalid plugin format: The plugin "blabla" has no "fn" function');
  });
});
