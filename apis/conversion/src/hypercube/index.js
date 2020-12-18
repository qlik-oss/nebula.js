import exportProperties from './export-properties';
import importProperties from './import-properties';

/**
 * @interface HyperCubeConversion
 */

export default /** @lends HyperCubeConversion */ {
  /**
   * Exports properties for a chart with a hypercube.
   *
   * @experimental
   * @param {Object} args
   * @param {Object} input.propertyTree
   * @param {string} imput.hypercubePath Reference to the qHyperCubeDef.
   * @returns {ExportFormat}
   */
  exportProperties: (ar) => exportProperties(ar),
  /**
   * Imports properties for a chart with a hypercube.
   *
   * @experimental
   * @param {Object} args
   * @param {ExportFormat} args.exportFormat The export object which is the output of exportProperties.
   * @param {Object=} args.initialProperties Initial properties of the target chart.
   * @param {Object=} args.dataDefinition Data definition of the target chart.
   * @param {Object=} args.defaultPropertyValues Default values for a number of properties of the target chart.
   * @param {string} args.hypercubePath Reference to the qHyperCubeDef.
   * @returns {Object} A properties tree
   */
  importProperties: (ar) => importProperties(ar),
};
