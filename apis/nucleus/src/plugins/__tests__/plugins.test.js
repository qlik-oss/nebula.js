import validatePlugins from '../plugins';

describe('get-object', () => {
  test('should throw when plugins is not an array', () => {
    const plugins = {};
    const validateFn = () => validatePlugins(plugins);
    expect(validateFn).toThrow();
  });

  test('should throw when plugin is not an object', () => {
    const plugins = ['blabla'];
    const validateFn = () => validatePlugins(plugins);
    expect(validateFn).toThrow();
  });

  test('should throw when plugin has no info object or name', () => {
    const plugins1 = [{}];
    const plugins2 = [{ info: {} }];
    expect(() => validatePlugins(plugins1)).toThrow(
      'Invalid plugin format: a plugin should have an info object containing a name'
    );
    expect(() => validatePlugins(plugins2)).toThrow(
      'Invalid plugin format: a plugin should have an info object containing a name'
    );
  });

  test('should throw when plugin has no "fn" function', () => {
    const plugins = [{ info: { name: 'blabla' } }];
    const validateFn = () => validatePlugins(plugins);
    expect(validateFn).toThrow();
  });
});
