import exportProperties from './export-properties';
import importProperties from './import-properties';

/**
 * @interface hyperCubeConversion
 * @implements {ConversionType}
 */

export default /** @lends hyperCubeConversion */ {
  exportProperties: (ar) => exportProperties(ar),
  importProperties: (ar) => importProperties(ar),
};
