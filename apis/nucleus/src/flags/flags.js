export default function (flags = {}) {
  /**
   * @interface Flags
   */

  return /** @lends Flags */ {
    /**
     * Checks whether the specified flag is enabled.
     * @param {string} flag - The value flag to check.
     * @returns {boolean} True if the specified flag is enabled, false otherwise.
     */
    isEnabled: (f) => flags[f] === true,
  };
}
