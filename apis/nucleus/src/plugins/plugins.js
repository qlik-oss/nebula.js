/**
 * An object literal containing meta information about the plugin and a function containing the plugin implementation.
 * @interface Plugin
 * @property {object} info Object that can hold various meta info about the plugin
 * @property {string} info.name The name of the plugin
 * @property {function} fn The implementation of the plugin. Input and return value is up to the plugin implementation to decide based on its purpose.
 * @experimental
 * @since 1.2.0
 * @example
 * const plugin = {
 *   info: {
 *     name: "example-plugin",
 *     type: "meta-type",
 *   },
 *   fn: () => {
 *     // Plugin implementation goes here
 *   }
 * };
 */

export default function validatePlugins(plugins) {
  if (!Array.isArray(plugins)) {
    throw new Error('Invalid plugin format: plugins should be an array!');
  }
  plugins.forEach((p) => {
    if (typeof p !== 'object') {
      throw new Error('Invalid plugin format: a plugin should be an object');
    }
    if (typeof p.info !== 'object' || typeof p.info.name !== 'string') {
      throw new Error('Invalid plugin format: a plugin should have an info object containing a name');
    }
    if (typeof p.fn !== 'function') {
      throw new Error(`Invalid plugin format: The plugin "${p.info.name}" has no "fn" function`);
    }
  });
}
