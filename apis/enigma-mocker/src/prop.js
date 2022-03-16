/**
 * Get value for a fixture property.
 *
 * The value is either static (e.g. pass a string / object / similar) or dynamic when passing a function.
 *
 * It falls back to the default value in case the fixture has no value specified.
 *
 * Example
 * ```js
 * const fixture = {
 *  id: 'grid-chart-1',
 * };
 * const app = {
 *   id: getValue(fixture.id, { defaultValue: 'object-id-${+Date.now()}'}),
 * }
 * ```
 *
 * @param {any} prop Fixture property. Either a fixed value (string / object / boolean / ...) or a function invoked when the value is needed.
 * @param {object} options Options.
 * @param {Array<any>} options.args Arguments used to evaluate the property value.
 * @param {any} options.defaultValue Default value in case not value is defined in fixture.
 * @returns The property value.
 */
export const getPropValue = (prop, { args = [], defaultValue } = {}) => {
  if (typeof prop === 'function') {
    return prop(...args);
  }
  if (prop !== undefined) {
    return prop;
  }
  return defaultValue;
};

/**
 * Get function for a fixture property.
 *
 * When the returned function is invoked it resolves the value - using `defaultValue` as fallback - and returns it. The value is returned as a promise if `option.usePromise` is `true`.
 *
 * Example:
 * ```js
 * const fixture = {
 *   getHyperCubeData(path, page) {
 *     return [ ... ];
 *   }
 * }
 * const app = {
 *   getHyperCubeData: getPropFn(fixture.getHyperCubeData, { defaultValue: [], usePromise: true })
 * };
 * ```
 *
 * @param {any} prop Fixture property. Either a fixed value (string / object / boolean / ...) or a function invoked when the value is needed.
 * @param {object} options Options.
 * @param {any} options.defaultValue Default value in case not value is defined in fixture.
 * @param {boolean} options.async When `true` the returns value is wrapped in a promise, otherwise the value is directly returned.
 * @returns A fixture property function
 */
export const getPropFn =
  (prop, { defaultValue, async = true } = {}) =>
  (...args) => {
    const value = getPropValue(prop, { defaultValue, args });
    return async ? Promise.resolve(value) : value;
  };
