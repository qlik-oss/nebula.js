/**
 * Used for exporting and importing properties between backend models. An object that exports to
 * ExportFormat should put dimensions and measures inside one data group. If an object has two hypercubes
 * each of the cubes should export dimensions and measures in two separate data groups.
 * An object that imports from this structure is responsible for putting the existing properties where they should be
 * in the new model.
 *
 * @param nDataGroups The number of hypercubes.
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
