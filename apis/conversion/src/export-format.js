/**
 * Used for exporting and importing properties between backend models. An object that exports to
 * ExportFormat should put dimensions and measures inside one data group. If an object has two hypercubes
 * each of the cubes should export dimensions and measures in two separate data groups.
 * An object that imports from this structure is responsible for putting the existing properties where they should be
 * in the new model.
 * @interface ExportFormat
 * @experimental
 * @since 1.1.0
 * @property {(ExportDataDef[])=} data
 * @property {object=} properties
 */

/**
 * @experimental
 * @since 1.1.0
 * @interface ExportDataDef
 * @property {qae.NxDimension[]} dimensions
 * @property {qae.NxMeasure[]} measures
 * @property {qae.NxDimension[]} excludedDimensions
 * @property {qae.NxMeasure[]} excludedMeasures
 * @property {number[]} interColumnSortOrder
 */

/**
 * @experimental
 * @since 1.1.0
 * @ignore
 * @param {number} nDataGroups
 * @return {ExportFormat}
 */
function createExportFormat(nDataGroups = 1) {
  const exportFormat = {
    data: [],
    properties: {},
  };

  for (let i = 0; i < nDataGroups; ++i) {
    exportFormat.data.push({
      dimensions: [],
      measures: [],
      excludedDimensions: [],
      excludedMeasures: [],
      interColumnSortOrder: [],
    });
  }
  return exportFormat;
}

export default createExportFormat;
