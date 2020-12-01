/* eslint-disable no-param-reassign */
/* eslint-disable no-prototype-builtins */

import utils from '../utils';
import helpers from '../helpers';

/**
 * Imports properties for a chart with a hypercube.
 *
 * @ignore
 * @param {ExportFormat} exportFormat The export object which is the output of exportProperties.
 * @param initialProperties Initial properties of the target chart.
 * @param dataDefinition Data definition of the target chart.
 * @param defaultPropertyValues Default values for a number of properties of the target chart.
 * @param hypercubePath Reference to the qHyperCubeDef.
 * @returns {Object} A properties tree
 */
export default function importProperties({
  exportFormat,
  initialProperties = {},
  dataDefinition = {},
  defaultPropertyValues = {},
  hypercubePath,
}) {
  const newPropertyTree = { qChildren: [] };
  const newProperties = helpers.createNewProperties({ exportFormat, initialProperties, hypercubePath });
  const initHyperCubeDef = utils.getValue(initialProperties, hypercubePath || '').qHyperCubeDef;
  const newHyperCubeDef = utils.getValue(newProperties, hypercubePath || '').qHyperCubeDef;
  const { maxDimensions, minDimensions, maxMeasures, minMeasures } = helpers.getMaxMinDimensionMeasure({
    exportFormat,
    dataDefinition,
  });
  const {
    defaultDimension = helpers.getDefaultDimension(),
    defaultMeasure = helpers.getDefaultMeasure(),
  } = defaultPropertyValues;

  // empty dimensions and measures of new hypercube
  newHyperCubeDef.qDimensions.length = 0;
  newHyperCubeDef.qMeasures.length = 0;

  // create layout exclude structures if needed
  if (helpers.shouldInitLayoutExclude({ exportFormat, maxDimensions, minDimensions, maxMeasures, minMeasures })) {
    helpers.initLayoutExclude({
      exportFormat,
      maxDimensions,
      minDimensions,
      maxMeasures,
      minMeasures,
      newHyperCubeDef,
    });
  }

  // and now fill them in.
  helpers.addDefaultDimensions({ exportFormat, maxDimensions, minDimensions, newHyperCubeDef, defaultDimension });
  helpers.addDefaultMeasures({ exportFormat, maxMeasures, minMeasures, newHyperCubeDef, defaultMeasure });

  helpers.setInterColumnSortOrder({ exportFormat, newHyperCubeDef });

  helpers.copyPropertyIfExist('qMaxStackedCells', initHyperCubeDef, newHyperCubeDef);
  helpers.copyPropertyIfExist('qNoOfLeftDims', initHyperCubeDef, newHyperCubeDef);

  helpers.copyPropertyOrSetDefault('qInitialDataFetch', initHyperCubeDef, newHyperCubeDef, [
    { qTop: 0, qLeft: 0, qWidth: 0, qHeight: 0 },
  ]);
  helpers.copyPropertyOrSetDefault('qMode', initHyperCubeDef, newHyperCubeDef, 'S');
  helpers.copyPropertyOrSetDefault('qReductionMode', initHyperCubeDef, newHyperCubeDef, 'N');
  helpers.copyPropertyOrSetDefault('qSortbyYValue', initHyperCubeDef, newHyperCubeDef);
  helpers.copyPropertyOrSetDefault('qIndentMode', initHyperCubeDef, newHyperCubeDef);
  helpers.copyPropertyOrSetDefault('qShowTotalsAbove', initHyperCubeDef, newHyperCubeDef);

  // always copy type and visualization
  helpers.importCommonProperties(newProperties, exportFormat, initialProperties);

  newPropertyTree.qProperty = newProperties;

  return newPropertyTree;
}
